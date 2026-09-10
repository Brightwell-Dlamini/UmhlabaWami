# Client Admin vs Property Manager

## Decision (implemented in the product)

| | **Organisation Admin (Client Admin)** | **Property Manager** |
|---|----------------------------------------|----------------------|
| **Job** | Company owner / executive. Runs the **business**. | Site operator. Runs the **centre day-to-day**. |
| **Focus** | People, portfolio structure, oversight, settings | Tickets, maintenance, tenants on site, leasing ops |
| **Centres** | All centres in the organisation | Assigned centre(s) / properties |

### Client Admin owns
- Staff & roles (hire PM, finance, maintenance, tenants logins)
- Properties & units structure (portfolio setup)
- Tenants directory (company-wide)
- Escalated ticket oversight
- Finance oversight (rent roll, deposits, board pack)
- Company announcements, branding, compliance

### Property Manager owns
- Centre Pulse (live ops)
- Tickets & SLAs (primary owner)
- Maintenance ops & preventive schedules
- SLA matrix configuration for the site
- Day-to-day tenants & leasing pipeline
- Staff rostering and vendors for the site
- Site announcements & ops chat

### Why Admin no longer has “ops-heavy” menu items
Those jobs are **Property Manager work**. Admin still **sees** escalations and finance so they stay in control without doing the PM’s job.
