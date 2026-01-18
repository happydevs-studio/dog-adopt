# Rescue Contact Collection

## Quick Start

### 1. Get API Key
1. Visit https://developer.charitycommission.gov.uk/
2. Sign up and subscribe to "Charity Commission API"
3. Add to `.env`: `CHARITY_COMMISSION_API_KEY=your_key_here`

### 2. Test
```bash
node scripts/test-collector.js
```

### 3. Run Collection
```bash
npm run collect-contacts  # Takes 2-3 minutes for ~100 rescues
```

### 4. Verify
```bash
supabase db connect
```
```sql
SELECT name, charity_number, phone, email, postcode
FROM dogadopt.rescues WHERE phone IS NOT NULL LIMIT 10;
```

## API Information

- **Source**: UK Charity Commission Register
- **Endpoint**: `/charitycontactinformation/{charity_number}/0`
- **Rate Limit**: 1 request/second (enforced by script)
- **Cost**: Free for non-commercial use
- **Documentation**: https://api.charitycommission.gov.uk

## Data Collected

| Field | Description |
|-------|-------------|
| `phone` | Primary contact phone |
| `email` | Primary contact email |
| `address` | Full postal address with postcode |
| `postcode` | UK postcode (extracted from address) |
| `contact_verified_at` | Timestamp of collection |

All data marked as verified since it comes from official register.

## Adding Charity Numbers

Find charity numbers at https://register-of-charities.charitycommission.gov.uk/

Update `supabase/seed.sql`:
```sql
('Rescue Name', 'Full', 'Region', 'www.website.co.uk', '1234567'),
                                                         ^^^^^^^^
```

Then reset database and run collector again.

## Geocoding

After collecting contacts, geocode using postcodes:

```bash
node scripts/geocode-rescues.js
```

Uses postcodes.io API (free, UK-only, no API key) to retrieve latitude/longitude for map display.

## Benefits Over Web Scraping

✅ Official data from Charity Commission  
✅ Always current (charities must update register)  
✅ Reliable structured JSON  
✅ No HTML parsing errors  
✅ Compliant with API terms  
✅ Faster than multiple page loads  
✅ Automatic postcode extraction  

## Troubleshooting

**"Missing CHARITY_COMMISSION_API_KEY"** → Follow Quick Start step 1

**"404 - Charity not found"** → Verify charity number at register website

**"401 - Authentication failed"** → Check API key in `.env`

**No data collected** → Ensure rescues have charity numbers in `seed.sql`

## Historical Collection

- **December 2025**: Collected contact details for 54 rescues (81% of those with charity numbers)
- **December 2025**: Geocoded 55 rescues (71.6% total coverage - 111 of 155 rescues)
