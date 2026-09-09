# Partner API Contracts — Umhlaba Wami

Machine-readable spec: [`/openapi.json`](../public/openapi.json) (also served from the deployed site root when static files are published).

## Auth (production)

```
X-Umhlaba-Api-Key: <org-scoped-key>
```

Keys are issued per organisation by the platform operator (you). Demo explorer does not enforce keys.

## Endpoints (v1)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health |
| GET | `/organizations/{orgCode}/units` | List units |
| GET | `/organizations/{orgCode}/tickets` | List tickets |
| POST | `/organizations/{orgCode}/tickets` | Create ticket (production) |
| GET | `/organizations/{orgCode}/rent-roll` | Rent roll snapshot |
| GET | `/organizations/{orgCode}/kpis` | Portfolio KPIs |
| GET | `/organizations/{orgCode}/webhooks` | List webhook endpoints |
| POST | `/organizations/{orgCode}/webhooks` | Register HTTPS webhook |

## Demo implementation

In-app **Partner API** view and `src/services/partnerApi.ts` execute the same shapes against dual-mode data.

## Production implementation (your deploy)

Map paths to **Supabase Edge Functions** (or API gateway) with:

- API key validation  
- Org isolation  
- Signed webhook deliveries + retries (see `webhook_deliveries` table in `supabase-schema-phase3-7.sql`)  
