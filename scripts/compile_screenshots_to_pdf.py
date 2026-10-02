import os
import sys
from PIL import Image as PILImage
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image as RLImage, Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, 'screenshots')
OUTPUT_PDF = os.path.join(BASE_DIR, 'Hotel_Sai_International_Complete_Walkthrough.pdf')

SECTIONS_METADATA = [
    # Part 1: Public Guest Experience & 3D Immersion
    {
        "filename": "01_hero_booking_portal.png",
        "part": "PART 1: PUBLIC GUEST EXPERIENCE & 3D IMMERSION",
        "title": "Public Guest Landing Page & Instant Reservation Bar",
        "desc": "Full-bleed luxury hero showcase featuring real-time room availability counters, 24/7 reception desk line, proximity indicators (1.5 km to Station, 2.0 km to Maa Majhighariani Temple), and direct check-in booking bar."
    },
    {
        "filename": "02_room_inventory_catalog.png",
        "part": "PART 1: PUBLIC GUEST EXPERIENCE & 3D IMMERSION",
        "title": "40-Room Inventory Catalog with IDeaS G3 RMS Micro-Rates",
        "desc": "Real-time room tier breakdown (Standard Deluxe, Deluxe Room, Executive Room, and Premium Suite) powered by continuous algorithmic pricing, occupancy barometer, amenity badges, and instant 3D view triggers."
    },
    {
        "filename": "03_satvik_dining_specialties.png",
        "part": "PART 1: PUBLIC GUEST EXPERIENCE & 3D IMMERSION",
        "title": "Satvik Pure Vegetarian Dining & Rayagada Odia Delicacies",
        "desc": "Dedicated spiritual culinary section featuring authentic Odia dishes, satvik preparations (no onion, no garlic, desi ghee), dietary badges (Jain friendly), and direct digital ordering."
    },
    {
        "filename": "04_room_reservation_engine.png",
        "part": "PART 1: PUBLIC GUEST EXPERIENCE & 3D IMMERSION",
        "title": "Direct Room Reservation Engine & Pricing Calculator",
        "desc": "High-conversion booking modal with real-time interactive calendar date picker, guest occupancy selectors, statutory GST breakdown (12% / 18%), and privacy-preserving Aadhaar masking."
    },
    {
        "filename": "05_interactive_3d_floor_tour.png",
        "part": "PART 1: PUBLIC GUEST EXPERIENCE & 3D IMMERSION",
        "title": "3D Multi-Floor Interactive Explorer & Isometric Navigator",
        "desc": "Three.js powered 3D architectural floor explorer showcasing Ground Floor Lobby & Cannon Kitchen, plus Floors 1 through 4 with room occupancy statuses, elevator shafts, and interactive room hotspots."
    },
    {
        "filename": "06_pilgrimage_darshan_advisor.png",
        "part": "PART 1: PUBLIC GUEST EXPERIENCE & 3D IMMERSION",
        "title": "Spiritual Pilgrimage & Sacred Temple Darshan Advisor",
        "desc": "Curated temple timing guide and pilgrimage companion for Maa Majhighariani Temple, Rayagada Jagannath Temple, and Paikapada Shiva Temple, with ritual schedules, distance meters, and priest assistance."
    },
    {
        "filename": "07_ai_concierge_assistant.png",
        "part": "PART 1: PUBLIC GUEST EXPERIENCE & 3D IMMERSION",
        "title": "24/7 AI Concierge Assistant & Guest Dispatcher",
        "desc": "Conversational artificial intelligence assistant handling guest queries on local logistics, train timetables, custom dining requests, extra amenities, and Rayagada regional attractions."
    },
    {
        "filename": "08_autonomous_bot_fleet.png",
        "part": "PART 1: PUBLIC GUEST EXPERIENCE & 3D IMMERSION",
        "title": "Autonomous Service Bot Fleet & UV Disinfection Robots",
        "desc": "Smart robotics dashboard monitoring automated in-room contactless delivery rovers, luggage transport bots, and hospital-grade UV-C room sterilization cycles across all 4 hotel floors."
    },

    # Part 2: Cannon Kitchen POS & Multi-Outlet F&B Engine
    {
        "filename": "09_pos_18_tables_dining_grid.png",
        "part": "PART 2: CANNON KITCHEN POS & MULTI-OUTLET F&B ENGINE",
        "title": "Cannon Kitchen POS - 18 Tables Dining Floor Matrix",
        "desc": "Complete restaurant floor grid displaying all 18 physical dining tables with color-coded live statuses (Vacant Green, Occupied Red, Billed Yellow), guest names, assigned captains, and active KOT counts."
    },
    {
        "filename": "10_pos_85_dish_catalog_and_punch.png",
        "part": "PART 2: CANNON KITCHEN POS & MULTI-OUTLET F&B ENGINE",
        "title": "Cannon Kitchen POS - 85-Item Menu Catalog & Rapid Code Punch",
        "desc": "High-velocity billing interface with 85 culinary items, category filters, cooking modifier tags (Satvik, Mild, Desi Ghee), quantity multiplier keyboard parsing (e.g. 54*3), and live cart summary."
    },
    {
        "filename": "11_pos_table_settlement_dynamic_upi.png",
        "part": "PART 2: CANNON KITCHEN POS & MULTI-OUTLET F&B ENGINE",
        "title": "Cannon Kitchen POS - Direct Table Settlement & Dynamic SBI UPI QR",
        "desc": "Standalone table settlement modal generating dynamic UPI QR codes (eswara.hotel@sbi) with exact transaction amounts, split-tender modes (Cash + UPI), and official Retail Tax Invoice generation."
    },
    {
        "filename": "12_pos_live_kds_kitchen_queue.png",
        "part": "PART 2: CANNON KITCHEN POS & MULTI-OUTLET F&B ENGINE",
        "title": "Cannon Kitchen POS - Live Kitchen Display System (KDS)",
        "desc": "Real-time kitchen order ticket (KOT) dispatcher for executive chefs and captains, featuring preparation timers, priority badges, sound alert chimes, and audit-logged item void controls."
    },
    {
        "filename": "13_pos_daily_item_sales_register.png",
        "part": "PART 2: CANNON KITCHEN POS & MULTI-OUTLET F&B ENGINE",
        "title": "Cannon Kitchen POS - Daily Item Sales & Quantity Register",
        "desc": "Official daily item sales audit register (Sale ఆ వివరణ) itemizing sold quantities, category contributions, and gross revenues matching the authentic ₹67,846 day book."
    },

    # Part 3: Front Desk & 39-Room Property Management System
    {
        "filename": "14_pms_reception_tape_chart.png",
        "part": "PART 3: FRONT DESK & 39-ROOM PROPERTY MANAGEMENT SYSTEM",
        "title": "Front Desk PMS - 39-Room Authentic MySoft Tape Chart Matrix",
        "desc": "Comprehensive room inventory grid displaying all 39 physical rooms categorized across 5 operational lifecycle stages: Vacant Clean, Vacant Dirty, Occupied Clean, Occupied Dirty, and Maintenance OOO."
    },
    {
        "filename": "15_pms_booking_visualizer_calendar.png",
        "part": "PART 3: FRONT DESK & 39-ROOM PROPERTY MANAGEMENT SYSTEM",
        "title": "Front Desk PMS - Interactive Booking Visualizer & Timeline",
        "desc": "Gantt timeline calendar visualizing historical and upcoming room occupancy, corporate delegations (JK Paper, GAIL, IMFA), arrival schedules, and booking durations."
    },
    {
        "filename": "16_pms_occupancy_analytics_report.png",
        "part": "PART 3: FRONT DESK & 39-ROOM PROPERTY MANAGEMENT SYSTEM",
        "title": "Front Desk PMS - Multi-Tier Occupancy Analytics (Day/Month/Year)",
        "desc": "Executive statistical dashboard tracking Average Daily Rate (ADR), Revenue Per Available Room (RevPAR), total room nights sold, and multi-year projected revenue growth with CSV export."
    },
    {
        "filename": "17_pms_cashier_shift_handover_audit.png",
        "part": "PART 3: FRONT DESK & 39-ROOM PROPERTY MANAGEMENT SYSTEM",
        "title": "Front Desk PMS - Cashier Shift Handover & Night Audit Summary",
        "desc": "Shift cash drawer reconciliation matrix detailing cash floats, UPI collections, corporate BTC entries, safe drop receipts, and shift handover sign-offs between receptionists."
    },
    {
        "filename": "18_pms_housekeeping_turnover_board.png",
        "part": "PART 3: FRONT DESK & 39-ROOM PROPERTY MANAGEMENT SYSTEM",
        "title": "Front Desk PMS - Housekeeping Turnover & Room Care Tracker",
        "desc": "Operational housekeeping board tracking vacant dirty turnover progress, attendant assignments (Anita Majhi, Babula Sahu), cleaning completion times, and supervisor sign-offs."
    },
    {
        "filename": "19_pms_linen_room_assets_audit.png",
        "part": "PART 3: FRONT DESK & 39-ROOM PROPERTY MANAGEMENT SYSTEM",
        "title": "Front Desk PMS - Linen Room & Room Assets Tracker (Part 3)",
        "desc": "Asset management ledger tracking terry bath towels, king bedsheets, duvet covers, pillowcases, television remotes, and electric kettles with loss prevention and laundry turnover counts."
    },
    {
        "filename": "20_pms_staff_attendance_payroll.png",
        "part": "PART 3: FRONT DESK & 39-ROOM PROPERTY MANAGEMENT SYSTEM",
        "title": "Front Desk PMS - Staff Biometric Attendance & Payroll Ledger",
        "desc": "Personnel administration console logging biometric check-ins, duty shifts, overtime allowances, advance salary draws, and monthly net payouts across all hotel departments."
    },
    {
        "filename": "21_pms_sarai_act_police_register.png",
        "part": "PART 3: FRONT DESK & 39-ROOM PROPERTY MANAGEMENT SYSTEM",
        "title": "Front Desk PMS - Sarai Act 1867 & Police Register (Form-C)",
        "desc": "Statutory government compliance ledger capturing all interstate and foreign travelers, arrival timestamps, masked Aadhaar / Passport IDs, origin states, and one-click WhatsApp police dispatch."
    },
    {
        "filename": "22_pms_dpdp_privacy_vault.png",
        "part": "PART 3: FRONT DESK & 39-ROOM PROPERTY MANAGEMENT SYSTEM",
        "title": "Front Desk PMS - DPDP Act 2023 Compliance & Data Privacy Vault",
        "desc": "Indian Digital Personal Data Protection Act compliance suite featuring explicit consent capture, cryptographic identity hashing, audit logging, and automated data retention / erasure management."
    },

    # Part 4: Central Accounts & Financial Intelligence
    {
        "filename": "23_accounts_audit_reconciler_zero_var.png",
        "part": "PART 4: CENTRAL ACCOUNTS & FINANCIAL INTELLIGENCE",
        "title": "Accounts Ledger - Zero-Variance Audit Reconciler",
        "desc": "High-integrity double-entry trial balance reconciling Front Desk PMS folio debits against cashier collections, bank settlements, and merchant credits with mathematical zero-variance validation."
    },
    {
        "filename": "24_accounts_85_item_sales_costing.png",
        "part": "PART 4: CENTRAL ACCOUNTS & FINANCIAL INTELLIGENCE",
        "title": "Accounts Ledger - 85-Item Culinary Sales & Kitchen Costing",
        "desc": "Authentic Item Wise Sales Report (2026-09-24) analyzing all 85 catalog dishes, food cost percentages (22% to 34%), gross margins (66% to 78%), and grand total sales of ₹67,846 across 503 units."
    },
    {
        "filename": "25_accounts_daily_day_book.png",
        "part": "PART 4: CENTRAL ACCOUNTS & FINANCIAL INTELLIGENCE",
        "title": "Accounts Ledger - Daily Day Book & Cash-Bank Tender Balancing",
        "desc": "Granular chronological financial ledger recording every debit, credit, advance deposit, and split-tender payment mode, guaranteeing exact daily closing balances."
    },
    {
        "filename": "26_accounts_corporate_b2b_ledger.png",
        "part": "PART 4: CENTRAL ACCOUNTS & FINANCIAL INTELLIGENCE",
        "title": "Accounts Ledger - Ashok Leyland & Corporate B2B Ledger (₹2.14L)",
        "desc": "Enterprise corporate billing ledger tracking major regional corporate accounts (Ashok Leyland, JK Paper, IMFA, GAIL, PRADAN), credit limits, 30/60 day aging schedules, and TDS deductions."
    },
    {
        "filename": "27_accounts_monthly_gstr1_statement.png",
        "part": "PART 4: CENTRAL ACCOUNTS & FINANCIAL INTELLIGENCE",
        "title": "Accounts Ledger - Monthly GSTR-1 & B2B GST Tax Statement",
        "desc": "Statutory tax audit statement itemizing B2B corporate taxable turnovers under SAC 996311 (Accommodation) and SAC 996331 (Restaurant F&B) with CGST, SGST, IGST, and GSTR-2B ITC matching."
    },

    # Part 5: Enterprise Control, Inventory & In-Room Companion
    {
        "filename": "28_night_audit_portal_lock.png",
        "part": "PART 5: ENTERPRISE CONTROL, INVENTORY & IN-ROOM COMPANION",
        "title": "IDS Next Night Audit Portal - 12 AM Roll Over & Financial Lock",
        "desc": "Automated 4-stage midnight audit procedure executing room tariff postings, ledger transaction locks (is_locked = 1), trial balance verification, and official business date rollover."
    },
    {
        "filename": "29_director_executive_command_portal.png",
        "part": "PART 5: ENTERPRISE CONTROL, INVENTORY & IN-ROOM COMPANION",
        "title": "Executive Director Command Portal - Remote Operational Oversight",
        "desc": "Managing Director Eswara's mobile executive dashboard monitoring real-time occupancy rates, RevPAR, gross revenue trends, departmental expense ratios, and direct RMS tariff overrides."
    },
    {
        "filename": "30_mandi_store_inventory_management.png",
        "part": "PART 5: ENTERPRISE CONTROL, INVENTORY & IN-ROOM COMPANION",
        "title": "Mandi Store & Central Kitchen Inventory Management",
        "desc": "Kitchen procurement and central storeroom console managing fresh vegetable stocks, dry grocery par levels, minimum reorder thresholds, Goods Receipt Notes (GRN), and supplier invoices."
    },
    {
        "filename": "31_master_folio_split_bill_settlement.png",
        "part": "PART 5: ENTERPRISE CONTROL, INVENTORY & IN-ROOM COMPANION",
        "title": "IDS Next Master Folio - ₹13,588 Split Bill Demonstration",
        "desc": "Live guest folio demonstration for Room 402 aggregating Room Tariff, Cannon Kitchen F&B debits, and Laundry charges, with split-tender checkout capabilities."
    },
    {
        "filename": "32_ideas_g3_rms_dynamic_pricing.png",
        "part": "PART 5: ENTERPRISE CONTROL, INVENTORY & IN-ROOM COMPANION",
        "title": "IDeaS SAS G3 RMS Dynamic Pricing & Yield Management Console",
        "desc": "Continuous algorithmic revenue management console evaluating occupancy elasticity, 48-hour pickup velocity, competitor rate barometers, and publishing micro-rates directly to Cloudflare D1."
    },
    {
        "filename": "33_corporate_b2b_booking_portal.png",
        "part": "PART 5: ENTERPRISE CONTROL, INVENTORY & IN-ROOM COMPANION",
        "title": "Corporate B2B Partner Contracting & Credit Portal",
        "desc": "Dedicated corporate contracting portal allowing partnered industrial conglomerates to book rooms under contracted discounted tariffs with Direct Bill-To-Company (BTC) credit authorization."
    },
    {
        "filename": "34_statutory_legal_policies.png",
        "part": "PART 5: ENTERPRISE CONTROL, INVENTORY & IN-ROOM COMPANION",
        "title": "Statutory Compliance, Legal Policies & Sarai Act Rules",
        "desc": "Comprehensive legal disclosures covering the Sarai Act 1867 guest rules, Privacy Policy under DPDP Act 2023, Terms of Service, Cancellation policies, and Hotel Sai International guest rights."
    },
    {
        "filename": "35_in_room_guest_qr_companion.png",
        "part": "PART 5: ENTERPRISE CONTROL, INVENTORY & IN-ROOM COMPANION",
        "title": "Dedicated In-Room Guest Mobile Portal (QR Room 204)",
        "desc": "Mobile-optimized in-room guest companion triggered upon scanning the physical room standee QR, providing one-touch Cannon Kitchen dining orders, room care requests, and 5G Wi-Fi credentials."
    }
]

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip header/footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#D4AF37"))
        
        # Header line
        self.drawString(40, 565, "HOTEL SAI INTERNATIONAL  •  RAYAGADA, ODISHA")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#94A3B8"))
        self.drawRightString(800, 565, "Enterprise Hospitality & PMS Walkthrough")
        
        self.setStrokeColor(colors.HexColor("#D4AF37"))
        self.setLineWidth(0.75)
        self.line(40, 558, 800, 558)

        # Footer line
        self.setStrokeColor(colors.HexColor("#334155"))
        self.setLineWidth(0.5)
        self.line(40, 32, 800, 32)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(40, 22, "GSTIN: 21AEKPP8689J1ZS  |  Sai Priya Nagar, Rayagada, Odisha - 765001  |  Confidential & Proprietary")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(800, 22, page_str)
        self.restoreState()

def build_pdf():
    print(f"Building Complete Walkthrough PDF -> {OUTPUT_PDF}")
    
    # 841.89 x 595.27 points (A4 Landscape)
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=landscape(A4),
        leftMargin=40,
        rightMargin=40,
        topMargin=45,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    cover_title_style = ParagraphStyle(
        'CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=colors.HexColor("#F3C64C"),
        alignment=1, # Centered
        spaceAfter=10
    )
    
    cover_subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=20,
        textColor=colors.HexColor("#FFFFFF"),
        alignment=1,
        spaceAfter=15
    )

    cover_meta_style = ParagraphStyle(
        'CoverMeta',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#CBD5E1"),
        alignment=1,
        spaceAfter=6
    )

    section_part_style = ParagraphStyle(
        'SectionPart',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#38BDF8"),
        spaceAfter=2
    )

    page_heading_style = ParagraphStyle(
        'PageHeading',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=17,
        textColor=colors.HexColor("#F3C64C"),
        spaceAfter=4
    )

    page_desc_style = ParagraphStyle(
        'PageDesc',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#E2E8F0"),
        spaceAfter=8
    )

    story = []

    # ==================== COVER PAGE ====================
    story.append(Spacer(1, 40))
    story.append(Paragraph("HOTEL SAI INTERNATIONAL", cover_title_style))
    story.append(Paragraph("RAYAGADA, ODISHA — COMPREHENSIVE ARCHITECTURAL & OPERATIONAL SYSTEM AUDIT", cover_subtitle_style))
    story.append(Spacer(1, 10))

    cover_details = """
    <b>Document Class:</b> Production Deployment & Executive System Walkthrough<br/>
    <b>Property Address:</b> Sai Priya Nagar, Rayagada, Odisha - 765001 (1.5 km to Station | 2.0 km to Maa Majhighariani Temple)<br/>
    <b>Managing Director / Owner:</b> Paidisetty Manmadha Rao (Eswara)<br/>
    <b>Statutory Identity:</b> GSTIN: 21AEKPP8689J1ZS | Sarai Act 1867 Compliant | DPDP Act 2023 Digital Vault<br/>
    <b>Live Cloud Production Portal:</b> https://hotel-sai-international.pages.dev<br/>
    <b>Total Inventory & Outlets:</b> 40 Luxury Rooms | 18 Dining Tables | Drop In Bar | Central Mandi Storeroom<br/>
    <b>System Scope:</b> 35 High-Fidelity Verified Production Subsystems & Modals
    """
    story.append(Paragraph(cover_details, cover_meta_style))
    story.append(Spacer(1, 20))

    # Executive Overview Table on Cover
    table_data = [
        [
            Paragraph("<b>Part 1: Guest Experience</b><br/>• Luxury Booking Hero<br/>• 40-Room Catalog<br/>• Satvik Pure Veg Dining<br/>• 3D Multi-Floor Explorer<br/>• Darshan & AI Concierge<br/>• Autonomous Bot Fleet", cover_meta_style),
            Paragraph("<b>Part 2: Cannon Kitchen POS</b><br/>• 18 Dining Tables Grid<br/>• 85-Item Menu Catalog<br/>• Fast Code Punch (54*3)<br/>• Dynamic SBI UPI QR<br/>• Live Kitchen KDS Queue<br/>• Daily Item Sales Register", cover_meta_style),
            Paragraph("<b>Part 3: Front Desk PMS</b><br/>• 39-Room Tape Chart<br/>• Booking Visualizer<br/>• Multi-Tier Occupancy<br/>• Cashier Shift Handover<br/>• Housekeeping Turnover<br/>• Sarai Act Police Register", cover_meta_style),
            Paragraph("<b>Part 4: Central Accounts</b><br/>• Zero-Variance Audit<br/>• 85-Item ₹67,846 Report<br/>• Daily Day Book<br/>• Ashok Leyland B2B Ledger<br/>• Monthly GSTR-1 Tax<br/>• In-House Balances", cover_meta_style),
            Paragraph("<b>Part 5: Enterprise Control</b><br/>• 12 AM Night Audit Lock<br/>• Director Mobile Portal<br/>• Mandi Store Inventory<br/>• Master Folio ₹13,588<br/>• IDeaS G3 RMS Console<br/>• In-Room QR Companion", cover_meta_style)
        ]
    ]
    t = Table(table_data, colWidths=[150, 150, 150, 150, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0B132B")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D4AF37")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#1E293B")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP')
    ]))
    story.append(t)

    story.append(Spacer(1, 25))
    story.append(Paragraph("<i>Generated automatically via Headless Chromium & DeepMind Antigravity Verification Suite</i>", cover_meta_style))
    story.append(PageBreak())

    # ==================== 35 SUBSYSTEM SCREENSHOT PAGES ====================
    # Max image dimensions on landscape A4 (width: 760pt, height: 420pt)
    MAX_IMG_WIDTH = 760
    MAX_IMG_HEIGHT = 415

    for idx, item in enumerate(SECTIONS_METADATA, 1):
        img_path = os.path.join(SCREENSHOTS_DIR, item["filename"])
        
        # Header text
        story.append(Paragraph(item["part"], section_part_style))
        story.append(Paragraph(f"<b>{idx:02d}. {item['title']}</b>", page_heading_style))
        story.append(Paragraph(item["desc"], page_desc_style))

        if os.path.exists(img_path):
            try:
                # Measure image dimensions and scale proportionally
                with PILImage.open(img_path) as pil_img:
                    w, h = pil_img.size
                
                aspect = h / float(w)
                render_w = MAX_IMG_WIDTH
                render_h = render_w * aspect
                
                if render_h > MAX_IMG_HEIGHT:
                    render_h = MAX_IMG_HEIGHT
                    render_w = render_h / aspect

                rl_img = RLImage(img_path, width=render_w, height=render_h)
                
                # Wrap image in styled table for border & shadow effect
                img_table = Table([[rl_img]], colWidths=[MAX_IMG_WIDTH])
                img_table.setStyle(TableStyle([
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D4AF37")),
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#060E1A")),
                    ('PADDING', (0,0), (-1,-1), 2)
                ]))
                story.append(img_table)
            except Exception as e:
                story.append(Paragraph(f"<font color='red'>Error loading image {item['filename']}: {e}</font>", page_desc_style))
        else:
            story.append(Paragraph(f"<font color='orange'><i>Screenshot pending or not found: {item['filename']}</i></font>", page_desc_style))

        if idx < len(SECTIONS_METADATA):
            story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] PDF Compilation Complete! Saved to: {OUTPUT_PDF}")

if __name__ == "__main__":
    build_pdf()
