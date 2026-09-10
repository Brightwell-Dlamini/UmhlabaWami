# Property hierarchy on Umhlaba Wami

## The model (top → bottom)

```
Organisation (Client / Landlord company)
  └── Shopping Center ("Centre") — a physical site (e.g. The Gables)
        └── Property — a building or block within that centre (or a standalone asset)
              └── Unit / Shop — a leasable space (shop, office, warehouse bay, land plot)
                    └── Tenant — the business occupying that unit
```

### Organisation
The **client company** on the platform (e.g. *Ezulwini Commercial Holdings*).  
Has one **Organisation Admin** (and staff). Billed on a subscription tier.

### Shopping Center (Centre)
A **named site** the company operates: mall, strip, office park, industrial estate, land park.  
Example: *The Gables Shopping Centre* in Ezulwini.

### Property
A **building / wing / block** (or land parcel) under a centre — or a standalone commercial property if the org has no multi-block centres.  
Example: *Gables Block A*, *Warehouse Cluster 2*.

### Unit (Shop)
The **leasable unit** tenants occupy: retail shop, office suite, warehouse bay, or **land plot**.  
This is what appears on the public marketplace when marked available.

### Tenant
The **business** on a lease for one (or more) units.

---

## Who sees what

| Role | Scope |
|------|--------|
| **Organisation Admin (Client Admin)** | **Everything in their organisation** — all centres, properties, units, tenants, tickets, finance, staff. |
| **Property Manager** | **Operational subset** — typically one centre (or assigned properties). Day-to-day tickets, tenants, leasing for that site — not full company billing/settings. |
| **Maintenance / Finance** | Their function across the org (or assigned sites). |
| **Tenant** | Only **their** unit, tickets, lease documents. |
| **Super Admin** | All organisations on the platform. |

**Yes:** Client Admin can own **many** centres, properties, and units.  
Property Manager sees a **subset** of what the Client Admin sees — the site(s) they manage.
