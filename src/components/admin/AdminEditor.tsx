"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  compressImageFile,
  optimizeImageUrl,
  formatVideoEmbedUrl,
} from "@/lib/mediaOptimizer";
import OptimizedImage from "@/components/common/OptimizedImage";
import PromptModal, { PromptModalProps } from "@/components/common/PromptModal";
import ImageUploadModal from "@/components/common/ImageUploadModal";
import { BlogBlock } from "@/components/blog/ArticleBody";

// Helper to convert legacy Markdown to HTML for initial block load
function mdToHtml(str?: string): string {
  if (!str) return "";
  return str
    .replace(
      /!\[(.*?)\]\((.*?)\)/g,
      '<img src="$2" alt="$1" class="my-3 max-h-[420px] max-w-full rounded-xl object-cover block mx-auto shadow-lg" />'
    )
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)([^\*]+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#4cd7f6] hover:underline">$1</a>'
    );
}

// Clean redundant/nested align tags if present
function cleanAlignTags(str?: string): string {
  if (!str) return "";
  let cleaned = str;
  while (/<div align="(?:left|center|right)"[^>]*>([\s\S]*?)<\/div>/i.test(cleaned)) {
    cleaned = cleaned.replace(
      /<div align="(?:left|center|right)"[^>]*>([\s\S]*?)<\/div>/gi,
      "$1"
    );
  }
  cleaned = cleaned
    .replace(/<div align="(?:left|center|right)"[^>]*>/gi, "")
    .replace(/<\/div>/gi, "");
  return cleaned;
}

// Helper to clean pasted HTML
function cleanPastedHtml(html: string): string {
  if (!html) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove meta, style, script, link tags
    doc.querySelectorAll("meta, style, script, link").forEach((el) => el.remove());

    // Unwrap or clean legacy <font> tags
    doc.querySelectorAll("font").forEach((fontEl) => {
      const parent = fontEl.parentNode;
      if (parent) {
        while (fontEl.firstChild) {
          parent.insertBefore(fontEl.firstChild, fontEl);
        }
        parent.removeChild(fontEl);
      }
    });

    const allElements = doc.body.querySelectorAll("*");
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      // 1. Remove background color and background styles
      htmlEl.style.backgroundColor = "";
      htmlEl.style.background = "";
      htmlEl.style.backgroundImage = "";
      htmlEl.style.backgroundClip = "";
      htmlEl.removeAttribute("bgcolor");

      // 2. Remove ALL text colors completely
      htmlEl.style.color = "";
      htmlEl.removeAttribute("color");

      // 3. Remove default document font-family, font-size, and line-height overrides
      htmlEl.style.fontFamily = "";
      htmlEl.style.fontSize = "";
      htmlEl.style.lineHeight = "";

      // 4. Remove MS Word / Google Docs specific classes
      if (htmlEl.className) {
        const cleanedClass = htmlEl.className
          .split(" ")
          .filter(
            (c) =>
              !c.startsWith("Mso") &&
              !c.startsWith("docs-") &&
              !c.startsWith("Apple-")
          )
          .join(" ");
        if (cleanedClass) {
          htmlEl.className = cleanedClass;
        } else {
          htmlEl.removeAttribute("class");
        }
      }

      // 5. Ensure all images and figures are automatically centered
      if (htmlEl.tagName.toLowerCase() === "img") {
        htmlEl.className =
          "my-3 max-h-[420px] max-w-full rounded-xl object-cover block mx-auto shadow-lg text-center";
        htmlEl.removeAttribute("align");
      }
      if (htmlEl.tagName.toLowerCase() === "figure") {
        htmlEl.className = "my-4 text-center block mx-auto";
        htmlEl.removeAttribute("align");
      }

      // Remove style attribute if empty
      if (!htmlEl.getAttribute("style") || htmlEl.getAttribute("style")?.trim() === "") {
        htmlEl.removeAttribute("style");
      }
    });

    return doc.body.innerHTML || html;
  } catch {
    return html;
  }
}

// Rich WYSIWYG ContentEditable Block Component
interface RichEditableBlockProps {
  html: string;
  onChange: (newHtml: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onSelectionChange?: (e: React.SyntheticEvent) => void;
  onPasteImage?: (file: File) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  inputRef?: React.RefCallback<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  blockId?: string;
}

function RichEditableBlock({
  html,
  onChange,
  onFocus,
  onBlur,
  onSelectionChange,
  onPasteImage,
  placeholder,
  className = "",
  style = {},
  inputRef,
  onKeyDown,
  blockId,
}: RichEditableBlockProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (inputRef) {
      if (typeof inputRef === "function") {
        inputRef(innerRef.current);
      } else {
        inputRef.current = innerRef.current;
      }
    }
  }, [inputRef]);

  // Sync content when changed from outside
  useEffect(() => {
    if (innerRef.current) {
      const current = innerRef.current.innerHTML;
      const target = html || "";
      if (current !== target) {
        innerRef.current.innerHTML = target;
      }
    }
  }, [html]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposingRef.current) return;
    const newHtml = e.currentTarget.innerHTML;
    const isCleanEmpty =
      !newHtml || newHtml === "<br>" || newHtml === "<p><br></p>";
    onChange(isCleanEmpty ? "" : newHtml);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // 1. Check if an image file is in clipboard
    const items = clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file && onPasteImage) {
            e.preventDefault();
            onPasteImage(file);
            return;
          }
        }
      }
    }

    const htmlData = clipboardData.getData("text/html");
    const plainText = clipboardData.getData("text/plain");

    e.preventDefault();
    if (htmlData && htmlData.trim()) {
      const cleanHtml = cleanPastedHtml(htmlData);
      document.execCommand("insertHTML", false, cleanHtml);
    } else if (plainText) {
      document.execCommand("insertText", false, plainText);
    }

    if (innerRef.current) {
      const newHtml = innerRef.current.innerHTML;
      const isCleanEmpty =
        !newHtml || newHtml === "<br>" || newHtml === "<p><br></p>";
      onChange(isCleanEmpty ? "" : newHtml);
    }
  };

  return (
    <div
      ref={innerRef}
      contentEditable
      suppressContentEditableWarning
      data-block-id={blockId}
      onInput={handleInput}
      onCompositionStart={() => {
        isComposingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        isComposingRef.current = false;
        handleInput(e);
      }}
      onPaste={handlePaste}
      onKeyDown={onKeyDown}
      onFocus={(e) => {
        onFocus?.(e);
        onSelectionChange?.(e);
      }}
      onBlur={(e) => {
        onBlur?.(e);
      }}
      onKeyUp={onSelectionChange}
      onMouseUp={onSelectionChange}
      onSelect={onSelectionChange}
      className={`${className} outline-none cursor-text`}
      style={style}
      data-placeholder={placeholder}
    />
  );
}

// Convert File to Base64
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Interactive Resizable Image Block Component
interface ResizableImageBlockProps {
  block: BlogBlock;
  onUpdate: (updates: Partial<BlogBlock>) => void;
  onDelete: () => void;
  onReplace: () => void;
  onPaste?: () => void;
}

function ResizableImageBlock({
  block,
  onUpdate,
  onDelete,
  onReplace,
  onPaste,
}: ResizableImageBlockProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialWidthPx, setInitialWidthPx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentWidth = block.width || "100%";
  const currentAlign = block.align || "center";

  // Handle Drag to Resize width
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStartX(e.clientX);
    if (containerRef.current) {
      setInitialWidthPx(containerRef.current.offsetWidth);
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const parentWidth =
        containerRef.current.parentElement?.offsetWidth || window.innerWidth;
      const deltaX = (e.clientX - dragStartX) * 2;
      const newPx = Math.max(120, Math.min(parentWidth, initialWidthPx + deltaX));
      const percentage = Math.round((newPx / parentWidth) * 100);
      const clampedPercent = Math.max(20, Math.min(100, percentage));
      onUpdate({ width: `${clampedPercent}%` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, dragStartX, initialWidthPx, onUpdate]);

  const alignClass =
    currentAlign === "left"
      ? "mr-auto items-start text-left"
      : currentAlign === "right"
      ? "ml-auto items-end text-right"
      : "mx-auto items-center text-center";

  return (
    <div
      className={`my-6 max-w-full flex flex-col ${alignClass} group/img relative transition-all duration-200`}
      style={{ width: currentWidth }}
      ref={containerRef}
    >
      {/* Main Image Container */}
      <div className="relative w-full rounded-2xl overflow-hidden group/preview">
        <OptimizedImage
          src={block.url}
          alt={block.caption || "Ảnh minh họa WebP"}
          sizes="(max-width: 768px) 100vw, 1000px"
          containerClassName="w-full max-h-[520px] rounded-2xl"
          className="w-full max-h-[520px] object-cover rounded-2xl block mx-auto transition-transform duration-500 hover:scale-[1.005]"
        />

        {/* Action Buttons (top right on hover) */}
        <div className="absolute top-3 right-3 opacity-0 group-hover/preview:opacity-100 flex items-center gap-1.5 backdrop-blur-md bg-slate-900/80 p-1 rounded-xl shadow-md transition-all z-10">
          {onPaste && (
            <button
              type="button"
              onClick={onPaste}
              className="p-1.5 rounded-lg text-purple-300 hover:bg-purple-600 hover:text-white transition-all active:scale-95"
              title="Dán ảnh thay thế từ clipboard (Ctrl+V)"
            >
              <span className="material-symbols-outlined text-[16px]">
                content_paste
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onReplace}
            className="p-1.5 rounded-lg text-sky-300 hover:bg-sky-600 hover:text-white transition-all active:scale-95"
            title="Đổi ảnh từ máy tính"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
            title="Xóa ảnh"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>

        {/* Corner Drag Resize Handle (Bottom-Right) */}
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-black/70 hover:bg-[#ff5167] text-white flex items-center justify-center cursor-nwse-resize shadow-md backdrop-blur-md opacity-0 group-hover/preview:opacity-100 transition-opacity z-10"
          title="Kéo để thay đổi kích thước ảnh"
        >
          <span className="material-symbols-outlined text-[14px]">drag_pan</span>
        </div>
      </div>

      {/* Caption Input */}
      <div className="w-full mt-2 text-center">
        <input
          value={block.caption || ""}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          className="w-full text-center bg-transparent text-xs text-slate-500 dark:text-[#a898be] italic outline-none hover:text-slate-700 dark:hover:text-[#e8dff1] focus:text-sky-600 dark:focus:text-[#4cd7f6] transition-colors"
          placeholder="Nhập chú thích ảnh (.webp)..."
        />
      </div>
    </div>
  );
}

// Interactive Resizable Column Image Component
interface ColumnImageResizableProps {
  imageUrl?: string;
  caption?: string;
  imageHeight?: string;
  onUpdate: (updates: { height?: string; caption?: string }) => void;
  onUploadClick: () => void;
  onPasteClick?: () => void;
  onDelete: () => void;
}

function ColumnImageResizable({
  imageUrl,
  caption,
  imageHeight,
  onUpdate,
  onUploadClick,
  onPasteClick,
  onDelete,
}: ColumnImageResizableProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [initialHeightPx, setInitialHeightPx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCustomPx = Boolean(
    imageHeight && typeof imageHeight === "string" && imageHeight.includes("px")
  );
  const currentRatio =
    !imageHeight || imageHeight === "auto" ? "auto" : imageHeight;

  const getContainerStyle = (): React.CSSProperties => {
    if (isCustomPx) return { height: imageHeight };
    if (imageHeight === "16:9") return { aspectRatio: "16/9" };
    if (imageHeight === "4:3") return { aspectRatio: "4/3" };
    if (imageHeight === "1:1") return { aspectRatio: "1/1" };
    return { aspectRatio: "4/3" };
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStartY(e.clientY);
    if (containerRef.current) {
      setInitialHeightPx(containerRef.current.offsetHeight);
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY;
      const newHeight = Math.max(100, Math.min(800, initialHeightPx + deltaY));
      onUpdate({ height: `${newHeight}px` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, dragStartY, initialHeightPx, onUpdate]);

  return (
    <div className="relative group/colimg flex flex-col items-center w-full">
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden transition-all duration-200"
        style={getContainerStyle()}
      >
        <OptimizedImage
          src={imageUrl}
          alt={caption || "Ảnh cột"}
          containerClassName="w-full h-full rounded-2xl"
          className="w-full h-full object-cover rounded-2xl block mx-auto"
        />

        {/* Action & Aspect Ratio Controls Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/colimg:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              onClick={onUploadClick}
              className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md active:scale-95 transition-all"
              title="Đổi ảnh từ máy tính"
            >
              <span className="material-symbols-outlined text-[14px]">upload</span>
              <span>Đổi</span>
            </button>
            {onPasteClick && (
              <button
                type="button"
                onClick={onPasteClick}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md active:scale-95 transition-all"
                title="Dán ảnh từ bộ nhớ tạm (Clipboard / Ctrl+V)"
              >
                <span className="material-symbols-outlined text-[14px]">
                  content_paste
                </span>
                <span>Dán</span>
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs shadow-md active:scale-95 transition-all"
              title="Xóa ảnh"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
            </button>
          </div>

          {/* Quick Aspect Ratio Presets */}
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 text-[10px] text-white">
            <button
              type="button"
              onClick={() => onUpdate({ height: "auto" })}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                currentRatio === "auto" && !isCustomPx
                  ? "bg-rose-500 text-white"
                  : "hover:bg-white/20 text-slate-200"
              }`}
              title="Tự động cân đối tỷ lệ"
            >
              Tự động
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ height: "4:3" })}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                currentRatio === "4:3"
                  ? "bg-rose-500 text-white"
                  : "hover:bg-white/20 text-slate-200"
              }`}
              title="Tỷ lệ 4:3"
            >
              4:3
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ height: "16:9" })}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                currentRatio === "16:9"
                  ? "bg-rose-500 text-white"
                  : "hover:bg-white/20 text-slate-200"
              }`}
              title="Tỷ lệ 16:9"
            >
              16:9
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ height: "1:1" })}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                currentRatio === "1:1"
                  ? "bg-rose-500 text-white"
                  : "hover:bg-white/20 text-slate-200"
              }`}
              title="Tỷ lệ vuông 1:1"
            >
              1:1
            </button>
            {isCustomPx && (
              <button
                type="button"
                onClick={() => onUpdate({ height: "auto" })}
                className="px-1.5 py-0.5 rounded font-medium text-amber-300 hover:bg-white/20 flex items-center gap-0.5"
                title="Khôi phục về tỷ lệ tự động"
              >
                <span className="material-symbols-outlined text-[11px]">
                  restart_alt
                </span>
                <span>{imageHeight}</span>
              </button>
            )}
          </div>
        </div>

        {/* Drag Resize Handle */}
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-black/70 hover:bg-[#ff5167] text-white flex items-center justify-center cursor-ns-resize shadow-md backdrop-blur-md opacity-0 group-hover/colimg:opacity-100 transition-opacity z-20"
          title="Kéo lên/xuống để chỉnh chiều cao ảnh"
        >
          <span className="material-symbols-outlined text-[14px]">height</span>
        </div>
      </div>
    </div>
  );
}

const LINE_HEIGHT_OPTIONS = [
  { label: "Mặc định (1.6)", value: "1.6" },
  { label: "Chặt chẽ (1.2)", value: "1.2" },
  { label: "Vừa phải (1.4)", value: "1.4" },
  { label: "Thoáng đãng (1.8)", value: "1.8" },
  { label: "Rất rộng (2.0)", value: "2.0" },
];

export interface BlogPostData {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  content: string; // JSON blocks string or formatted text
  blocks?: BlogBlock[];
  thumbnail?: string;
  coverImage?: string;
  category: string;
  author?: string;
  authorName?: string;
  tags?: string[];
  status?: "Draft" | "Published" | "Archived";
  isPublic?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaDesc?: string;
}

export interface AdminEditorProps {
  postToEdit?: BlogPostData;
  onSave?: (data: BlogPostData) => Promise<void> | void;
  onExit?: () => void;
  isEdit?: boolean;
}

export default function AdminEditor({
  postToEdit,
  onSave,
  onExit,
}: AdminEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const columnFileInputRef = useRef<HTMLInputElement>(null);
  const replaceImageFileInputRef = useRef<HTMLInputElement>(null);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);

  const [replaceTargetBlockId, setReplaceTargetBlockId] = useState<string | null>(null);
  const [columnUploadTarget, setColumnUploadTarget] = useState<{
    blockId: string;
    side: "left" | "right";
  } | null>(null);

  const targetBlockIndexRef = useRef<number | null>(null);
  const lastActiveIndexRef = useRef<number>(0);
  const savedSelectionRef = useRef<Range | null>(null);

  // Document Fields
  const [title, setTitle] = useState(postToEdit?.title || "");
  const [summary, setSummary] = useState(
    postToEdit?.summary || postToEdit?.excerpt || ""
  );
  const [category, setCategory] = useState(
    postToEdit?.category || "Nail Tutorials & Care"
  );
  const [authorName, setAuthorName] = useState(
    postToEdit?.authorName || postToEdit?.author || "X-ON Nail Artist"
  );
  const [coverImage, setCoverImage] = useState(
    postToEdit?.coverImage || postToEdit?.thumbnail || ""
  );
  const [slug, setSlug] = useState(postToEdit?.slug || "");
  const [metaDesc, setMetaDesc] = useState(
    postToEdit?.metaDesc || postToEdit?.seoDescription || ""
  );
  const [tags, setTags] = useState<string[]>(postToEdit?.tags || []);
  const [newTagInput, setNewTagInput] = useState("");

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("xon_custom_categories");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Initial Blocks
  const getInitialBlocks = useCallback((): BlogBlock[] => {
    if (
      postToEdit?.blocks &&
      Array.isArray(postToEdit.blocks) &&
      postToEdit.blocks.length > 0
    ) {
      return postToEdit.blocks.map((b) => {
        if (b.type === "columns") {
          return {
            ...b,
            leftText: mdToHtml(cleanAlignTags(b.leftText || "")),
            rightText: mdToHtml(cleanAlignTags(b.rightText || "")),
          };
        }
        let text = b.text || "";
        if (/<div align=/i.test(text)) {
          text = cleanAlignTags(text);
        }
        return { ...b, text: mdToHtml(text) };
      });
    }

    if (postToEdit?.content) {
      try {
        const parsed = JSON.parse(postToEdit.content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
          return parsed;
        }
      } catch {
        // Plain text or markdown
        return [
          {
            id: `block-init-${Date.now()}`,
            type: "paragraph",
            text: mdToHtml(postToEdit.content),
          },
        ];
      }
    }

    return [{ id: `block-init-${Date.now()}`, type: "paragraph", text: "" }];
  }, [postToEdit]);

  const [blocks, setBlocks] = useState<BlogBlock[]>(getInitialBlocks);
  const [isPublic, setIsPublic] = useState(
    postToEdit?.status !== undefined
      ? postToEdit.status === "Published"
      : true
  );

  // History State
  const [history, setHistory] = useState<BlogBlock[][]>([getInitialBlocks()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = (newBlocks: BlogBlock[]) => {
    setBlocks(newBlocks);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setBlocks(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setBlocks(history[newIdx]);
    }
  };

  // Focus & Toolbar State
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [isStrikethroughActive, setIsStrikethroughActive] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState("16");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [selectedLineHeight, setSelectedLineHeight] = useState("1.6");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [customColorHex, setCustomColorHex] = useState("#ff5167");
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [promptModal, setPromptModal] = useState<PromptModalProps>({
    isOpen: false,
    title: "",
    description: "",
    placeholder: "",
    defaultValue: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy bỏ",
    icon: "link",
    iconColor: "sky",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const openPrompt = (props: Partial<PromptModalProps>) => {
    setPromptModal({
      isOpen: true,
      title: props.title || "Nhập thông tin",
      description: props.description || "",
      placeholder: props.placeholder || "https://...",
      defaultValue: props.defaultValue || "",
      confirmText: props.confirmText || "Xác nhận",
      cancelText: props.cancelText || "Hủy bỏ",
      icon: props.icon || "link",
      iconColor: props.iconColor || "sky",
      onConfirm: (val: string) => {
        setPromptModal((prev) => ({ ...prev, isOpen: false }));
        props.onConfirm?.(val);
      },
      onCancel: () => {
        setPromptModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Cover image upload
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Upload image handler to /api/upload
  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1600,
        quality: 0.85,
      });
      const formData = new FormData();
      formData.append("file", compressed.blob, file.name || "image.webp");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          return json.data.url;
        }
      }
      // fallback to base64
      return compressed.base64;
    } catch {
      return await readFileAsBase64(file);
    }
  };

  // Block Manipulation Handlers
  const addBlock = (type: BlogBlock["type"], targetIdx?: number) => {
    const idx = targetIdx !== undefined ? targetIdx : blocks.length;
    let newBlock: BlogBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
    };

    if (type === "heading") {
      newBlock.text = "";
      newBlock.align = "left";
    } else if (type === "paragraph") {
      newBlock.text = "";
      newBlock.align = "left";
    } else if (type === "quote") {
      newBlock.text = "";
      newBlock.author = "";
    } else if (type === "list") {
      newBlock.listType = "bullet";
      newBlock.items = [""];
    } else if (type === "table") {
      newBlock.headers = ["Tiêu đề 1", "Tiêu đề 2", "Tiêu đề 3"];
      newBlock.rows = [
        ["Dữ liệu 1", "Dữ liệu 2", "Dữ liệu 3"],
        ["Dữ liệu 4", "Dữ liệu 5", "Dữ liệu 6"],
      ];
    } else if (type === "code") {
      newBlock.code = "";
    } else if (type === "columns") {
      newBlock.layout = "50-50";
      newBlock.leftType = "text";
      newBlock.leftText = "";
      newBlock.rightType = "text";
      newBlock.rightText = "";
    }

    const nextBlocks = [...blocks];
    nextBlocks.splice(idx, 0, newBlock);
    pushHistory(nextBlocks);
    setFocusedBlockId(newBlock.id || null);
  };

  const updateBlock = (blockId: string, updates: Partial<BlogBlock>) => {
    const next = blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
    setBlocks(next);
  };

  const deleteBlock = (blockId: string) => {
    if (blocks.length <= 1) {
      setBlocks([{ id: `block-${Date.now()}`, type: "paragraph", text: "" }]);
      return;
    }
    const next = blocks.filter((b) => b.id !== blockId);
    pushHistory(next);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    pushHistory(next);
  };

  // Text formatting
  const executeCommand = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    updateToolbarActiveStates();
  };

  const updateToolbarActiveStates = () => {
    try {
      setIsBoldActive(document.queryCommandState("bold"));
      setIsItalicActive(document.queryCommandState("italic"));
      setIsUnderlineActive(document.queryCommandState("underline"));
      setIsStrikethroughActive(document.queryCommandState("strikeThrough"));
    } catch {
      // ignore
    }
  };

  // Handle image upload from computer
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageToServer(file);
      const newBlock: BlogBlock = {
        id: `img-${Date.now()}`,
        type: "image",
        url,
        caption: "",
        width: "100%",
        align: "center",
      };
      const idx =
        targetBlockIndexRef.current !== null
          ? targetBlockIndexRef.current + 1
          : blocks.length;
      const next = [...blocks];
      next.splice(idx, 0, newBlock);
      pushHistory(next);
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const url = await uploadImageToServer(file);
      setCoverImage(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  // Save document
  const handleSaveDocument = async () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    setIsSaving(true);
    try {
      const finalSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

      const payload: BlogPostData = {
        id: postToEdit?.id,
        title: title.trim(),
        slug: finalSlug,
        summary: summary.trim(),
        excerpt: summary.trim(),
        content: JSON.stringify(blocks),
        blocks,
        thumbnail: coverImage || "/images/IMG_7098.webp",
        coverImage: coverImage || "/images/IMG_7098.webp",
        category,
        author: authorName,
        authorName,
        tags,
        status: isPublic ? "Published" : "Draft",
        isPublic,
        seoTitle: title.trim(),
        seoDescription: metaDesc || summary.trim(),
        metaDesc: metaDesc || summary.trim(),
      };

      if (onSave) {
        await onSave(payload);
      }
    } catch (err) {
      console.error("Save error", err);
      alert("Có lỗi xảy ra khi lưu bài viết.");
    } finally {
      setIsSaving(false);
    }
  };

  // Metrics
  const fullText = `${title} ${summary} ${blocks
    .map((b) =>
      b.type === "columns"
        ? `${b.leftText || ""} ${b.rightText || ""}`
        : b.text || ""
    )
    .join(" ")}`
    .replace(/<[^>]+>/g, "")
    .trim();
  const wordCount = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = wordCount > 0 ? (wordCount / 200).toFixed(1) : "0";
  const headingsCount = blocks.filter((b) => b.type === "heading").length;
  const imageBlocksCount =
    blocks.filter((b) => b.type === "image").length + (coverImage ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#100c18] text-slate-900 dark:text-[#e8dff1] transition-colors pb-20">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileSelect}
      />
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={replaceImageFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !replaceTargetBlockId) return;
          const url = await uploadImageToServer(file);
          updateBlock(replaceTargetBlockId, { url });
          setReplaceTargetBlockId(null);
          if (replaceImageFileInputRef.current)
            replaceImageFileInputRef.current.value = "";
        }}
      />
      <input
        ref={columnFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !columnUploadTarget) return;
          const url = await uploadImageToServer(file);
          const { blockId, side } = columnUploadTarget;
          if (side === "left") {
            updateBlock(blockId, { leftImageUrl: url, leftType: "image" });
          } else {
            updateBlock(blockId, { rightImageUrl: url, rightType: "image" });
          }
          setColumnUploadTarget(null);
          if (columnFileInputRef.current) columnFileInputRef.current.value = "";
        }}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#15111d]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#2c2835] px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                <span className="hidden sm:inline">Quay lại</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#a898be]">
                Trình soạn thảo bài viết Rich Editor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo / Redo */}
            <div className="flex items-center bg-slate-100 dark:bg-[#1f1a29] rounded-xl p-1 border border-slate-200 dark:border-[#2c2835]">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors"
                title="Hoàn tác (Undo)"
              >
                <span className="material-symbols-outlined text-[18px]">undo</span>
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors"
                title="Làm lại (Redo)"
              >
                <span className="material-symbols-outlined text-[18px]">redo</span>
              </button>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveDocument}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">
                  publish
                </span>
              )}
              <span>{isPublic ? "Xuất bản bài viết" : "Lưu bản nháp"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor Body & Toolbar */}
        <main className="lg:col-span-8 space-y-6">
          {/* Universal Rich Floating Toolbar */}
          <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#1a1524]/95 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-slate-200 dark:border-[#2c2835] flex items-center gap-1.5 flex-wrap">
            {/* Inline Formatting */}
            <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-[#2c2835]">
              <button
                type="button"
                onClick={() => executeCommand("bold")}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBoldActive
                    ? "bg-rose-500/20 text-rose-600 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title="In đậm (Bold)"
              >
                <span className="material-symbols-outlined text-[18px]">
                  format_bold
                </span>
              </button>
              <button
                type="button"
                onClick={() => executeCommand("italic")}
                className={`p-1.5 rounded-lg transition-colors ${
                  isItalicActive
                    ? "bg-rose-500/20 text-rose-600"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title="In nghiêng (Italic)"
              >
                <span className="material-symbols-outlined text-[18px]">
                  format_italic
                </span>
              </button>
              <button
                type="button"
                onClick={() => executeCommand("underline")}
                className={`p-1.5 rounded-lg transition-colors ${
                  isUnderlineActive
                    ? "bg-rose-500/20 text-rose-600"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title="Gạch chân (Underline)"
              >
                <span className="material-symbols-outlined text-[18px]">
                  format_underlined
                </span>
              </button>
              <button
                type="button"
                onClick={() => executeCommand("strikeThrough")}
                className={`p-1.5 rounded-lg transition-colors ${
                  isStrikethroughActive
                    ? "bg-rose-500/20 text-rose-600"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title="Gạch ngang chữ"
              >
                <span className="material-symbols-outlined text-[18px]">
                  strikethrough_s
                </span>
              </button>
            </div>

            {/* Alignments */}
            <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-[#2c2835]">
              <button
                type="button"
                onClick={() => {
                  setTextAlign("left");
                  executeCommand("justifyLeft");
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  textAlign === "left"
                    ? "bg-rose-500/20 text-rose-600"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title="Căn trái"
              >
                <span className="material-symbols-outlined text-[18px]">
                  format_align_left
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTextAlign("center");
                  executeCommand("justifyCenter");
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  textAlign === "center"
                    ? "bg-rose-500/20 text-rose-600"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title="Căn giữa"
              >
                <span className="material-symbols-outlined text-[18px]">
                  format_align_center
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTextAlign("right");
                  executeCommand("justifyRight");
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  textAlign === "right"
                    ? "bg-rose-500/20 text-rose-600"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title="Căn phải"
              >
                <span className="material-symbols-outlined text-[18px]">
                  format_align_right
                </span>
              </button>
            </div>

            {/* Insert Link & Media */}
            <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-[#2c2835]">
              <button
                type="button"
                onClick={() => {
                  openPrompt({
                    title: "Chèn liên kết (Hyperlink)",
                    placeholder: "https://example.com...",
                    icon: "link",
                    iconColor: "sky",
                    onConfirm: (url) => {
                      executeCommand("createLink", url);
                    },
                  });
                }}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Chèn liên kết"
              >
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Tải ảnh lên (Image WebP)"
              >
                <span className="material-symbols-outlined text-[18px]">image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openPrompt({
                    title: "Chèn Video Embed (YouTube / Vimeo)",
                    placeholder: "https://www.youtube.com/watch?v=...",
                    icon: "smart_display",
                    iconColor: "rose",
                    onConfirm: (url) => {
                      const newBlock: BlogBlock = {
                        id: `vid-${Date.now()}`,
                        type: "video",
                        url,
                        caption: "",
                      };
                      pushHistory([...blocks, newBlock]);
                    },
                  });
                }}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Chèn Video YouTube/Vimeo"
              >
                <span className="material-symbols-outlined text-[18px]">
                  smart_display
                </span>
              </button>
            </div>

            {/* Insert Structure Blocks */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => addBlock("heading")}
                className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1"
                title="Thêm Đề mục H2"
              >
                <span className="material-symbols-outlined text-[16px]">title</span>
                <span>H2</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("paragraph")}
                className="px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1"
                title="Thêm Đoạn văn"
              >
                <span className="material-symbols-outlined text-[16px]">
                  segment
                </span>
                <span>Đoạn</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("quote")}
                className="px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1"
                title="Thêm Trích dẫn"
              >
                <span className="material-symbols-outlined text-[16px]">
                  format_quote
                </span>
                <span>Trích dẫn</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("table")}
                className="px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1"
                title="Thêm Bảng dữ liệu"
              >
                <span className="material-symbols-outlined text-[16px]">
                  table_chart
                </span>
                <span>Bảng</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("columns")}
                className="px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1"
                title="Thêm Khối 2 Cột Side-by-side"
              >
                <span className="material-symbols-outlined text-[16px]">
                  view_column
                </span>
                <span>2 Cột</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("divider")}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Thêm Đường phân cách"
              >
                <span className="material-symbols-outlined text-[18px]">
                  horizontal_rule
                </span>
              </button>
            </div>
          </div>

          {/* Article Container Card */}
          <div className="bg-white dark:bg-[#1a1426] rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-[#2c2835] space-y-6">
            {/* Article Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết lớn..."
                className="w-full text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none placeholder-slate-300 dark:placeholder-slate-600 tracking-tight leading-tight font-serif"
              />
            </div>

            {/* Sapo / Excerpt */}
            <div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Nhập đoạn tóm tắt mở đầu (Sapo / Excerpt) của bài viết..."
                rows={2}
                className="w-full text-sm sm:text-base text-slate-600 dark:text-[#ad8888] bg-slate-50 dark:bg-[#120d20] p-4 rounded-2xl border border-slate-200 dark:border-white/5 outline-none resize-none leading-relaxed italic"
              />
            </div>

            {/* Block Sequence Editor */}
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-white/5">
              {blocks.map((block, idx) => {
                const blockId = block.id || `block-${idx}`;

                return (
                  <div
                    key={blockId}
                    className="relative group/block rounded-2xl p-4 transition-all bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/80 dark:hover:bg-white/[0.04] border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                  >
                    {/* Block Action Controls on Hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-[#201a30] shadow-md border border-slate-200 dark:border-white/10 rounded-xl p-1 z-20">
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                        title="Di chuyển lên"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_upward
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, "down")}
                        disabled={idx === blocks.length - 1}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                        title="Di chuyển xuống"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_downward
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBlock(blockId)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Xóa khối"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>

                    {/* Block Renderers */}
                    {block.type === "heading" && (
                      <div className="flex items-start gap-3">
                        <span className="text-rose-500 font-mono text-lg font-bold mt-1">
                          {String(idx + 1).padStart(2, "0")}.
                        </span>
                        <RichEditableBlock
                          html={block.text || ""}
                          placeholder="Nhập tiêu đề đề mục H2..."
                          blockId={blockId}
                          onChange={(newHtml) =>
                            updateBlock(blockId, { text: newHtml })
                          }
                          className="flex-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    )}

                    {block.type === "paragraph" && (
                      <RichEditableBlock
                        html={block.text || ""}
                        placeholder="Nhập nội dung đoạn văn (Ctrl+V để dán ảnh trực tiếp)..."
                        blockId={blockId}
                        onPasteImage={async (file) => {
                          const url = await uploadImageToServer(file);
                          const newBlock: BlogBlock = {
                            id: `img-${Date.now()}`,
                            type: "image",
                            url,
                            caption: "",
                            width: "100%",
                            align: "center",
                          };
                          const next = [...blocks];
                          next.splice(idx + 1, 0, newBlock);
                          pushHistory(next);
                        }}
                        onChange={(newHtml) =>
                          updateBlock(blockId, { text: newHtml })
                        }
                        className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed min-h-[48px]"
                      />
                    )}

                    {block.type === "image" && (
                      <ResizableImageBlock
                        block={block}
                        onUpdate={(updates) => updateBlock(blockId, updates)}
                        onDelete={() => deleteBlock(blockId)}
                        onReplace={() => {
                          setReplaceTargetBlockId(blockId);
                          replaceImageFileInputRef.current?.click();
                        }}
                      />
                    )}

                    {block.type === "quote" && (
                      <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#161127] border-l-4 border-rose-500 space-y-2">
                        <input
                          type="text"
                          value={block.text || ""}
                          onChange={(e) =>
                            updateBlock(blockId, { text: e.target.value })
                          }
                          placeholder="Nhập câu trích dẫn nổi bật..."
                          className="w-full bg-transparent text-base sm:text-lg italic font-medium text-slate-800 dark:text-slate-200 outline-none"
                        />
                        <input
                          type="text"
                          value={block.author || ""}
                          onChange={(e) =>
                            updateBlock(blockId, { author: e.target.value })
                          }
                          placeholder="— Tác giả / Nguồn trích dẫn..."
                          className="w-full bg-transparent text-xs font-semibold text-rose-600 dark:text-rose-400 outline-none"
                        />
                      </div>
                    )}

                    {block.type === "columns" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                            Cột Trái
                          </span>
                          {block.leftType === "image" && block.leftImageUrl ? (
                            <ColumnImageResizable
                              imageUrl={block.leftImageUrl}
                              caption={block.leftImageCaption}
                              imageHeight={block.leftImageHeight}
                              onUpdate={(up) =>
                                updateBlock(blockId, {
                                  leftImageHeight: up.height,
                                  leftImageCaption: up.caption,
                                })
                              }
                              onUploadClick={() => {
                                setColumnUploadTarget({ blockId, side: "left" });
                                columnFileInputRef.current?.click();
                              }}
                              onDelete={() =>
                                updateBlock(blockId, {
                                  leftType: "text",
                                  leftImageUrl: "",
                                })
                              }
                            />
                          ) : (
                            <RichEditableBlock
                              html={block.leftText || ""}
                              placeholder="Nhập nội dung cột trái..."
                              onChange={(html) =>
                                updateBlock(blockId, { leftText: html })
                              }
                              className="text-sm sm:text-base leading-relaxed p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500">
                            Cột Phải
                          </span>
                          {block.rightType === "image" && block.rightImageUrl ? (
                            <ColumnImageResizable
                              imageUrl={block.rightImageUrl}
                              caption={block.rightImageCaption}
                              imageHeight={block.rightImageHeight}
                              onUpdate={(up) =>
                                updateBlock(blockId, {
                                  rightImageHeight: up.height,
                                  rightImageCaption: up.caption,
                                })
                              }
                              onUploadClick={() => {
                                setColumnUploadTarget({ blockId, side: "right" });
                                columnFileInputRef.current?.click();
                              }}
                              onDelete={() =>
                                updateBlock(blockId, {
                                  rightType: "text",
                                  rightImageUrl: "",
                                })
                              }
                            />
                          ) : (
                            <RichEditableBlock
                              html={block.rightText || ""}
                              placeholder="Nhập nội dung cột phải..."
                              onChange={(html) =>
                                updateBlock(blockId, { rightText: html })
                              }
                              className="text-sm sm:text-base leading-relaxed p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {block.type === "video" && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black max-w-2xl mx-auto shadow-lg">
                        <iframe
                          src={formatVideoEmbedUrl(block.url)}
                          title="Video Embed"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {block.type === "table" && (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 dark:bg-white/5">
                            <tr>
                              {block.headers?.map((h, hIdx) => (
                                <th key={hIdx} className="p-2.5">
                                  <input
                                    value={h}
                                    onChange={(e) => {
                                      const nextH = [...(block.headers || [])];
                                      nextH[hIdx] = e.target.value;
                                      updateBlock(blockId, { headers: nextH });
                                    }}
                                    className="w-full bg-transparent font-bold text-rose-600 outline-none text-xs uppercase"
                                  />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {block.rows?.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2.5">
                                    <input
                                      value={cell}
                                      onChange={(e) => {
                                        const nextRows = [...(block.rows || [])];
                                        nextRows[rIdx][cIdx] = e.target.value;
                                        updateBlock(blockId, { rows: nextRows });
                                      }}
                                      className="w-full bg-transparent text-slate-800 dark:text-slate-200 outline-none text-xs"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {block.type === "divider" && (
                      <hr className="my-4 border-t-2 border-dashed border-slate-200 dark:border-white/10" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Settings, Cover & Live Metrics */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Card 1: Cover Image */}
          <div className="bg-white dark:bg-[#1a1426] rounded-3xl p-5 shadow-lg border border-slate-200 dark:border-[#2c2835] space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-[20px]">
                image
              </span>
              <span>Ảnh bìa bài viết (.webp)</span>
            </h3>

            {coverImage ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md group">
                <OptimizedImage
                  src={coverImage}
                  alt="Ảnh bìa bài viết"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-xl font-bold text-xs shadow-md hover:bg-slate-100 transition-colors"
                  >
                    Thay ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="px-3 py-1.5 bg-rose-500 text-white rounded-xl font-bold text-xs shadow-md hover:bg-rose-600 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#2c2835] flex flex-col items-center justify-center p-4 hover:border-rose-500 dark:hover:border-rose-500 transition-colors cursor-pointer bg-slate-50 dark:bg-white/[0.02]"
              >
                {isUploadingCover ? (
                  <span className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-slate-400 text-[32px] mb-1">
                      add_photo_alternate
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Tải lên ảnh bìa WebP
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Tự động nén chuẩn WebP tốc độ cao
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Card 2: Meta Info */}
          <div className="bg-white dark:bg-[#1a1426] rounded-3xl p-5 shadow-lg border border-slate-200 dark:border-[#2c2835] space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500 text-[20px]">
                settings
              </span>
              <span>Thông tin xuất bản</span>
            </h3>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Danh mục bài viết
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#120d20] border border-slate-200 dark:border-[#2c2835] rounded-xl px-3 py-2 text-xs font-medium outline-none text-slate-900 dark:text-white"
              >
                <option value="Nail Tutorials & Care">Nail Tutorials & Care</option>
                <option value="Trends & Design Ideas">Trends & Design Ideas</option>
                <option value="Press-on Sizing & Fit">Press-on Sizing & Fit</option>
                <option value="Salon & Lifestyle">Salon & Lifestyle</option>
                <option value="Công nghệ & Nail Art">Công nghệ & Nail Art</option>
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Tác giả bài viết
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#120d20] border border-slate-200 dark:border-[#2c2835] rounded-xl px-3 py-2 text-xs font-medium outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Đường dẫn tĩnh (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#120d20] border border-slate-200 dark:border-[#2c2835] rounded-xl px-3 py-2 text-xs font-mono outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Trạng thái xuất bản:
              </span>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isPublic
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                }`}
              >
                {isPublic ? "Công khai (Published)" : "Bản nháp (Draft)"}
              </button>
            </div>
          </div>

          {/* Card 3: Live Document Analytics */}
          <div className="bg-white dark:bg-[#1a1426] rounded-3xl p-5 shadow-lg border border-slate-200 dark:border-[#2c2835] space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-500 text-[20px]">
                analytics
              </span>
              <span>Chỉ số tài liệu</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#120d20] flex flex-col border border-slate-200 dark:border-[#2c2835]">
                <span className="text-[11px] text-slate-500">Số lượng từ</span>
                <span className="font-bold text-xl text-slate-900 dark:text-white mt-0.5">
                  {wordCount}
                </span>
                <span className="text-[10px] text-emerald-500 mt-0.5">
                  {wordCount > 300 ? "Đạt chuẩn chuyên sâu" : "Đang soạn thảo"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#120d20] flex flex-col border border-slate-200 dark:border-[#2c2835]">
                <span className="text-[11px] text-slate-500">Thời gian đọc</span>
                <span className="font-bold text-xl text-sky-500 mt-0.5">
                  ~{readTimeMinutes}
                  <span className="text-xs ml-1 font-normal">phút</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Tương tác trực quan
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#120d20] flex flex-col border border-slate-200 dark:border-[#2c2835]">
                <span className="text-[11px] text-slate-500">Đề mục H2</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {headingsCount} Mục
                </span>
                <span className="text-[10px] text-rose-500 mt-0.5">Mạch lạc</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#120d20] flex flex-col border border-slate-200 dark:border-[#2c2835]">
                <span className="text-[11px] text-slate-500">Tài nguyên ảnh</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {imageBlocksCount} Ảnh WebP
                </span>
                <span className="text-[10px] text-sky-500 mt-0.5">Tối ưu CDN</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Prompt Modal */}
      <PromptModal {...promptModal} />
    </div>
  );
}
