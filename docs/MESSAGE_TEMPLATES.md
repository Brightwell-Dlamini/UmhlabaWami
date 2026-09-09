# Message Templates — Umhlaba Wami

Copy/paste templates for your email/SMS provider. Replace `{{tokens}}`. Not legal advice.

---

## Email — Organisation approved

**Subject:** Your Umhlaba Wami organisation is active  

Hello {{owner_name}},  

Organisation **{{company_name}}** (code `{{organization_code}}`) is now **Active**.  
Sign in at {{app_url}} with your organisation code and username.  

— Umhlaba Wami

---

## Email / SMS — Emergency SLA

**SMS:** UMHLABA ALERT {{ticket_number}}: {{title}}. Priority Emergency. Respond within SLA. {{app_url}}  

**Email subject:** Emergency ticket {{ticket_number}}  

Body: Ticket **{{ticket_number}}** ({{title}}) is Emergency / {{sla_status}}. Centre: {{centre_name}}. Open the ops dashboard immediately.

---

## Email — Rent reminder

**Subject:** Rent reminder — {{shop_number}} — {{period}}  

Dear {{tenant_name}},  
Amount due: **E{{amount}}** for {{period}}. Reference: `{{payment_reference}}`.  
Pay via the method agreed with centre management. Contact {{support_email}} with questions.

---

## Email — Weekly manager digest

**Subject:** Centre weekly digest — {{centre_name}}  

Occupancy {{occupancy}}% · Open tickets {{open_tickets}} · SLA compliance {{sla_pct}}% · Arrears E{{arrears}}  
Top actions: {{action_1}}; {{action_2}}. Full detail in Centre Pulse / Elevate.

---

## Email — POPIA export completed

**Subject:** Your data export request  

We have processed your information request reference {{request_id}}. Secure delivery instructions follow separately. Contact {{support_email}} if you did not make this request.
