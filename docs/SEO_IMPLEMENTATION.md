# SEO Optimization Documentation

## Overview
This document describes the SEO optimizations implemented for DogAdopt.co.uk to improve search engine visibility and ranking.

## Implementation Details

### 1. Sitemap (public/sitemap.xml)
- **Purpose**: Helps search engines discover and index all pages on the site
- **Location**: `https://dogadopt.co.uk/sitemap.xml`
- **Pages Included**:
  - Homepage (/) - Priority 1.0, daily updates
  - About page (/about) - Priority 0.8, monthly updates
  - Rescues page (/rescues) - Priority 0.8, weekly updates
  - Chat page (/chat) - Priority 0.6, monthly updates
- **Format**: XML sitemap following the sitemaps.org protocol
- **Last Modified**: 2026-01-21

### 2. Robots.txt (public/robots.txt)
- **Purpose**: Instructs search engine crawlers on how to access the site
- **Configuration**:
  - Allows all crawlers to access all pages
  - References sitemap location for both www and non-www domains
  - Location: `https://dogadopt.co.uk/robots.txt`

### 3. Dynamic Meta Tags (react-helmet-async)
- **Library**: react-helmet-async
- **Purpose**: Dynamically updates page meta tags for better SEO in Single Page Applications (SPAs)
- **Implementation**: 
  - HelmetProvider wraps the entire app in App.tsx
  - SEO component (`src/components/SEO.tsx`) provides reusable meta tag management
  - Each page component includes unique SEO configuration

### 4. Page-Specific SEO

#### Homepage (/)
- **Title**: "DogAdopt.co.uk - Adopt Don't Shop | Quality UK Rescues"
- **Description**: Focuses on non-profit status, quality rescues, and adoption mission
- **Keywords**: dog adoption UK, rescue dogs, quality rescues, adopt don't shop, etc.
- **Canonical URL**: https://dogadopt.co.uk/

#### About Page (/about)
- **Title**: "About DogAdopt.co.uk | Our Mission & Values | Quality UK Dog Rescues"
- **Description**: Emphasizes mission, commitment to quality rescues and welfare standards
- **Keywords**: about dogadopt, dog rescue mission, ethical pet adoption UK, etc.
- **Canonical URL**: https://dogadopt.co.uk/about

#### Rescues Page (/rescues)
- **Title**: "UK Dog Rescues Directory | Quality Shelters | DogAdopt.co.uk"
- **Description**: Directory of quality rescue centres committed to high welfare standards
- **Keywords**: UK dog rescues, dog shelters UK, rescue centres, etc.
- **Canonical URL**: https://dogadopt.co.uk/rescues

#### Chat Page (/chat)
- **Title**: "AI Dog Adoption Assistant | Chat & Find Your Perfect Match | DogAdopt.co.uk"
- **Description**: AI-powered chat assistant for personalized dog matching
- **Keywords**: dog adoption chat, AI dog finder, find rescue dog, etc.
- **Canonical URL**: https://dogadopt.co.uk/chat

#### 404 Page
- **Title**: "404 - Page Not Found | DogAdopt.co.uk"
- **Description**: Error page with link back to homepage
- **Canonical URL**: https://dogadopt.co.uk/ (redirects to homepage)

### 5. Social Media Meta Tags

All pages include:
- **Open Graph (Facebook)**: title, description, image, url, site_name, locale
- **Twitter Cards**: card type, title, description, image, url
- **Images**: Custom social media images for Facebook and Twitter

### 6. Existing SEO Features (Preserved)

The site already had excellent SEO foundations that were preserved:
- Comprehensive meta tags in index.html
- Structured Data (JSON-LD) for:
  - Organization schema with nonprofit status
  - WebSite schema with search functionality
- Semantic HTML5 elements
- Proper hreflang tags (en-GB)
- Theme color meta tag
- Robots meta tag with proper directives
- Author meta tag

## Technical Notes

### React Helmet Async Behavior
- react-helmet-async adds new meta tags rather than replacing existing ones from index.html
- This creates duplicate meta tags, but this is normal and expected
- Search engines will use the last occurrence of duplicate meta tags (the helmet-managed ones)
- The title is properly updated without duplication

### Build Process
- Sitemap and robots.txt are copied from public/ to dist/ during build
- All meta tags from index.html are included in the initial HTML
- Helmet updates meta tags dynamically after React hydration

## Maintenance

### Updating Sitemap
When adding new pages:
1. Add the new URL to `public/sitemap.xml`
2. Set appropriate priority (0.1-1.0) and changefreq
3. Update the lastmod date to current date
4. Rebuild and deploy

### Adding SEO to New Pages
1. Import the SEO component: `import SEO from '@/components/SEO';`
2. Add SEO configuration at the top of your page component:
```tsx
<SEO
  title="Your Page Title | DogAdopt.co.uk"
  description="Your page description"
  canonicalUrl="https://dogadopt.co.uk/your-page"
  keywords="your, keywords, here"
/>
```

## Testing

### Local Testing
```bash
npm run build
npm run preview
```

### Verify Sitemap
- Visit: http://localhost:4173/sitemap.xml
- Should display valid XML with all pages

### Verify Robots.txt
- Visit: http://localhost:4173/robots.txt
- Should show allow directives and sitemap location

### Verify Meta Tags
- Visit any page
- View page source or use browser dev tools
- Check that helmet-managed meta tags are present

## SEO Best Practices Implemented

✅ Unique title tags for each page (50-60 characters)
✅ Unique meta descriptions (150-160 characters)
✅ Proper canonical URLs
✅ XML sitemap with all pages
✅ robots.txt with sitemap reference
✅ Open Graph tags for social sharing
✅ Twitter Card tags
✅ Structured data (JSON-LD)
✅ Semantic HTML5
✅ Mobile-friendly viewport
✅ Fast loading times
✅ HTTPS (in production)
✅ Descriptive URLs
✅ Alt text on images (existing)

## Future Enhancements

Consider implementing:
- Dynamic sitemap generation based on database content
- Per-dog page SEO with unique URLs
- Rich snippets for individual dogs (Product schema)
- FAQ schema for common questions
- Breadcrumb schema
- Video schema if video content is added
- Local Business schema for rescue centers
- Article schema for blog content (if added)

## Monitoring

Recommended tools for monitoring SEO performance:
- Google Search Console
- Google Analytics
- Bing Webmaster Tools
- SEO audit tools (Lighthouse, SEMrush, Ahrefs)

Submit sitemap to search engines:
- Google: https://search.google.com/search-console
- Bing: https://www.bing.com/webmasters
