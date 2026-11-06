import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

BASE_DIR = os.path.abspath("C:/Users/TRB/modified mindspace sdg/CrediAI/GFG 2.0")
DOCX_PATH = os.path.join(BASE_DIR, "GAP_FOR_GOOD_MASTER_REPORT.docx")
PDF_PATH = os.path.join(BASE_DIR, "GAP_FOR_GOOD_MASTER_REPORT.pdf")

DOCS_TO_INCLUDE = [
    ("Master Technical Documentation", os.path.join(BASE_DIR, "TECHNICAL_DOCUMENTATION.md")),
    ("System Architecture Specification", os.path.join(BASE_DIR, "SYSTEM_ARCHITECTURE.md")),
    ("Social Impact Framework", os.path.join(BASE_DIR, "SOCIAL_IMPACT_FRAMEWORK.md")),
    ("Business Model & Commercial Strategy", os.path.join(BASE_DIR, "BUSINESS_MODEL_AND_VALUE_PROPOSITION.md")),
    ("Investor Presentation Content", os.path.join(BASE_DIR, "INVESTOR_PITCH_CONTENT.md")),
    ("Pilot Validation Plan", os.path.join(BASE_DIR, "PILOT_VALIDATION_PLAN.md")),
    ("Final Production Readiness & Gap Report", os.path.join(BASE_DIR, "FINAL_READINESS_AND_GAP_REPORT.md")),
    ("Master Documentation Index", os.path.join(BASE_DIR, "DOCUMENTATION_INDEX.md")),
]

def generate_docx():
    print("Generating DOCX...")
    doc = Document()
    
    # Page setup
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)

    # Styles
    # Midnight & Sage Colors
    color_midnight = RGBColor(17, 23, 20)      # #111714
    color_sage = RGBColor(110, 140, 95)         # #6E8C5F
    color_charcoal = RGBColor(40, 50, 42)

    # Title Page
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("GAP FOR GOOD (GFG 2.0)\n")
    run_title.font.size = Pt(28)
    run_title.font.bold = True
    run_title.font.color.rgb = color_midnight

    run_sub = p_title.add_run("Comprehensive Engineering, Architecture, Social Impact, Business Model & Final Audit Package\n\n")
    run_sub.font.size = Pt(14)
    run_sub.font.color.rgb = color_sage

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_meta = p_meta.add_run("Version 2.0.0-PROD-CANDIDATE | November 2026\nCore Platform Architecture & Social Enterprise Team\n")
    r_meta.font.size = Pt(10)
    r_meta.font.color.rgb = RGBColor(100, 100, 100)

    doc.add_page_break()

    for title, filepath in DOCS_TO_INCLUDE:
        if not os.path.exists(filepath):
            print(f"Skipping {filepath} (not found)")
            continue
            
        print(f"Adding {title} to DOCX...")
        p_sec_title = doc.add_paragraph()
        r_sec_title = p_sec_title.add_run(title)
        r_sec_title.font.size = Pt(20)
        r_sec_title.font.bold = True
        r_sec_title.font.color.rgb = color_midnight

        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()

        in_code_block = False
        for line in lines:
            line_str = line.strip()
            if line_str.startswith("```"):
                in_code_block = not in_code_block
                continue
            if in_code_block:
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.4)
                r = p.add_run(line.rstrip())
                r.font.name = "Consolas"
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(60, 60, 60)
                continue

            if not line_str:
                continue

            if line_str.startswith("# "):
                continue # Already added section title
            elif line_str.startswith("## "):
                h = doc.add_paragraph()
                r = h.add_run(line_str.replace("## ", ""))
                r.font.size = Pt(15)
                r.font.bold = True
                r.font.color.rgb = color_midnight
            elif line_str.startswith("### "):
                h = doc.add_paragraph()
                r = h.add_run(line_str.replace("### ", ""))
                r.font.size = Pt(12)
                r.font.bold = True
                r.font.color.rgb = color_charcoal
            elif line_str.startswith("- ") or line_str.startswith("* "):
                p = doc.add_paragraph(style='List Bullet')
                r = p.add_run(line_str[2:])
                r.font.size = Pt(10)
            elif line_str.startswith(">"):
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.3)
                r = p.add_run(line_str.replace(">", "").strip())
                r.font.italic = True
                r.font.size = Pt(10)
                r.font.color.rgb = color_charcoal
            elif "|" in line_str:
                # Simple table line rendering
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.2)
                r = p.add_run(line_str)
                r.font.name = "Consolas"
                r.font.size = Pt(8.5)
            else:
                p = doc.add_paragraph()
                r = p.add_run(line_str)
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(30, 30, 30)

        doc.add_page_break()

    doc.save(DOCX_PATH)
    print(f"Successfully created DOCX: {DOCX_PATH}")

def generate_pdf():
    print("Generating PDF...")
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        rightMargin=45, leftMargin=45,
        topMargin=45, bottomMargin=45
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#111714'),
        alignment=1, # Center
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#6E8C5F'),
        alignment=1,
        spaceAfter=30
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#111714'),
        spaceBefore=18,
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#202A23'),
        spaceBefore=12,
        spaceAfter=6
    )

    h3_style = ParagraphStyle(
        'H3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#344236'),
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#222222'),
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'Code',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#333333'),
        leftIndent=15,
        spaceAfter=3
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        leftIndent=15,
        textColor=colors.HexColor('#222222'),
        spaceAfter=4
    )

    story = []

    # Title Page
    story.append(Spacer(1, 150))
    story.append(Paragraph("GAP FOR GOOD (GFG 2.0)", title_style))
    story.append(Paragraph("Master Engineering, Architecture, Social Impact & Business Documentation", subtitle_style))
    story.append(Spacer(1, 30))
    story.append(Paragraph("Version 2.0.0-PROD-CANDIDATE • November 2026<br/>FastAPI / Next.js 16 / SQLAlchemy 2.0 Architecture Baseline", ParagraphStyle('Meta', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, alignment=1, textColor=colors.HexColor('#666666'))))
    story.append(PageBreak())

    for title, filepath in DOCS_TO_INCLUDE:
        if not os.path.exists(filepath):
            continue

        story.append(Paragraph(title, h1_style))
        story.append(Spacer(1, 8))

        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()

        in_code_block = False
        for line in lines:
            line_str = line.strip()
            if line_str.startswith("```"):
                in_code_block = not in_code_block
                continue
            if in_code_block:
                clean_line = line.rstrip().replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                if clean_line:
                    story.append(Paragraph(clean_line, code_style))
                continue

            if not line_str:
                continue

            if line_str.startswith("# "):
                continue
            elif line_str.startswith("## "):
                clean = line_str.replace("## ", "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                story.append(Paragraph(clean, h2_style))
            elif line_str.startswith("### "):
                clean = line_str.replace("### ", "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                story.append(Paragraph(clean, h3_style))
            elif line_str.startswith("- ") or line_str.startswith("* "):
                clean = line_str[2:].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                story.append(Paragraph("• " + clean, bullet_style))
            elif "|" in line_str:
                clean = line_str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                story.append(Paragraph(clean, code_style))
            else:
                clean = line_str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                story.append(Paragraph(clean, body_style))

        story.append(PageBreak())

    doc.build(story)
    print(f"Successfully created PDF: {PDF_PATH}")

if __name__ == "__main__":
    generate_docx()
    generate_pdf()

