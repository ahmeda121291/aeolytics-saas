import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterHandle?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any> | Record<string, any>[];
  children?: React.ReactNode;
}

// Set default properties for the entire site
const defaultSEO = {
  titleTemplate: '%s | AEOlytics - AI Citation Analytics',
  defaultTitle: 'AEOlytics - Track Your Brand Citations Across AI Search Engines',
  description: 'AEOlytics helps you monitor how your brand appears in ChatGPT, Perplexity, and Gemini responses, with actionable insights to improve visibility.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aeolytics.com',
    site_name: 'AEOlytics',
    images: [
      {
        url: 'https://aeolytics.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AEOlytics - AI Citation Analytics',
      },
    ],
  },
  twitter: {
    handle: '@aeolytics',
    site: '@aeolytics',
    cardType: 'summary_large_image',
  },
};

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterHandle = '@aeolytics',
  noIndex = false,
  structuredData,
  children,
}) => {
  // Combine default and page-specific values
  const metaTitle = title ? `${title} | AEOlytics` : defaultSEO.defaultTitle;
  const metaDescription = description || defaultSEO.description;
  const metaUrl = canonicalUrl || defaultSEO.openGraph.url;
  const metaImage = ogImage || defaultSEO.openGraph.images[0].url;

  // Process structured data to handle arrays properly
  const structuredDataArray = structuredData 
    ? (Array.isArray(structuredData) 
        ? structuredData 
        : [structuredData])
    : [];

  return (
    <Helmet>
      {/* Basic Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="AEOlytics" />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      
      {/* Indexing Control */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* JSON-LD Structured Data */}
      {structuredDataArray.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
      
      {children}
    </Helmet>
  );
};

export const generateWebsiteStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://aeolytics.com",
    "name": "AEOlytics - AI Citation Analytics",
    "description": "Track and optimize your brand citations across AI search engines like ChatGPT, Perplexity, and Gemini."
  };
};

export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "url": "https://aeolytics.com",
    "name": "AEOlytics Inc.",
    "logo": "https://aeolytics.com/logo.png",
    "sameAs": [
      "https://twitter.com/aeolytics",
      "https://linkedin.com/company/aeolytics",
      "https://github.com/aeolytics"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service",
      "email": "support@aeolytics.com"
    }
  };
};

export const generateFAQStructuredData = (faqs: Array<{question: string; answer: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export default SEO;