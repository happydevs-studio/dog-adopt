import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

const SEO = ({
  title = "DogAdopt.co.uk - Adopt Don't Shop | Quality UK Rescues",
  description = "100% non-profit. Find rescue dogs from quality UK shelters. See how many dogs need homes. Adopt, don't shop - every dog deserves a second chance.",
  keywords = "dog adoption UK, rescue dogs, quality rescues, adopt don't shop, dog shelters UK, rescue dog adoption, ethical dog adoption, non-profit dog rescue, adopt a dog UK, dog welfare UK, responsible dog adoption",
  canonicalUrl = "https://dogadopt.co.uk",
  ogTitle,
  ogDescription,
  ogImage = "https://dogadopt.co.uk/brand_images/social/Facebook Profile Image.png",
  twitterTitle,
  twitterDescription,
  twitterImage = "https://dogadopt.co.uk/brand_images/social/Twitter Profile Image.png",
}: SEOProps) => {
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const finalTwitterTitle = twitterTitle || title;
  const finalTwitterDescription = twitterDescription || description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="DogAdopt.co.uk" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={twitterImage} />
    </Helmet>
  );
};

export default SEO;
