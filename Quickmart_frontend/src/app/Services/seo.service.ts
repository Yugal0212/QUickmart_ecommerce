import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Main entry point to set all SEO tags dynamically.
   */
  setSeoData(config: {
    title: string;
    description: string;
    keywords?: string;
    author?: string;
    image?: string;
    slug?: string;
    type?: string;
    canonicalUrl?: string;
  }) {
    const defaultAuthor = 'QickmartNexa';
    const baseUrl = 'https://qickmartnexa.com';
    const url = config.slug ? `${baseUrl}${config.slug}` : baseUrl;

    // Title
    this.title.setTitle(config.title);
    
    // Standard Meta
    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
    if (config.keywords) this.meta.updateTag({ name: 'keywords', content: config.keywords });
    this.meta.updateTag({ name: 'author', content: config.author || defaultAuthor });

    // Open Graph (Facebook / WhatsApp)
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }

    // Twitter Cards
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    if (config.image) {
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }

    // Canonical URL
    this.setCanonicalUrl(config.canonicalUrl || url);
  }

  private setCanonicalUrl(url: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Injects JSON-LD structured data into the DOM for Google Rich Snippets.
   */
  setJsonLdSchema(schemaData: any) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Remove existing schema if navigating
    const existingScript = this.doc.getElementById('json-ld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'json-ld-schema';
    script.text = JSON.stringify(schemaData);
    this.doc.head.appendChild(script);
  }
}
