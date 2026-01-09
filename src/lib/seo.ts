import { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360-virtual-tour.vercel.app'
const SITE_NAME = 'Z360 Virtual Tours'
const DEFAULT_DESCRIPTION = 'Professional 360° virtual tour services for real estate, businesses, hospitality, and more. Immersive experiences that showcase your space.'

interface SEOConfig {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  noIndex?: boolean
}

/**
 * Generate metadata for a page
 */
export function generateSEO(config: SEOConfig): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = `${BASE_URL}/images/og-default.jpg`,
    url = BASE_URL,
    type = 'website',
    publishedTime,
    modifiedTime,
    noIndex = false,
  } = config

  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@z360tours',
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    other: {
      'fb:app_id': process.env.FACEBOOK_APP_ID || '',
    },
  }
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo-desktop.svg`,
    description: DEFAULT_DESCRIPTION,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+389-71-967-915',
      contactType: 'customer service',
      email: 'z360virtualtours@gmail.com',
      availableLanguage: ['English', 'Macedonian'],
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Balkans',
    },
    sameAs: [
      'https://facebook.com/z360virtualtours',
      'https://instagram.com/z360virtualtours',
      'https://linkedin.com/company/z360virtualtours',
    ],
  }
}

/**
 * Generate JSON-LD structured data for a Virtual Tour
 */
export function generateTourSchema(tour: {
  title: string
  description: string
  image: string
  url: string
  location?: string
  dateCreated?: string
  views?: number
  category?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: tour.title,
    description: tour.description,
    contentUrl: tour.url,
    thumbnailUrl: tour.image,
    encodingFormat: '360-degree image',
    ...(tour.location && {
      contentLocation: {
        '@type': 'Place',
        name: tour.location,
      },
    }),
    ...(tour.dateCreated && { dateCreated: tour.dateCreated }),
    ...(tour.views && { interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/ViewAction',
      userInteractionCount: tour.views,
    }}),
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
  }
}

/**
 * Generate JSON-LD structured data for a Service
 */
export function generateServiceSchema(service: {
  name: string
  description: string
  price?: number
  priceRange?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
    areaServed: {
      '@type': 'Place',
      name: 'Balkans',
    },
    ...(service.price && {
      offers: {
        '@type': 'Offer',
        price: service.price,
        priceCurrency: 'EUR',
      },
    }),
    ...(service.priceRange && { priceRange: service.priceRange }),
    ...(service.image && { image: service.image }),
  }
}

/**
 * Generate JSON-LD structured data for LocalBusiness
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': BASE_URL,
    name: SITE_NAME,
    image: `${BASE_URL}/images/logo-desktop.svg`,
    description: DEFAULT_DESCRIPTION,
    url: BASE_URL,
    telephone: '+389-71-967-915',
    email: 'z360virtualtours@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Balkans',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.9981,
      longitude: 21.4254,
    },
    priceRange: '€€',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '50',
    },
  }
}

/**
 * Generate JSON-LD structured data for FAQ Page
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generate JSON-LD structured data for BreadcrumbList
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
