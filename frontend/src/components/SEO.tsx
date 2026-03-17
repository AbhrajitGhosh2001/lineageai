import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'Lineage AI — Genetic Cascade Testing Platform';
const DEFAULT_DESCRIPTION =
  'Lineage AI automates family outreach, maps hereditary risk across generations, and tracks cascade testing from one HIPAA-compliant dashboard. Built for genetic counselors.';
const DEFAULT_OG_IMAGE = '/og-image.png';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://lineage.ai';

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title || DEFAULT_TITLE;
  const fullDesc = description || DEFAULT_DESCRIPTION;
  const fullOg = ogImage || DEFAULT_OG_IMAGE;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('description', fullDesc);
    setMeta('keywords', keywords?.join(', ') || '');

    // Open Graph
    setOg('og:title', fullTitle);
    setOg('og:description', fullDesc);
    setOg('og:image', `${SITE_URL}${fullOg}`);
    setOg('og:url', canonicalUrl);
    setOg('og:type', 'website');
    setOg('og:site_name', 'Lineage AI');

    // Twitter Card
    setOg('twitter:card', 'summary_large_image');
    setOg('twitter:site', '@lineageai');
    setOg('twitter:title', fullTitle);
    setOg('twitter:description', fullDesc);
    setOg('twitter:image', `${SITE_URL}${fullOg}`);

    // Robots
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Canonical
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
  }, [fullTitle, fullDesc, fullOg, canonicalUrl, noIndex, keywords]);

  return null;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setOg(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}
