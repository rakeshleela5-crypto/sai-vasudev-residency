# Hotel Sai International — Cloudflare Edge Hospitality Operating System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hotel--sai--international.pages.dev-d4af37?style=for-the-badge&logo=cloudflare&logoColor=white)](https://hotel-sai-international.pages.dev)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-f38020?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://hotel-sai-international.pages.dev)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui-black?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)

> **Official Live Production URL**: [https://hotel-sai-international.pages.dev](https://hotel-sai-international.pages.dev)  
> **Location**: Sai Priya Nagar, Rayagada, Odisha – 765001  
> **Connectivity**: 1.5 km to RGDA Railway Junction • 2.0 km to sacred Maa Majhighariani Mandir

---

## 🌟 Overview

**Hotel Sai International** is a 4-star boutique hotel operating system and property management solution (PMS) deployed at the edge via Cloudflare Pages and Workers. Built with an Imperial Sapphire (`#060e1a`) and Regal Gold (`#d4af37`) luxury design language, it integrates guest reservations, corporate billing, restaurant POS, and comprehensive administrative controls into a cohesive application.

---

## 🚀 Key Features

### 1. Guest Experience & Public Portal
- **Hero & Live Availability**: Real-time room counter across 4 dedicated floors with Magic UI's `NumberTicker` and `ShimmerButton`.
- **40-Room Catalog & Tier Explorer**: Interactive room cards equipped with Aceternity UI `CardSpotlight` tracking cursor coordinates.
- **Apple-Style Bento Grid**: Highlights signature amenities (Maa Majhighariani shrine shuttle, B2B corridors for JK Paper & IMFA, Satvik dining, 100% DG power backup).
- **Maa Majhighariani Darshan Advisor**: Dedicated pilgrimage guide enveloped in Aceternity's divine `LampContainer` golden beam.
- **Three.js 3D Floor Explorer**: Real-time isometric floor-by-floor 3D visual navigation.
- **Interactive Stay Calendar**: Integrated shadcn `v-calendar-15` for visual check-in/check-out selection.

### 2. Comprehensive Reception Admin & PMS
- **39-Room Interactive Tape Chart Matrix**: Visual grid of all 40 rooms categorized by status (Available, Occupied, Cleaning, Maintenance, VIP).
- **Interactive Convention & Booking Visualizer**: Powered by Framer Motion and Tailwind CSS for multi-day banquet, corporate account, and room folio management.
- **Master Folio & Split-Billing Engine**: Official A4 Tax Invoices and 80mm thermal slips conforming to Rule 46 of CGST/OGST Rules 2017 & statutory DPDP Act 2023.
- **3D Holographic RFID Keycard**: Interactive 3D tilt keycard with real-time foil glare reflection for digital guest check-in.
- **Cannon Kitchen POS**: Complete F&B ordering terminal debiting directly to room master folios.
- **Accounts Ledger & Night Audit**: Roll business dates, lock audit trails (`is_locked = 1`), and compute RevPAR & ADR.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev) + [Vite 6](https://vitejs.dev)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + Custom HSL Luxury Variables
- **Design Systems**: [shadcn/ui](https://ui.shadcn.com), [Magic UI](https://magicui.design), [Aceternity UI](https://ui.aceternity.com), [Uiverse.io](https://uiverse.io)
- **Animations**: [Framer Motion](https://www.framer.com/motion)
- **3D Graphics**: [Three.js](https://threejs.org)
- **Icons**: [Lucide React](https://lucide.dev)
- **Hosting & Edge Runtime**: [Cloudflare Pages](https://pages.cloudflare.com) + [Cloudflare Workers](https://workers.cloudflare.com)

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/rakeshleela5-crypto/hotel-sai-international.git

# Navigate into project directory
cd hotel-sai-international

# Install dependencies
npm install

# Start local development server
npm run dev
```

---

## 🚢 Deployment to Cloudflare Pages

```bash
# Build the production bundle
npm run build

# Deploy directly via Wrangler CLI
npm run deploy
```

---

## 🔗 Links & Resources

- **Production URL**: [https://hotel-sai-international.pages.dev](https://hotel-sai-international.pages.dev)
- **GitHub Repository**: [https://github.com/rakeshleela5-crypto/hotel-sai-international](https://github.com/rakeshleela5-crypto/hotel-sai-international)
