"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BlogPostItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import { parseBlogContentToHtml } from "@/lib/blogParser";
import {
  ArrowLeft,
  Upload,
  X,
  Bold,
  Italic,
  Heading,
  List,
  Quote,
  Link as LinkIcon,
  Plus,
  Image as ImageIcon,
  Eye,
  Edit3,
  Sliders,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
} from "lucide-react";

interface BlogFormProps {
  initialData?: BlogPostItem;
  isEdit?: boolean;
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageFileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState<boolean>(
    Boolean(isEdit && initialData?.slug)
  );
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [thumbnail, setThumbnail] = useState(
    initialData?.thumbnail || "/images/IMG_7098.webp"
  );
  const [author, setAuthor] = useState(initialData?.author || "X-ON Nail Artist");
  const [category, setCategory] = useState(
    initialData?.category || "Nail Tutorials & Care"
  );
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">(
    initialData?.status || "Published"
  );
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seoDescription || ""
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailSource, setThumbnailSource] = useState<"upload" | "url">("upload");
  const [thumbnailAspectRatio, setThumbnailAspectRatio] = useState<
    "aspect-video" | "aspect-square" | "aspect-4/3" | "aspect-21/9"
  >("aspect-video");

  // Editor Preview Mode: visual (WYSIWYG default) | code (HTML/Markdown) | preview (Live Preview)
  const [editorTab, setEditorTab] = useState<"visual" | "code" | "preview">("visual");
  const visualEditorRef = useRef<HTMLDivElement>(null);

  // Synchronize visual editor DOM when switching tabs or on initial mount
  React.useEffect(() => {
    if (editorTab === "visual" && visualEditorRef.current) {
      const html = parseBlogContentToHtml(content);
      if (visualEditorRef.current.innerHTML !== html) {
        visualEditorRef.current.innerHTML = html;
      }
    }
  }, [editorTab]);

  // Content Image Inserter Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [contentImgSource, setContentImgSource] = useState<"upload" | "url">("upload");
  const [contentImgUrl, setContentImgUrl] = useState("");
  const [contentImgAlt, setContentImgAlt] = useState("");
  const [contentImgCaption, setContentImgCaption] = useState("");
  const [contentImgSize, setContentImgSize] = useState<"full" | "75" | "50" | "35" | "custom">("full");
  const [contentImgCustomWidth, setContentImgCustomWidth] = useState(600);
  const [contentImgAlign, setContentImgAlign] = useState<"center" | "left" | "right">("center");
  const [contentImgRounded, setContentImgRounded] = useState<"none" | "md" | "xl" | "2xl">("xl");
  const [contentImgShadow, setContentImgShadow] = useState<boolean>(true);
  const [isUploadingContentImg, setIsUploadingContentImg] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
    if (!seoTitle) setSeoTitle(val);
  };

  // Upload thumbnail from local machine
  const handleThumbnailFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.url) {
        setThumbnail(json.data.url);
        success("Thumbnail image uploaded successfully!");
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            setThumbnail(reader.result as string);
            success("Thumbnail image loaded successfully!");
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setThumbnail(reader.result as string);
          success("Thumbnail image loaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingThumbnail(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Upload content image from local machine
  const handleContentImgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    // Auto extract clean filename for image name and caption
    const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
    setContentImgAlt(cleanFileName);
    setContentImgCaption(cleanFileName);

    setIsUploadingContentImg(true);
    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.url) {
        setContentImgUrl(json.data.url);
        success("Image uploaded successfully!");
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            setContentImgUrl(reader.result as string);
            success("Image loaded successfully!");
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setContentImgUrl(reader.result as string);
          success("Image loaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingContentImg(false);
      if (contentImageFileInputRef.current) contentImageFileInputRef.current.value = "";
    }
  };

  // Upload image file and insert visual image into editor
  const uploadAndInsertImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      error("Please upload or paste a valid image file (PNG, JPG, WEBP).");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append("file", file);

      let finalUrl = "";
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.url) {
        finalUrl = json.data.url;
      } else {
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      if (finalUrl) {
        const altText = file.name.replace(/\.[^/.]+$/, "") || "Blog image";
        const imageHtml = `<div class="my-6 text-center"><img src="${finalUrl}" alt="${altText}" class="max-w-full rounded-xl mx-auto shadow-md block h-auto inline-block" style="max-height: 520px;" /></div><p><br></p>`;

        if (editorTab === "visual" && visualEditorRef.current) {
          visualEditorRef.current.focus();
          document.execCommand("insertHTML", false, imageHtml);
          setContent(visualEditorRef.current.innerHTML);
        } else {
          const textarea = document.getElementById("blog-content-area") as HTMLTextAreaElement;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent =
              content.substring(0, start) + imageHtml + content.substring(end);
            setContent(newContent);
          } else {
            setContent((prev) => prev + imageHtml);
          }
        }
        success("Image inserted into article!");
      }
    } catch {
      error("Failed to upload pasted image.");
    }
  };

  const handleVisualPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          uploadAndInsertImage(file);
          return;
        }
      }
    }
  };

  const handleVisualDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith("image/")) {
      e.preventDefault();
      uploadAndInsertImage(files[0]);
    }
  };

  const handleTextareaPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          uploadAndInsertImage(file);
          return;
        }
      }
    }
  };

  const handleTextareaDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith("image/")) {
      e.preventDefault();
      uploadAndInsertImage(files[0]);
    }
  };

  // Visual & Code formatting toolbar helper
  const applyFormat = (command: string, value: string | undefined = undefined) => {
    if (editorTab === "visual" && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand(command, false, value);
      setContent(visualEditorRef.current.innerHTML);
    } else {
      if (command === "bold") insertFormatting("**", "**");
      else if (command === "italic") insertFormatting("*", "*");
      else if (command === "formatBlock" && value === "<h3>") insertFormatting("### ");
      else if (command === "insertUnorderedList") insertFormatting("- ");
      else if (command === "formatBlock" && value === "<blockquote>") insertFormatting("> ");
    }
  };

  const handleLinkButton = () => {
    if (editorTab === "visual" && visualEditorRef.current) {
      const url = prompt("Enter website link URL (e.g. https://...):", "https://");
      if (url) {
        visualEditorRef.current.focus();
        document.execCommand("createLink", false, url);
        setContent(visualEditorRef.current.innerHTML);
      }
    } else {
      insertFormatting("[link text](", ")");
    }
  };

  // Content formatting toolbar helpers
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("blog-content-area") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || "text";
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  // Insert configured image into content
  const handleInsertImageIntoContent = () => {
    if (!contentImgUrl.trim()) {
      error("Please upload or enter an image URL.");
      return;
    }

    const widthStyle = `width: ${contentImgCustomWidth}px; max-width: 100%;`;

    // Clean HTML Image Element with Sizing & Caption
    const imageHtml = `\n<div class="my-6 text-center">
  <img src="${contentImgUrl}" alt="${contentImgAlt || "Blog image"}" style="${widthStyle}" class="mx-auto block max-w-full rounded-xl shadow-xs h-auto inline-block object-cover" />${
      contentImgCaption.trim()
        ? `\n  <p class="text-xs text-neutral-500 mt-2 italic text-center">${contentImgCaption.trim()}</p>`
        : ""
    }
</div>\n<p><br></p>`;

    if (editorTab === "visual" && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand("insertHTML", false, imageHtml);
      setContent(visualEditorRef.current.innerHTML);
    } else {
      const textarea = document.getElementById("blog-content-area") as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent =
          content.substring(0, start) + imageHtml + content.substring(end);
        setContent(newContent);
      } else {
        setContent((prev) => prev + imageHtml);
      }
    }

    // Reset modal state
    setIsImageModalOpen(false);
    setContentImgUrl("");
    setContentImgAlt("");
    setContentImgCaption("");
    success("Image inserted into article!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalContent =
      editorTab === "visual" && visualEditorRef.current
        ? visualEditorRef.current.innerHTML
        : content;

    if (!title.trim()) {
      error("Article title is required.");
      return;
    }
    if (!finalContent.trim()) {
      error("Article content is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const payload = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        excerpt,
        content: finalContent,
        thumbnail,
        author,
        category,
        tags: initialData?.tags || [],
        status,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
      };

      const url = isEdit && initialData ? `/api/blog/${initialData.id}` : "/api/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success(isEdit ? "Article updated" : "Article published");
        router.push("/admin/blog");
      } else {
        error(json.message || "Failed to save article");
      }
    } catch {
      error("Error saving blog article");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog"
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                {isEdit ? `Edit: ${initialData?.title}` : "Write New Blog Article"}
              </h1>
              <p className="text-xs text-neutral-500">
                Share tutorials, seasonal trends, and nail styling guides.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog"
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{isEdit ? "Update Article" : "Publish Article"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Content & Editor (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. 5 Secrets to Make Your Press-On Nails Last 4 Weeks"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugManual(true);
                  }}
                  placeholder="5-secrets-press-on-nails-last"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Excerpt / Short Summary
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A compelling 1-2 sentence hook for search engines and social cards..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Markdown / Rich Editor Toolbar & Mode Switcher */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Article Body Content *
                  </label>
                  {/* Tab Switcher: Visual vs Code vs Preview */}
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setEditorTab("visual")}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        editorTab === "visual"
                          ? "bg-white text-neutral-900 shadow-xs"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Visual Editor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("code")}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        editorTab === "code"
                          ? "bg-white text-neutral-900 shadow-xs"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      <span>Code / HTML</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("preview")}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        editorTab === "preview"
                          ? "bg-white text-neutral-900 shadow-xs"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Live Preview</span>
                    </button>
                  </div>
                </div>

                {editorTab !== "preview" ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-neutral-100 rounded-t-xl border-x border-t border-neutral-200">
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => applyFormat("formatBlock", "<h3>")}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700 font-bold text-xs"
                          title="Heading 3"
                        >
                          <Heading className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("bold")}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700 text-xs"
                          title="Bold"
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("italic")}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700 text-xs"
                          title="Italic"
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("insertUnorderedList")}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700 text-xs"
                          title="Bullet list"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("formatBlock", "<blockquote>")}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700 text-xs"
                          title="Quote"
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleLinkButton}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700 text-xs"
                          title="Insert Link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Primary Action: Add Image / Adjust Size */}
                      <button
                        type="button"
                        onClick={() => setIsImageModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        title="Add Image from Device / URL and adjust size"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Insert Image (Device/URL)</span>
                      </button>
                    </div>

                    {editorTab === "visual" ? (
                      <div className="relative">
                        <div
                          ref={visualEditorRef}
                          contentEditable
                          suppressContentEditableWarning
                          id="blog-visual-editor"
                          onInput={(e) => setContent(e.currentTarget.innerHTML)}
                          onPaste={handleVisualPaste}
                          onDrop={handleVisualDrop}
                          className="w-full min-h-[380px] max-h-[650px] overflow-y-auto px-5 py-4 bg-white border border-neutral-200 rounded-b-xl text-sm font-sans text-neutral-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed prose prose-sm max-w-none [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-neutral-900 [&_h3]:mt-4 [&_p]:my-2.5 [&_img]:inline-block [&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-md [&_figure]:my-5 [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-600 [&_a]:text-amber-600 [&_a]:underline"
                        />
                        {!content && (
                          <div className="absolute top-4 left-5 text-neutral-400 text-sm pointer-events-none select-none">
                            Type your article here, paste images (Ctrl+V), or click &quot;Insert Image&quot; above to see photos live...
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1.5 px-1">
                          <span>✨ Visual Editor: Images & styles are rendered live on screen as you compose.</span>
                          <span>Paste (Ctrl+V) or Drag & Drop images directly</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <textarea
                          id="blog-content-area"
                          rows={15}
                          required
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          onPaste={handleTextareaPaste}
                          onDrop={handleTextareaDrop}
                          placeholder="HTML / Markdown source code..."
                          className="w-full px-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-b-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white leading-relaxed"
                        />
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1.5 px-1">
                          <span>Source Code Mode (HTML & Markdown)</span>
                          <span>Paste or edit raw code</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="p-6 bg-white border border-neutral-200 rounded-xl min-h-[380px] max-h-[600px] overflow-y-auto space-y-4">
                    <div className="pb-3 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                      <span>Article Live Rendering Preview</span>
                      <span className="font-mono text-[10px] text-amber-600 font-bold uppercase">
                        Active Mode
                      </span>
                    </div>

                    {content ? (
                      <div
                        className="prose prose-sm max-w-none text-neutral-800 leading-relaxed space-y-4 font-sans [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-neutral-900 [&_h3]:mt-4 [&_p]:my-2 [&_img]:inline-block [&_img]:max-w-full [&_figure]:my-6 [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-600"
                        dangerouslySetInnerHTML={{
                          __html: parseBlogContentToHtml(content),
                        }}
                      />
                    ) : (
                      <p className="text-neutral-400 text-xs italic py-12 text-center">
                        No content written yet. Switch back to &quot;Visual Editor&quot; to compose.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SEO Metadata */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                SEO Optimization
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Meta SEO Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Title as shown on Google..."
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Meta SEO Description
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description snippet..."
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Thumbnail (1 col) */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Status & Category
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "Draft" | "Published" | "Archived")
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="Published">Published (Live)</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Nail Trends & How-Tos"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Featured Thumbnail Card with Sizing & Upload from Local/URL */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Featured Thumbnail
                </h2>
                <span className="text-[10px] text-neutral-400 font-mono">Main Cover</span>
              </div>

              {/* Image Preview Box with Dynamic Aspect Ratio */}
              <div
                className={`relative ${thumbnailAspectRatio} rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200 group`}
              >
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt="Thumbnail preview"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="300px"
                    onError={() => setThumbnail("/images/IMG_7098.webp")}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1.5">
                    <ImageIcon className="w-8 h-8 stroke-1" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}

                {isUploadingThumbnail && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-2">
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-semibold">Uploading...</span>
                  </div>
                )}
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5">
                  Display Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "16:9", val: "aspect-video" },
                    { label: "1:1", val: "aspect-square" },
                    { label: "4:3", val: "aspect-4/3" },
                    { label: "21:9", val: "aspect-21/9" },
                  ].map((ratio) => (
                    <button
                      key={ratio.val}
                      type="button"
                      onClick={() =>
                        setThumbnailAspectRatio(
                          ratio.val as
                            | "aspect-video"
                            | "aspect-square"
                            | "aspect-4/3"
                            | "aspect-21/9"
                        )
                      }
                      className={`py-1 text-[11px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        thumbnailAspectRatio === ratio.val
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Switcher: Upload from Computer vs URL */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="flex bg-neutral-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setThumbnailSource("upload")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      thumbnailSource === "upload"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailSource("url")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      thumbnailSource === "url"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Image URL</span>
                  </button>
                </div>

                {thumbnailSource === "upload" ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFileUpload}
                      className="hidden"
                      id="thumbnail-upload-input"
                    />
                    <label
                      htmlFor="thumbnail-upload-input"
                      className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-200 hover:border-amber-500 hover:bg-amber-50/20 rounded-xl cursor-pointer transition-all text-center"
                    >
                      <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                      <span className="text-xs font-bold text-neutral-800">
                        Select image from computer
                      </span>
                      <span className="text-[10px] text-neutral-400 mt-0.5">
                        PNG, JPG, WEBP up to 10MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Direct Image Web URL
                    </label>
                    <input
                      type="text"
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Insert & Size Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Insert & Adjust Article Image
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Upload from device or URL, set sizing, alignment, and styling.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Image Source Selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-2">
                  1. Image Source
                </label>
                <div className="flex bg-neutral-100 p-1 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setContentImgSource("upload")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      contentImgSource === "upload"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Computer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentImgSource("url")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      contentImgSource === "url"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Image URL</span>
                  </button>
                </div>

                {contentImgSource === "upload" ? (
                  <div>
                    <input
                      ref={contentImageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleContentImgFileUpload}
                      className="hidden"
                      id="content-img-upload-input"
                    />
                    <label
                      htmlFor="content-img-upload-input"
                      className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-200 hover:border-amber-500 hover:bg-amber-50/20 rounded-2xl cursor-pointer transition-all text-center"
                    >
                      {isUploadingContentImg ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-amber-700">
                            Uploading image...
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-neutral-400 mb-1.5" />
                          <span className="text-xs font-bold text-neutral-800">
                            Click to upload image from device
                          </span>
                          <span className="text-[11px] text-neutral-400 mt-0.5">
                            High resolution JPG, PNG, WEBP supported
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={contentImgUrl}
                      onChange={(e) => setContentImgUrl(e.target.value)}
                      placeholder="https://example.com/nails-step-1.jpg"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Image Preview if available */}
              {contentImgUrl && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                  <div className="text-[11px] font-semibold text-neutral-500 mb-2 flex items-center justify-between">
                    <span>Image Preview:</span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </div>
                  <div className="relative h-40 w-full rounded-lg overflow-hidden bg-neutral-200 border border-neutral-300">
                    <Image
                      src={contentImgUrl}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Size Adjustment via Range Slider */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Image Width (Drag slider to resize)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
                    {contentImgCustomWidth} px
                  </span>
                </div>

                <div className="space-y-1.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
                  <input
                    type="range"
                    min={150}
                    max={1200}
                    step={10}
                    value={contentImgCustomWidth}
                    onChange={(e) =>
                      setContentImgCustomWidth(Number(e.target.value))
                    }
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  />
                  <div className="flex justify-between text-[11px] text-neutral-400 font-medium">
                    <span>Small (150px)</span>
                    <span>Standard (600px)</span>
                    <span>Full Width (1200px)</span>
                  </div>
                </div>
              </div>

              {/* Image Name & Caption */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Image Title (Auto-named from file, editable)
                    </label>
                    <span className="text-[10px] text-neutral-400">SEO & Alt text</span>
                  </div>
                  <input
                    type="text"
                    value={contentImgAlt}
                    onChange={(e) => setContentImgAlt(e.target.value)}
                    placeholder="e.g. Handmade Velvet Shimmer Nails"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Image Caption (Displayed under image - Optional)
                  </label>
                  <input
                    type="text"
                    value={contentImgCaption}
                    onChange={(e) => setContentImgCaption(e.target.value)}
                    placeholder="e.g. Figure 1: Handcrafted luxury coffin press-on nails with crystal accents"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImageIntoContent}
                disabled={!contentImgUrl.trim()}
                className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Insert into Article</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
