# User Guide — Umhlaba Wami

## 1. Public Marketplace

Any visitor can:

- Browse available commercial units (retail, office, restaurant, kiosk, warehouse).
- Filter and view featured listings.
- Open a property detail modal (images, size, rent, features, power specs).
- Submit a leasing enquiry.
- Submit a "List your property" lead (for landlords interested in the platform).

No login is required for marketplace browsing.

## 2. Logging In

1. Click **Login**.
2. Enter your **Organisation Code** (e.g. `GAB-070826`) and **Username**.
3. Super Admins may use organisation code `SUPER` / `ADMIN` or username `superadmin`.

On success you are taken to the role-appropriate dashboard.

## 3. Role-Specific Experiences

### Tenant
- **Overview**: Summary of own unit, open tickets, lease status.
- **Report Issue**: Multi-step ticket wizard (category, priority, location, description, attachments).
- **My Tickets**: List and detail view with timeline and ability to confirm resolution / rate.
- **Lease & Documents**: View lease and SLA documents.
- **Announcements**: Centre bulletins.

### Property Manager
- **Dashboard**: KPIs (open tickets, SLA breaches, occupancy).
- **Tickets**: Assign, escalate, view all centre tickets.
- **Units Directory**: Manage shops / status / public listing flags.
- **Tenants**: Directory and quick actions.
- **Broadcast**: Issue centre-wide or emergency announcements.
- **Staff Schedule**, **Vendors**, **Analytics**.

### Maintenance Technician
- **Job Queue**: Tickets assigned to the technician.
- **Completion Workflow**: Add repair notes, materials used, time spent, cost, before/after photos; mark resolved.

### Finance
- **Rent Roll**: Occupied units and expected collections.
- **Expenses & Transactions**: Ledger with reconciliation flags.
- **Financial Requests**: Approve / reject petty cash, purchase, maintenance funding, vendor payments.
- **Documents**: Finance-related vault.

### Organisation Admin
- Full manager capabilities plus **User Management** and **Organisation Settings** (branding, limits, profile).

### Super Admin
- **Approvals**: Review and activate pending organisations.
- **Organisations**: Overview of all tenants of the platform.
- **Subscriptions**: Manage tiers and limits.
- **Public Listings**: Control marketplace visibility.
- **Audit Logs** and system utilities.

## 4. Creating a Maintenance Ticket

1. From the sidebar or dashboard, choose **Report Issue** / **Create Ticket**.
2. Select category and priority.
3. Provide title, description, and exact location if helpful.
4. Optionally attach images.
5. Submit — a ticket number is generated and SLA timers start.

Managers receive the ticket for assignment; technicians see it in their queue once assigned.

## 5. Emergency Broadcasts

Managers and admins can open the Broadcast modal to publish high-priority alerts (fire, security, water/power outage, evacuation). Active emergency-style announcements appear as a persistent top banner for logged-in users inside the operations dashboard.

## 6. Dark Mode

Toggle via the Navbar control. Preference is applied through a `dark` class on the document root.

## 7. Logging Out

Use the user menu in the Navbar. Session is cleared from localStorage.
