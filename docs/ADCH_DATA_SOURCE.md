# ADCH Data Source

## Overview

The rescues data in this project is based on the official ADCH (Association of Dogs and Cats Homes) member list.

## Current Data Source

**ADCH Member List PDF:**
https://adch.org.uk/wp-content/uploads/2025/09/Editable-Members-List-with-regions-01102025.pdf

**Last Updated:** October 1, 2025 (based on filename)
**Current Data in Repository:** Based on migration file from December 2025

## Updating from ADCH

The ADCH publishes periodic updates to their member list. To keep the data current:

1. **Check for Updates:**
   - Visit https://adch.org.uk/members/ or https://adch.org.uk/
   - Download the latest member list PDF

2. **Extract Data:**
   - Manual method: Open PDF and transcribe to CSV format
   - Automated method: Use PDF parsing tools (see below)

3. **Update Repository:**
   - Follow the process in `docs/UPDATING_RESCUES_DATA.md`

## Data Fields

The ADCH member list typically includes:
- **Name** - Organization name
- **Type** - Usually "Full" membership
- **Region** - Geographic area (e.g., "South East England", "London")
- **Website** - Organization website URL (may need cleanup)

## Known Data Variations

### Region Names
ADCH uses these region names:
- London
- South East England
- South West England
- East England
- West Midlands
- East Midlands
- Yorkshire & The Humber
- North West England
- North East England
- South Wales
- Mid Wales
- North Wales
- Scotland (and sub-regions)
- Northern Ireland
- Ireland
- National (for organizations operating UK-wide)

### Website Formatting
- Some URLs may include "www." prefix
- Some may include "http://" or "https://"
- Some may be Facebook pages
- Standardize to format: `www.example.org.uk`

## Automation Opportunities

### Future Enhancement: PDF Parser

A future improvement could include a script to automatically parse the ADCH PDF:

```javascript
// Pseudocode for future implementation
import pdf from 'pdf-parse';
import fs from 'fs';

async function parseADCHPdf(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  
  // Parse text content
  const lines = data.text.split('\n');
  
  // Extract rescue data using regex or structured parsing
  const rescues = parseRescueLines(lines);
  
  // Generate CSV
  generateCSV(rescues);
  
  // Generate SQL
  generateSQL(rescues);
}
```

Dependencies needed:
- `pdf-parse` or `pdfjs-dist` for PDF parsing
- Text processing for extracting structured data

### Current Process

Until automation is implemented, the process is:
1. **Manual extraction** from PDF to CSV
2. **Manual update** of SQL script
3. **Automated sync** via GitHub Actions

## Data Quality Checks

Before syncing new data, verify:

1. **Required Fields:**
   - ✅ All rescues have a name
   - ✅ All rescues have a region
   - ✅ Type is set (default: "Full")

2. **Data Consistency:**
   - ✅ Region names match standard list
   - ✅ Website URLs are properly formatted
   - ✅ No duplicate names

3. **Changes Make Sense:**
   - ✅ Review new rescues being added
   - ✅ Review rescues being updated
   - ✅ Investigate any unexpected changes

## Contacting ADCH

If you need clarification about their data:

**ADCH Contact Information:**
- Website: https://adch.org.uk/
- Membership inquiries: Check their contact page

Note: This project is not officially affiliated with ADCH. We use their publicly available member list as a reference data source.

## Data Licensing

The ADCH member list is publicly available on their website. This project uses it as reference data for:
- Connecting adopters with rescue organizations
- Providing accurate rescue information to potential adopters
- Supporting the mission of rescue organizations

If you represent ADCH and have concerns about data usage, please contact the repository maintainers.

## Historical Data

Our database maintains a full audit trail of all changes to rescue data:

```sql
-- View all changes to a rescue over time
SELECT 
  changed_at,
  operation,
  old_snapshot,
  new_snapshot,
  change_summary
FROM dogadopt.rescues_audit_logs_resolved
WHERE rescue_name = 'Some Rescue Name'
ORDER BY changed_at DESC;
```

This allows us to:
- Track when rescues joined or left ADCH
- See how rescue details changed over time
- Maintain historical accuracy

## Future Data Sources

Potential additional data sources to consider:
- Individual rescue websites
- Charity Commission data
- Social media profiles
- Google My Business listings

These could provide supplementary information:
- Operating hours
- Contact details
- Social media links
- Charity registration numbers
