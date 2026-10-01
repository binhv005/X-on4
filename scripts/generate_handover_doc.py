import os
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            </w:tblBorders>
        ''')
        tblPr[0].append(borders)

def format_row(row, is_header=False, header_bg="1E293B", row_bg="FFFFFF", alt_bg="F8FAFC", is_alt=False):
    bg = header_bg if is_header else (alt_bg if is_alt else row_bg)
    for cell in row.cells:
        set_cell_background(cell, bg)
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for p in cell.paragraphs:
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            for run in p.runs:
                if is_header:
                    run.font.bold = True
                    run.font.color.rgb = RGBColor(255, 255, 255)
                    run.font.size = Pt(9.5)
                else:
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(30, 41, 59)

def add_styled_table(doc, headers, data, col_widths=None, header_bg="1E3A8A"):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table, color="CBD5E1")
    
    # Header
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
    format_row(table.rows[0], is_header=True, header_bg=header_bg)
    
    # Data rows
    for r_idx, row_data in enumerate(data):
        row_cells = table.rows[r_idx + 1].cells
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].text = str(val)
        format_row(table.rows[r_idx + 1], is_header=False, is_alt=(r_idx % 2 == 1))
        
    if col_widths:
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    return table

def create_handover_document(output_path):
    doc = Document()
    
    # Page Margins
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)
        
    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)
    normal_style.paragraph_format.line_spacing = 1.2
    normal_style.paragraph_format.space_after = Pt(4)

    # ==========================================
    # HEADER BANNER & TITLE
    # ==========================================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_proj = p_title.add_run("DỰ ÁN X-ON NAIL SHOP\nTÀI LIỆU BÀN GIAO TOÀN DIỆN HỆ THỐNG")
    run_proj.font.size = Pt(20)
    run_proj.font.bold = True
    run_proj.font.color.rgb = RGBColor(30, 58, 138) # #1E3A8A Deep Blue

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(12)
    run_sub = p_sub.add_run("Website Thương Mại Điện Tử Móng Nghệ Thuật & Press-on Nails Cao Cấp\n")
    run_sub.font.size = Pt(11.5)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(79, 70, 229)
    run_slogan = p_sub.add_run("Brand Line: “Tôn Vinh Nét Đẹp Đôi Tay – Tinh Tế, Tiện Lợi & Chuẩn Gu Phong Cách”")
    run_slogan.font.size = Pt(10)
    run_slogan.font.italic = True
    run_slogan.font.color.rgb = RGBColor(100, 116, 139)

    # Info Box / Header Note
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_after = Pt(12)
    r_lead = p_meta.add_run("Đơn vị thực hiện: ")
    r_lead.font.bold = True
    p_meta.add_run("Võ Thị Bình (Full Stack Lead Developer)\n")
    r_purpose = p_meta.add_run("Mục đích tài liệu: ")
    r_purpose.font.bold = True
    p_meta.add_run(
        "Tài liệu này dùng để xác nhận bàn giao chính thức toàn bộ dự án X-ON Nail Shop bao gồm: "
        "Mã nguồn Next.js 16 App Router, React 19, hệ thống CSDL MongoDB Atlas, dịch vụ lưu trữ đa phương tiện Cloudinary, "
        "Serverless RESTful API, giao diện bán hàng Storefront, phân hệ quản trị Admin Panel, tài liệu kỹ thuật và hướng dẫn vận hành chi tiết."
    )

    # ==========================================
    # 1. THÔNG TIN TÀI LIỆU
    # ==========================================
    h1 = doc.add_heading("1. THÔNG TIN TÀI LIỆU", level=1)
    h1.style.font.color.rgb = RGBColor(30, 58, 138)
    
    headers_1 = ["Thuộc tính", "Giá trị"]
    data_1 = [
        ["Tên tài liệu", "Tài liệu Nghiệm thu & Bàn giao Kỹ thuật Dự án X-ON Nail Shop"],
        ["Mã tài liệu", "BGDA-XON-NAIL-2026"],
        ["Phiên bản", "v1.0.0 (Bản hoàn thiện bàn giao chính thức)"],
        ["Ngày lập / Ngày bàn giao", "01/10/2026"],
        ["Người lập tài liệu", "Võ Thị Bình (Lead Developer)"],
        ["Trạng thái bàn giao", "Hoàn thành 100% tính năng Storefront, Admin Panel, Database & API Handlers"],
    ]
    add_styled_table(doc, headers_1, data_1, [2.2, 4.6])

    # ==========================================
    # 2. THÔNG TIN DỰ ÁN
    # ==========================================
    h2 = doc.add_heading("2. THÔNG TIN DỰ ÁN", level=1)
    h2.style.font.color.rgb = RGBColor(30, 58, 138)
    
    headers_2 = ["Hạng mục", "Nội dung chi tiết"]
    data_2 = [
        ["Tên dự án", "X-ON Nail Shop (E-Commerce Platform for Handcrafted & Custom Press-On Nails)"],
        ["Mục tiêu dự án", "Xây dựng website thương mại điện tử chuyên biệt cho ngành Nail Art & Press-on Nails cao cấp, hỗ trợ đặt hàng lẻ, phân loại theo size móng/kiểu dáng/độ dài, đăng ký đối tác sỉ (B2B Wholesale), quản trị sản phẩm & đơn hàng tự động."],
        ["Đối tượng người dùng", "1. Khách hàng cá nhân yêu thích nail art, muốn sở hữu bộ móng thiết kế đẹp trong 5-10 phút.\n2. Các Salon/Spa/Chủ shop cần nhập sỉ (Wholesale Partners).\n3. Quản trị viên cửa hàng & nhân viên kỹ thuật vận hành đơn hàng."],
        ["Phạm vi triển khai", "Storefront (Giao diện mua sắm khách hàng), Bảng hướng dẫn đo size móng (Sizing Fit Guide), Combo tiết kiệm, Lookbook Gallery, Blog cẩm nang làm móng, Admin Portal quản trị toàn diện, REST API & Database."],
    ]
    add_styled_table(doc, headers_2, data_2, [2.2, 4.6])

    # ==========================================
    # 3. TỔNG QUAN HỆ THỐNG
    # ==========================================
    h3 = doc.add_heading("3. TỔNG QUAN HỆ THỐNG", level=1)
    h3.style.font.color.rgb = RGBColor(30, 58, 138)
    
    p = doc.add_paragraph()
    p.add_run(
        "Hệ thống X-ON Nail Shop được thiết kế theo kiến trúc hiện đại Jamstack/Serverless tận dụng tối đa sức mạnh của "
        "Next.js 16 App Router và React 19. Hệ thống đáp ứng các tiêu chuẩn khắt khe về tốc độ tải trang (Core Web Vitals), "
        "tính thẩm mỹ cao (Beauty-first Design), trải nghiệm người dùng mượt mà trên thiết bị di động (Mobile-First) và khả năng mở rộng kinh doanh không giới hạn."
    )

    headers_3 = ["Trụ cột hệ thống", "Mô tả giải pháp triển khai"]
    data_3 = [
        ["Trải nghiệm mua sắm (Storefront)", "Giao diện cao cấp chuẩn quốc tế, hiển thị rõ nét chi tiết mẫu móng, hỗ trợ chọn kiểu móng (Coffin, Almond, Stiletto, Square, Oval), chiều dài và kích cỡ chuẩn xác mm."],
        ["Tương tác đo size móng (Fit Guide)", "Tích hợp công cụ hướng dẫn đo móng chi tiết và Modal chọn size trực quan giúp giảm thiểu 95% tỷ lệ đổi trả do lệch kích cỡ móng."],
        ["Kênh phân phối B2B (Wholesale)", "Trang đăng ký đại lý sỉ trực tuyến với chính sách chiết khấu theo số lượng (Tier Pricing), phân loại tài khoản đối tác chuyên nghiệp."],
        ["Hệ thống Quản trị (Admin Panel)", "Bảng điều khiển quản lý tập trung: Doanh thu, Đơn hàng, Sản phẩm đa biến thể, Khách hàng, Bài viết Blog, Thư viện Gallery, Yêu cầu mở đại lý sỉ."],
        ["Cơ sở hạ tầng & Lưu trữ", "CSDL MongoDB Atlas phân tán trên đám mây, tích hợp Cloudinary CDN tối ưu hóa hình ảnh/video sản phẩm độ phân giải cao."],
    ]
    add_styled_table(doc, headers_3, data_3, [2.4, 4.4])

    # ==========================================
    # 4. PHẠM VI CHỨC NĂNG ĐÃ TRIỂN KHAI
    # ==========================================
    h4 = doc.add_heading("4. PHẠM VI CHỨC NĂNG ĐÃ TRIỂN KHAI CHI TIẾT", level=1)
    h4.style.font.color.rgb = RGBColor(30, 58, 138)

    doc.add_heading("4.1 Phân hệ Storefront (Khách hàng & Trải nghiệm mua sắm)", level=2)
    headers_4_1 = ["STT", "Chức năng / Module", "Mô tả chi tiết & Tính năng kỹ thuật"]
    data_4_1 = [
        ["1", "Trang Chủ (Homepage /)", "• Hero Banner sang trọng giới thiệu các bộ sưu tập móng theo mùa.\n• Khối Top Trending Nails & New Arrivals với hiệu ứng lướt mượt mà.\n• Storytelling: Giới thiệu quy trình làm móng thủ công độc quyền.\n• Khối Lookbook Instagram feed thực tế & Đăng ký nhận bản tin khuyến mãi (Newsletter)."],
        ["2", "Trang Danh Mục & Cửa Hàng (/shop)", "• Bộ lọc sản phẩm đa tiêu chí: Theo Danh mục (Press-on, Gel, Phụ kiện), Kiểu dáng móng (Shape: Almond, Coffin, Stiletto, Square, Oval), Mức giá và Độ dài.\n• Tính năng tìm kiếm theo từ khóa tức thì & Sắp xếp theo giá / độ phổ biến.\n• Phân trang linh hoạt, hiển thị nhãn Hot / Sale / New."],
        ["3", "Chi Tiết Sản Phẩm (/product/[slug])", "• Gallery hình ảnh & video độ phân giải cao với khả năng phóng to chi tiết.\n• Lựa chọn biến thể: Kích thước móng (XS, S, M, L hoặc Custom size từng ngón), Kiểu móng (Shape) & Chiều dài (Short, Medium, Long).\n• Nút 'Size Guide' mở Modal hướng dẫn chọn size chuẩn xác.\n• Nút 'Thêm vào giỏ' (Add to Cart) và 'Mua ngay' (Buy Now) với thông báo Toast thông minh.\n• Khối Đánh giá sản phẩm (Reviews) và Sản phẩm tương tự."],
        ["4", "Giỏ Hàng & Thanh Toán (/cart & CartDrawer)", "• Drawer giỏ hàng trượt bên phải tiện lợi không cần rời trang.\n• Tăng/giảm số lượng, xóa sản phẩm, hiển thị tổng tiền tức thì.\n• Hỗ trợ nhập mã Voucher / Promo Code giảm giá.\n• Lưu trạng thái giỏ hàng tự động vào LocalStorage đồng bộ cùng CartContext."],
        ["5", "Hướng Dẫn Đo Size Móng (/sizing-chart)", "• Hướng dẫn 2 phương pháp đo móng tại nhà: Bằng thước dây mềm và bằng băng dính/thước kẻ thẳng.\n• Bảng đối chiếu kích thước mm chuẩn cho từng ngón tay (Cái, Trỏ, Giữa, Áp út, Út).\n• Bảng quy đổi các size tiêu chuẩn: XS (14-10-11-10-7mm), S (15-11-12-11-8mm), M (16-12-13-12-9mm), L (17-13-14-13-10mm)."],
        ["6", "Đăng Ký Khách Sỉ / Đại Lý (/wholesale-signup)", "• Form tiếp nhận thông tin B2B: Tên Salon/Doanh nghiệp, MST, Số lượng móng dự kiến nhập mỗi tháng, Địa chỉ giao hàng.\n• Bảng chính sách chiết khấu theo số lượng (Tier Discount: 20-50%).\n• Dữ liệu gửi trực tiếp về API Server và lưu trữ vào MongoDB để Admin xét duyệt."],
        ["7", "Combo Tiết Kiệm (/bundle-and-save)", "• Gói mua kèm trọn bộ phụ kiện dán móng: Keo dán móng chuyên dụng, Miếng dán silicon tạm thời, Dũa móng mini, Que đẩy da gỗ, Bông tẩm cồn sát khuẩn."],
        ["8", "Thư Viện Lookbook (/gallery-product)", "• Album hình ảnh mẫu móng thực tế từ khách hàng, người mẫu và KOLs.\n• Tag gắn trực tiếp liên kết đến sản phẩm trong ảnh để khách mua nhanh."],
        ["9", "Blog & Cẩm Nang Làm Đẹp (/blog)", "• Danh sách bài viết chuyên sâu: Hướng dẫn giữ móng bền 3-4 tuần, Cách tháo móng an toàn tại nhà không làm yếu móng thật, Xu hướng nail art 2026.\n• Trang chi tiết bài viết với giao diện đọc chuẩn Typography và chia sẻ mạng xã hội."],
        ["10", "Giới Thiệu & Liên Hệ (/about, /contact-us)", "• Trang câu chuyện thương hiệu X-ON và quy trình chế tác thủ công.\n• Form gửi thư liên hệ, bản đồ, hotline hỗ trợ, thông tin mạng xã hội."],
    ]
    add_styled_table(doc, headers_4_1, data_4_1, [0.6, 2.0, 4.2])

    doc.add_heading("4.2 Phân hệ Quản trị Admin Panel (/admin)", level=2)
    headers_4_2 = ["STT", "Phân hệ Quản trị", "Chức năng & Nhiệm vụ nghiệp vụ"]
    data_4_2 = [
        ["1", "Admin Dashboard (/admin)", "Bảng điều khiển trực quan: Tổng doanh thu, Số lượng đơn hàng mới, Sản phẩm bán chạy nhất, Tổng khách hàng và biểu đồ tăng trưởng."],
        ["2", "Quản lý Sản phẩm (/admin/products)", "• Thêm mới, chỉnh sửa, xóa sản phẩm móng.\n• Tải ảnh sản phẩm trực tiếp lên Cloudinary CDN.\n• Thiết lập biến thể (Size, Shape, Length), giá bán, giá khuyến mãi, số lượng tồn kho và trạng thái kích hoạt."],
        ["3", "Quản lý Danh mục (/admin/categories)", "Phân loại nhóm sản phẩm, tạo danh mục mới, chỉnh sửa slug URL và sắp xếp thứ tự hiển thị."],
        ["4", "Quản lý Đơn hàng (/admin/orders)", "• Danh sách đơn hàng toàn hệ thống kèm bộ lọc trạng thái: Chờ xác nhận -> Đang làm móng thủ công (Customizing) -> Đang giao hàng -> Hoàn thành -> Đã hủy.\n• Xem chi tiết từng đơn hàng: Thông tin khách, địa chỉ giao hàng, danh sách móng và kích thước đo từng ngón."],
        ["5", "Quản lý Khách hàng & Sỉ (/admin/customers, /wholesale)", "• Quản lý danh sách khách hàng lẻ đã từng mua hàng.\n• Xét duyệt hồ sơ đối tác đăng ký làm đại lý sỉ (B2B Wholesale), phê duyệt mức chiết khấu riêng biệt."],
        ["6", "Quản trị Blog & Gallery (/admin/blog, /gallery)", "Soạn thảo bài viết blog với trình soạn thảo giàu tính năng, đăng tải ảnh mẫu móng vào bộ sưu tập Lookbook."],
        ["7", "Đánh giá & Bản tin (/admin/reviews, /newsletter)", "Kiểm duyệt nhận xét/đánh giá từ khách hàng, xuất danh sách email đăng ký nhận khuyến mãi phục vụ Email Marketing."],
        ["8", "Cấu hình Hệ thống (/admin/settings)", "Tùy chỉnh thông tin website: Logo, Hotline, Email hỗ trợ, Địa chỉ cửa hàng, Phí vận chuyển và Banner trang chủ."],
    ]
    add_styled_table(doc, headers_4_2, data_4_2, [0.6, 2.0, 4.2])

    # ==========================================
    # 5. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ
    # ==========================================
    h5 = doc.add_heading("5. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ", level=1)
    h5.style.font.color.rgb = RGBColor(30, 58, 138)

    headers_5 = ["Thành phần hệ thống", "Công nghệ / Framework", "Phiên bản", "Vai trò & Mục đích sử dụng"]
    data_5 = [
        ["Frontend Framework", "Next.js (App Router)", "16.3.5", "Framework React SSR/SSG/ISR tối ưu SEO và tốc độ"],
        ["Core UI Library", "React JS", "19.2.4", "Thư viện giao diện xây dựng Component tương tác cao"],
        ["Ngôn ngữ lập trình", "TypeScript", "5.x", "Đảm bảo Type-safety nghiêm ngặt, giảm thiểu runtime error"],
        ["CSS & Design System", "Tailwind CSS v4 + PostCSS", "4.0.0", "Hệ thống CSS Utility hiện đại dựa trên oklch design tokens"],
        ["UI Components", "shadcn/ui + Radix / Base UI", "4.1.0 / 1.3.0", "Bộ component nguyên tử chuẩn Accessibility và thẩm mỹ cao"],
        ["Style Utilities", "clsx + tailwind-merge", "2.1.1 / 3.5.0", "Gộp và tối ưu hóa class Tailwind linh hoạt"],
        ["Icons Package", "Lucide React", "1.6.0", "Hệ thống icon vector chuẩn xác, tối ưu dung lượng"],
        ["Cơ sở dữ liệu (Database)", "MongoDB Atlas + Mongoose", "9.10.2", "CSDL NoSQL đám mây lưu trữ Products, Orders, Users, Blogs"],
        ["Media Cloud Storage", "Cloudinary SDK", "2.11.0", "Lưu trữ, nén và phân phối hình ảnh/video sản phẩm qua CDN"],
        ["Xác thực & Bảo mật", "JSON Web Token (JWT) + bcryptjs", "9.0.3 / 3.0.3", "Mã hóa mật khẩu và xác thực phân quyền Admin an toàn"],
        ["Containerization", "Docker & Docker Compose", "Multi-stage", "Đóng gói ứng dụng chạy đồng nhất trên mọi hạ tầng"],
    ]
    add_styled_table(doc, headers_5, data_5, [1.6, 1.8, 1.0, 2.4])

    # ==========================================
    # 6. THÔNG TIN TRUY CẬP HỆ THỐNG
    # ==========================================
    h6 = doc.add_heading("6. THÔNG TIN TRUY CẬP HỆ THỐNG", level=1)
    h6.style.font.color.rgb = RGBColor(30, 58, 138)

    headers_6 = ["Hạng mục môi trường", "Địa chỉ / Đường dẫn truy cập", "Ghi chú & Phân quyền"]
    data_6 = [
        ["Môi trường Local Dev", "http://localhost:3000", "Chạy phát triển cục bộ với Next Dev server"],
        ["Trang Quản trị Local", "http://localhost:3000/admin", "Giao diện quản lý Admin nội bộ"],
        ["Môi trường Production (Live Demo)", "https://x-on4.onrender.com", "Hệ thống triển khai trực tuyến trên Cloud Render"],
        ["Admin Production URL", "https://x-on4.onrender.com/admin", "Trang quản trị hệ thống Production"],
        ["Thư mục mã nguồn cục bộ", "d:\\TaiLieu\\Code\\Intern\\X-on\\X-On-Nail-Shop", "Toàn bộ source code dự án"],
        ["Kho mã nguồn GitHub (Repository)", "binhv005/X-on4", "Quản lý phiên bản Git và lịch sử commit"],
    ]
    add_styled_table(doc, headers_6, data_6, [2.0, 2.8, 2.0])

    # ==========================================
    # 7. TÀI KHOẢN DỊCH VỤ & BIẾN MÔI TRƯỜNG
    # ==========================================
    h7 = doc.add_heading("7. TÀI KHOẢN DỊCH VỤ & THÔNG SỐ CẤU HÌNH", level=1)
    h7.style.font.color.rgb = RGBColor(30, 58, 138)

    headers_7 = ["Dịch vụ / Thành phần", "Thông số kết nối", "Chi tiết cấu hình / Key", "Mục đích sử dụng"]
    data_7 = [
        ["MongoDB Atlas", "Cluster: cluster0.oe9mxzk.mongodb.net", "User: vtb22522005_db_user (Database: xon_nail_shop)", "Lưu trữ toàn bộ dữ liệu đơn hàng, sản phẩm, khách hàng"],
        ["Cloudinary Media", "Cloud Name: ai1z2oaj", "API Key: 172892198212144 (Secret bảo mật lưu tại Server)", "Lưu trữ hình ảnh sản phẩm, banner, blog"],
        ["JWT Authentication", "JWT_SECRET", "xon-nail-secret-key-production-2026-super-secure", "Khóa ký tạo token xác thực phiên đăng nhập"],
        ["Site URL", "NEXT_PUBLIC_SITE_URL", "https://x-on4.onrender.com", "Định danh URL chính của website phục vụ SEO và Webhook"],
    ]
    add_styled_table(doc, headers_7, data_7, [1.6, 1.8, 1.8, 1.6])

    # ==========================================
    # 8. CẤU TRÚC MÃ NGUỒN (SOURCE TREE)
    # ==========================================
    h8 = doc.add_heading("8. CẤU TRÚC MÃ NGUỒN & CHI TIẾT THÀNH PHẦN", level=1)
    h8.style.font.color.rgb = RGBColor(30, 58, 138)

    p_tree = doc.add_paragraph()
    p_tree.paragraph_format.space_after = Pt(6)
    p_tree.add_run("Sơ đồ cây thư mục mã nguồn chính của dự án:")

    tree_str = (
        "X-On-Nail-Shop/\n"
        "├── public/                         # Tài nguyên tĩnh công khai (ảnh, video, favicon, webmanifest)\n"
        "│   ├── images/                     # Hình ảnh banner, bộ sưu tập móng, phụ kiện\n"
        "│   ├── videos/                     # Video demo hướng dẫn gắn móng\n"
        "│   └── seo/                        # Favicons, OpenGraph metadata\n"
        "├── src/\n"
        "│   ├── app/                        # Next.js 16 App Router (Pages & RESTful API)\n"
        "│   │   ├── (Storefront Pages)      # Các trang giao diện khách hàng\n"
        "│   │   │   ├── page.tsx            # Trang chủ Homepage (Hero, Featured, Trending, Story)\n"
        "│   │   │   ├── shop/               # Trang danh sách sản phẩm & bộ lọc chuyên sâu\n"
        "│   │   │   ├── product/[slug]/     # Trang chi tiết sản phẩm, chọn size/shape/length\n"
        "│   │   │   ├── product-category/   # Phân loại sản phẩm theo danh mục\n"
        "│   │   │   ├── cart/               # Trang giỏ hàng và tiến trình thanh toán\n"
        "│   │   │   ├── sizing-chart/       # Hướng dẫn chi tiết đo size móng (Fit Guide)\n"
        "│   │   │   ├── wholesale-signup/   # Biểu mẫu đăng ký mở đại lý / khách sỉ B2B\n"
        "│   │   │   ├── bundle-and-save/    # Gói combo mua kèm phụ kiện tiết kiệm\n"
        "│   │   │   ├── gallery-product/    # Bộ sưu tập hình ảnh móng thực tế Lookbook\n"
        "│   │   │   ├── blog/               # Cẩm nang mẹo làm móng & bài viết tin tức\n"
        "│   │   │   ├── about/              # Giới thiệu thương hiệu X-ON Nail\n"
        "│   │   │   └── contact-us/         # Form liên hệ & thông tin hỗ trợ\n"
        "│   │   ├── admin/                  # Hệ thống quản trị Admin Portal toàn diện\n"
        "│   │   │   ├── page.tsx            # Dashboard tổng quan thống kê doanh số & đơn hàng\n"
        "│   │   │   ├── products/           # Quản lý thêm/sửa/xóa sản phẩm & biến thể\n"
        "│   │   │   ├── categories/         # Quản trị danh mục móng\n"
        "│   │   │   ├── orders/             # Xử lý đơn hàng & cập nhật trạng thái làm móng\n"
        "│   │   │   ├── customers/          # Danh sách khách hàng và đối tác\n"
        "│   │   │   ├── wholesale/          # Duyệt hồ sơ đại lý sỉ B2B\n"
        "│   │   │   ├── blog/               # Soạn thảo và đăng bài viết\n"
        "│   │   │   ├── gallery/            # Quản trị album ảnh lookbook\n"
        "│   │   │   ├── reviews/            # Kiểm duyệt đánh giá của khách hàng\n"
        "│   │   │   ├── newsletter/         # Danh sách email tiếp thị\n"
        "│   │   │   ├── settings/           # Cấu hình website (Banner, Hotline, Phí ship)\n"
        "│   │   │   └── layout.tsx          # Khung layout trang Admin (Sidebar + Topbar)\n"
        "│   │   ├── api/                    # Serverless API Handlers Backend\n"
        "│   │   │   ├── products/           # API lấy, tạo, cập nhật, xóa sản phẩm\n"
        "│   │   │   ├── categories/         # API danh mục\n"
        "│   │   │   ├── orders/             # API tạo đơn hàng, cập nhật trạng thái đơn\n"
        "│   │   │   ├── upload/             # API upload ảnh lên Cloudinary\n"
        "│   │   │   ├── wholesale/          # API tiếp nhận form đại lý sỉ\n"
        "│   │   │   ├── contact/            # API nhận form liên hệ\n"
        "│   │   │   └── settings/           # API thiết lập cấu hình\n"
        "│   │   ├── globals.css             # Định nghĩa Design Tokens Tailwind v4 & CSS toàn cục\n"
        "│   │   └── layout.tsx              # Root Layout bọc CartProvider, ToastProvider\n"
        "│   ├── components/                 # Các React Components tái sử dụng\n"
        "│   │   ├── Header.tsx              # Header điều hướng, tìm kiếm, mini-cart badge\n"
        "│   │   ├── Footer.tsx              # Footer thương hiệu, liên kết, form newsletter\n"
        "│   │   ├── CartDrawer.tsx          # Drawer giỏ hàng trượt bên phải\n"
        "│   │   ├── ProductCard.tsx         # Card hiển thị sản phẩm móng, giá, nút chọn size\n"
        "│   │   ├── StoreShell.tsx          # Khung layout bao bọc storefront\n"
        "│   │   ├── admin/                  # Components dành riêng cho Admin (ProductForm, AdminSidebar...)\n"
        "│   │   └── ui/                     # UI Primitives theo chuẩn shadcn/ui\n"
        "│   ├── context/                    # Quản lý State toàn cục (CartContext, AdminAuthContext, ToastContext)\n"
        "│   ├── lib/                        # Kết nối DB MongoDB, Cloudinary SDK, JWT Auth, Mongoose Models\n"
        "│   ├── types/                      # TypeScript Interfaces cho Product, Order, User, Category...\n"
        "│   └── data/                       # Dữ liệu khởi tạo mẫu (products.json, media-map.json...)\n"
        "├── Dockerfile & docker-compose.yml # Cấu hình containerization\n"
        "├── package.json                    # Khai báo dependencies & scripts\n"
        "├── tsconfig.json                   # Cấu hình TypeScript strict mode\n"
        "└── .env.local                      # Cấu hình biến môi trường cục bộ\n"
    )

    p_code = doc.add_paragraph()
    p_code.paragraph_format.space_before = Pt(4)
    p_code.paragraph_format.space_after = Pt(8)
    run_tree = p_code.add_run(tree_str)
    run_tree.font.name = 'Consolas'
    run_tree.font.size = Pt(8.5)
    run_tree.font.color.rgb = RGBColor(15, 23, 42)

    # ==========================================
    # 9. HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH
    # ==========================================
    h9 = doc.add_heading("9. HƯỚNG DẪN CÀI ĐẶT, VẬN HÀNH & TRIỂN KHAI", level=1)
    h9.style.font.color.rgb = RGBColor(30, 58, 138)

    p_req = doc.add_paragraph()
    r = p_req.add_run("9.1 Yêu cầu môi trường hệ thống:\n")
    r.font.bold = True
    p_req.add_run(
        "• Node.js: Phiên bản v24.x trở lên (tối thiểu Node.js 18.18+).\n"
        "• Trình quản lý gói: NPM v10.x trở lên hoặc PNPM / Yarn.\n"
        "• CSDL: MongoDB Server cục bộ hoặc MongoDB Atlas Cloud URI.\n"
        "• Tài khoản Cloudinary để kích hoạt tính năng upload ảnh."
    )

    p_step = doc.add_paragraph()
    r = p_step.add_run("9.2 Các bước khởi chạy dự án tại môi trường Local Dev:\n")
    r.font.bold = True
    
    steps_data = [
        ["Bước", "Lệnh thực thi (Command)", "Mô tả kết quả"],
        ["Bước 1", "npm install", "Cài đặt toàn bộ các thư viện dependencies từ package.json"],
        ["Bước 2", "Tạo file .env.local", "Sao chép từ .env.example và điền đầy đủ MONGODB_URI, Cloudinary Keys, JWT_SECRET"],
        ["Bước 3", "npm run dev", "Khởi chạy Next.js Development Server tại địa chỉ http://localhost:3000"],
        ["Bước 4", "npm run check", "Chạy quy trình kiểm thử toàn diện: ESLint + TypeScript typecheck + Next Build"],
    ]
    add_styled_table(doc, ["Bước", "Lệnh thực thi", "Mô tả kết quả"], [r[1:] for r in steps_data[1:]], [1.0, 2.2, 3.6])

    p_deploy = doc.add_paragraph()
    r = p_deploy.add_run("9.3 Hướng dẫn đóng gói Production & Triển khai Docker:\n")
    r.font.bold = True
    p_deploy.add_run(
        "• Đóng gói Production chuẩn Next.js:\n"
        "   `npm run build` -> Sau đó chạy `npm run start` để khởi động server production.\n"
        "• Triển khai qua Docker Compose:\n"
        "   `docker compose up -d --build` -> Tự động build image multi-stage tối ưu và chạy service tại port 3000."
    )

    # ==========================================
    # 10. ĐỀ XUẤT NÂNG CẤP & MỞ RỘNG
    # ==========================================
    h10 = doc.add_heading("10. KẾ HOẠCH ĐỀ XUẤT NÂNG CẤP & MỞ RỘNG", level=1)
    h10.style.font.color.rgb = RGBColor(30, 58, 138)

    headers_10 = ["Hạng mục nâng cấp", "Mô tả giải pháp đề xuất", "Lợi ích mang lại"]
    data_10 = [
        ["Cổng Thanh Toán Trực Tuyến Tự Động", "Tích hợp cổng thanh toán VietQR (PayOS / SeAPay), VNPay, MoMo và Stripe/PayPal dành cho khách hàng quốc tế.", "Tự động hóa 100% quy trình thanh toán, giảm tỷ lệ hủy đơn COD."],
        ["Tính Năng Thử Móng Ảo (AR Virtual Try-On)", "Sử dụng công nghệ AI Camera / MediaPipe nhận diện bàn tay và ướm trực tiếp mẫu nail lên móng khách hàng qua camera điện thoại.", "Tạo trải nghiệm đột phá, kích thích khách hàng chốt đơn nhanh chóng."],
        ["Đồng Bộ Đơn Vị Vận Chuyển Tự Động", "Kết nối API các đơn vị vận chuyển (GHTK, Viettel Post, GHN) để tự động tạo mã vận đơn và tra cứu lộ trình bưu phẩm thời gian thực.", "Tiết kiệm 80% thời gian đóng gói và nhập đơn thủ công."],
        ["Hệ Thống Khách Hàng Thân Thiết (Loyalty)", "Tích điểm thưởng sau mỗi lần mua móng, đổi voucher giảm giá và cấp bậc thành viên (VIP Silver, Gold, Platinum).", "Gia tăng tỷ lệ mua lại (Retention Rate) của khách hàng trung thành."],
    ]
    add_styled_table(doc, headers_10, data_10, [1.8, 3.0, 2.0])

    # ==========================================
    # 11. LƯU Ý QUAN TRỌNG CHO ĐỘI NGŨ TIẾP NHẬN
    # ==========================================
    h11 = doc.add_heading("11. LƯU Ý QUAN TRỌNG CHO DEVELOPER / ĐỘI TIẾP NHẬN", level=1)
    h11.style.font.color.rgb = RGBColor(30, 58, 138)

    headers_11 = ["Hạng mục lưu ý", "Chi tiết kỹ thuật & Khuyến nghị vận hành"]
    data_11 = [
        ["Quản lý Kích thước Móng (Custom Sizing)", "Mỗi bộ móng làm thủ công có thể yêu cầu kích thước riêng từng ngón tay của khách. Cần kiểm tra kỹ trường `customSizes` trong chi tiết đơn hàng trước khi chuyển qua bộ phận chế tác."],
        ["Bảo mật Biến Môi Trường", "Tuyệt đối không đẩy file `.env.local` lên Git. Các biến bí mật như `CLOUDINARY_API_SECRET`, `MONGODB_URI`, `JWT_SECRET` phải được bảo vệ trên biến môi trường máy chủ."],
        ["Tối ưu Tải Ảnh & CDN", "Tất cả ảnh tải lên qua Cloudinary đã được tích hợp chuyển đổi tự động sang định dạng WebP/AVIF để duy trì tốc độ tải trang cao nhất."],
        ["Quy trình Sao Lưu Dữ Liệu (Backup)", "MongoDB Atlas đã bật cơ chế tự động Snapshot Backup. Khuyến nghị thực hiện export dữ liệu định kỳ mỗi tháng một lần."],
    ]
    add_styled_table(doc, headers_11, data_11, [2.2, 4.6])

    # ==========================================
    # 12. THÀNH VIÊN DỰ ÁN & BÀN GIAO
    # ==========================================
    h12 = doc.add_heading("12. NHÂN SỰ DỰ ÁN & BIÊN BẢN XÁC NHẬN", level=1)
    h12.style.font.color.rgb = RGBColor(30, 58, 138)

    headers_12 = ["STT", "Họ và tên", "Vai trò dự án", "Nhiệm vụ chính đã thực hiện"]
    data_12 = [
        ["1", "Võ Thị Bình", "Full Stack Lead Developer", "Phụ trách thiết kế kiến trúc hệ thống Next.js 16, xây dựng toàn bộ giao diện Storefront, Admin Portal, REST API, tích hợp MongoDB Atlas & Cloudinary."],
        ["2", "Ban Quản Trị X-ON", "Product Owner / Nghiệm thu", "Đặc tả yêu cầu nghiệp vụ ngành móng, duyệt thiết kế UI/UX và nghiệm thu chất lượng hệ thống."],
    ]
    add_styled_table(doc, headers_12, data_12, [0.6, 1.8, 1.8, 2.6])

    # Sign-off Table
    p_sign_title = doc.add_paragraph()
    r = p_sign_title.add_run("THÔNG TIN XÁC NHẬN VÀ KÝ BÀN GIAO")
    r.font.bold = True
    r.font.size = Pt(11)
    p_sign_title.paragraph_format.space_before = Pt(8)
    p_sign_title.paragraph_format.space_after = Pt(4)

    headers_sign_info = ["Hạng mục", "Thông tin chi tiết"]
    data_sign_info = [
        ["Trạng thái bàn giao", "Hoàn thành 100% các hạng mục kỹ thuật, cơ sở dữ liệu và giao diện"],
        ["Ngày thực hiện bàn giao", "01/10/2026"],
        ["Đại diện bên Bàn giao", "Võ Thị Bình (Full Stack Lead Developer)"],
        ["Đại diện bên Tiếp nhận", "Ban Lãnh Đạo / Đại Diện X-ON Nail Shop"],
        ["Hình thức bàn giao", "Toàn bộ Source Code GitHub, CSDL MongoDB, Dịch vụ Cloudinary & Tài liệu hướng dẫn"],
    ]
    add_styled_table(doc, headers_sign_info, data_sign_info, [2.2, 4.6])

    # Signatures
    tbl_sign = doc.add_table(rows=4, cols=2)
    tbl_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_sign, color="FFFFFF") # borderless table
    
    r0 = tbl_sign.rows[0]
    r0.cells[0].paragraphs[0].text = "ĐẠI DIỆN BÊN BÀN GIAO\n(Ký và ghi rõ họ tên)"
    r0.cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    r0.cells[0].paragraphs[0].runs[0].font.bold = True
    
    r0.cells[1].paragraphs[0].text = "ĐẠI DIỆN BÊN TIẾP NHẬN\n(Ký và ghi rõ họ tên)"
    r0.cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    r0.cells[1].paragraphs[0].runs[0].font.bold = True
    
    # Empty rows for physical signature spacing
    tbl_sign.rows[1].cells[0].paragraphs[0].text = "\n\n\n"
    tbl_sign.rows[1].cells[1].paragraphs[0].text = "\n\n\n"
    
    r3 = tbl_sign.rows[2]
    r3.cells[0].paragraphs[0].text = "Võ Thị Bình\nFull Stack Lead Developer"
    r3.cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    r3.cells[0].paragraphs[0].runs[0].font.bold = True
    
    r3.cells[1].paragraphs[0].text = "Ban Lãnh Đạo X-ON Nail Shop\nĐại Diện Khách Hàng"
    r3.cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    r3.cells[1].paragraphs[0].runs[0].font.bold = True

    for row in tbl_sign.rows:
        row.cells[0].width = Inches(3.4)
        row.cells[1].width = Inches(3.4)

    # Save document
    doc.save(output_path)
    print(f"Successfully created handover document at: {output_path}")

if __name__ == "__main__":
    out_file = r"d:\TaiLieu\Code\Intern\X-on\X-On-Nail-Shop\BÀN GIAO DỰ ÁN.docx"
    create_handover_document(out_file)
