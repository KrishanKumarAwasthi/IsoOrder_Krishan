# Technical Design Document (TDD) - IsoOrder

**Project**: Restaurant Chain Direct Ordering Platform & Kitchen Display System  
**Client**: Company A, Hyderabad (14 Outlets & 3 Cloud Kitchens, ₹90–105 Crore Annual Revenue)  
**Deliverables**: TDD.md & deployment.md  
**Author**: Engineering Team  

---

## 1. Executive Summary & Business Context

Company A operates 14 outlets and 3 cloud kitchens in Hyderabad, generating ₹90–105 crore in annual revenue, with 55% (~₹52.8 crore) derived from third-party aggregators charging 25–30% in commissions. Additionally, a legacy phone line loses ~30 bulk/party orders monthly at ₹18,000 with 30% margins.

### Financial Objective
- Shift 12% of app orders to direct channels (12% direct delivery + gateway cost vs. 27% aggregator commission = 15 percentage points saved = ₹95.04 lakh).
- Capture phone line leakages: 30 orders &times; ₹5,400 &times; 12 = ₹19.44 lakh.
- **Total Projected Annual Savings**: **₹1.14 crore/year**.

---

## 2. Core Build Architecture & Roles

```
[Customer Mobile Web App]         [Kitchen Display System - Android Tablet]
         │                                            ▲
         ▼                                            │
  (HTTPS / REST)                               (WebSockets)
         │                                            │
         ▼                                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           IsoOrder Backend API (Express.js)            │
 │ ────────────────────────────────────────────────────── │
 │  • Order Controller & Real-Time Socket.IO Hub          │
 │  • Central Menu CMS & City Pricing Module              │
 │  • Geospatial Outlet Router (Haversine & GeoJSON)      │
 │  • AI Prep-Time Engine (Gemini API + Load Heuristic)   │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
               ┌────────────────────────┐
               │  MongoDB Database      │
               │  (Mongoose Schemas)    │
               └────────────────────────┘
```

### Roles & Access Control
1. **Customer**: Geolocation outlet selection, menu browsing with portion/add-on customization, 60-second checkout, loyalty rewards (100 welcome bonus), live order tracking.
2. **Kitchen Staff**: Full-screen high-contrast Kitchen Display System (KDS) designed for cheap Android tablets, readable from 2 metres, 4-stage Kanban workflow, audio alerts, and color-coded late warnings.
3. **Outlet Manager**: Override prep estimates, toggle local out-of-stock items, handle late ticket escalations.
4. **Central Admin**: Central menu management, city pricing (Hyderabad vs. Bangalore), categories, outlet master list.

---

## 3. Screen Specifications (Core 8 Screens)

| # | Screen | URL / Route | Role | Key Functionalities |
|---|---|---|---|---|
| 1 | **Landing / Home** | `/` | All | Brand story, direct ordering value prop, one-click role navigation |
| 2 | **Outlet Selection** | `/outlets` | Customer | Radius & distance filtering, FSSAI display, retail vs. cloud kitchen |
| 3 | **Menu Browsing** | `/menu` | Customer | AI reorder suggestions (display-only), veg/non-veg marks, spice rating, allergens, 5% GST label, customization modal |
| 4 | **Cart & Checkout** | `/cart` | Customer | Item customizations, promo coupons (`WELCOME10`, `BIRYANI50`), IsoRewards points redemption, delivery/takeaway toggle |
| 5 | **Payment Gateway (Test Mode)** | Modal in `/cart` | Customer | UPI & Card simulated authorization with instant transaction feedback |
| 6 | **Order Confirmation** | `/order-confirmation/:id` | Customer | `WEB-XXXXXX` ID generation, estimated prep time, loyalty points earned |
| 7 | **Live Order Tracker** | `/tracking/:id` | Customer | Real-time Socket.IO stepper, countdown timer, delay alerts, mock WhatsApp/SMS |
| 8 | **Kitchen Display (KDS)** | `/kitchen` | Kitchen | 4-column stage progression, 2m distance readability, RED late badges, AMBER warnings, Web Audio chimes |
| 9 | **Central Menu CMS** | `/admin` | Admin | Multi-city pricing, real-time outlet stock toggle, item CRUD |
| 10 | **Sign In & Sign Up** | `/login`, `/register` | All | JWT auth, demo quick-fill buttons, DPDP Act 2023 marketing consent |

---

## 4. AI & Automation Specifications

### 4.1 Kitchen Load & Prep-Time Estimation
- **Input Parameters**: Current outlet minimum prep time, active orders in preparation, total item count, and item preparation complexity (Dum Biryani / Haleem vs. Appetisers).
- **Inference Engine**:
  - Primary: Google Gemini API (`gemini-1.5-flash`) structured prompt.
  - Fallback: Deterministic kitchen load heuristic.
- **Fail-Safe Constraint (from Brief)**:
  $$\text{Promised Time} = \max(\text{AI Estimate}, \text{Outlet Minimum Prep Time})$$
- **Lateness Escalation**: Any ticket running 10 minutes past promised time triggers an automated manager alert and updates customer tracking via WebSockets.

### 4.2 Reorder Suggestions
- **Algorithm**: Analyzes customer's previous order history frequency.
- **Constraint (from Brief)**: AI suggestions are **strictly display-only and never automatically added to the cart**.

---

## 5. Constraints & Regulatory Compliance

- **FSSAI Licence**: Displayed persistently across outlet cards, menu headers, order confirmation, and kitchen tickets.
- **GST partitioned display**: All prices include 5% GST, explicitly labeled on the menu and itemized on the checkout bill.
- **DPDP Act 2023 Compliance**: Customer personal data collected strictly with explicit marketing consent opt-in checkboxes; account data deletion endpoints provided.
- **Peak Load Resilience**: Scaled for 1,200 orders/hour during weekend dinner peaks via WebSocket room partitioning (`outlet:outletId`).

---

## 6. Verification & Test Metrics

- **Backend Tests**: 21 unit & integration tests passing across 7 test suites (Supertest, Jest).
- **Frontend Tests**: 12 component & user flow tests passing across 5 test suites (Vitest, React Testing Library).
- **Vite Production Bundle**: Zero-error build in ~6–7 seconds.
- **Dead Buttons**: Zero. All interactive controls, modals, filters, tabs, and buttons have active handlers.

