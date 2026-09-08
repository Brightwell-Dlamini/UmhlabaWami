# Data Model — Umhlaba Wami

This document describes the core domain entities, their relationships, and the corresponding production schema.

## 1. Entity Relationship Summary

```
Organization 1──* User
Organization 1──* ShoppingCenter
ShoppingCenter 1──* Property
Property 1──* Shop (commercial unit)
Shop 1──0..1 Tenant (when occupied)
Tenant 1──* Lease
Tenant 1──* SlaAgreement
Tenant / Shop / Property ──* Ticket
Ticket 1──* TicketTimelineItem / TicketComment / Attachment
Organization 1──* FinanceTransaction / FinancialRequest
Organization 1──* Vendor / StaffShift / Announcement
```

## 2. Core Entities (TypeScript)

Defined in `src/types/index.ts`.

### Organization
- Unique `organization_code` (e.g. `SWZ-060926`, `GAB-070826`)
- Subscription tier (`Starter` | `Professional` | `Enterprise`)
- Status lifecycle: `Pending Approval` → `Active` / `Suspended` / `Rejected`
- Limits: property, tenant, user, storage

### User
- Roles: `tenant` | `property_manager` | `maintenance` | `finance` | `admin` | `super_admin`
- Optional links to organisation, shopping centre, property, shop
- Status: `Active` | `Inactive` | `Pending` | `Suspended`

### ShoppingCenter
- Location-focused (Ezulwini Valley, Mbabane Central, Manzini City, etc.)
- Operating hours, parking bays, amenities

### Property
- Types: Retail shop, Office, Warehouse, Restaurant, Kiosk, Commercial unit, House, Apartment, Mixed-use

### Shop (Unit)
- Shop number, floor, size (sqm), rental & deposit amounts (Emalangeni)
- Status: `Available` | `Occupied` | `Reserved` | `Under Maintenance`
- Public listing & featured flags, QR code, images, features, power specs

### Tenant
- Business name, contact, trade type, move-in date
- Linked to shop / property / centre

### Lease
- Start / end dates, rental, deposit
- Renewal status, digital signature metadata, document URL

### SlaAgreement
- Per-priority response times (Emergency / High / Medium / Low)
- Expiry and signature metadata

### Ticket
- Unique ticket number (e.g. `GA-G14-060926-0001`)
- Priority, category, status, SLA deadlines & status
- Assignment, timeline, attachments, completion fields (notes, materials, cost, images, tenant rating)

### Supporting Entities
- `StaffShift`, `Vendor`, `FinanceTransaction`, `FinancialRequest`
- `Announcement`, `EmergencyBroadcast`
- `NotificationItem`, `ChatMessage` / `Conversation`
- `AuditLog`, `PropertyLead`

## 3. Subscription Configuration

```ts
DEFAULT_SUBSCRIPTION_PLANS = [
  { tier: 'Starter', propertyLimit: 3, tenantLimit: 100, userLimit: 10, storageLimitGb: 10, pricePerMonthE: 1450 },
  { tier: 'Professional', propertyLimit: 10, tenantLimit: 500, userLimit: 50, storageLimitGb: 50, pricePerMonthE: 3850 },
  { tier: 'Enterprise', propertyLimit: 999, tenantLimit: 9999, userLimit: 999, storageLimitGb: 500, pricePerMonthE: 8900 },
]
```

## 4. Production Schema (Supabase / PostgreSQL)

File: `public/supabase-schema.sql`

### Tables
1. `organizations`
2. `users`
3. `shopping_centers`
4. `properties`
5. `shops`
6. `tenants`
7. `tickets`
8. `ticket_timeline`
9. `ticket_comments`
10. `attachments`
11. `leases`
12. `sla_agreements`
13. `finance_transactions`
14. `announcements`
15. `activity_logs`

UUID primary keys, foreign-key cascades, and appropriate defaults are defined. Arrays are used for amenities, images, features, etc.

### Row-Level Security (Starter Policies)

- Public can `SELECT` shops where `public_listing = true` AND `status = 'Available'`.
- Tenants (and elevated roles) can view relevant tickets.
- Additional policies should be added for insert/update/delete per role before production use.

## 5. Ticket Lifecycle & SLA

**Statuses**: Open → In Progress → Awaiting Approval → Resolved → Closed (also Reopened, Cancelled)

**Priorities**: Low | Medium | High | Emergency

**SLA Status**: Compliant | Warning | Overdue | Escalated

Deadlines are calculated at ticket creation from the applicable SLA agreement (or defaults). Timeline events record every significant state change with actor and role.

## 6. Currency & Locale

- Monetary values are expressed in **Emalangeni (E)**.
- Dates and demo content are localised to Eswatini (place names, phone prefixes +268, organisation names).
