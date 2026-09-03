const siteUrl = 'https://rodrigofpo.github.io';

export const author = {
  '@type': 'Person',
  '@id': `${siteUrl}/#person`,
  name: 'Rodrigo F. P. Oliveira',
  url: `${siteUrl}/`,
};

export function getHomeStructuredData() {
  return [
    {
      ...author,
      jobTitle: 'Desenvolvedor de software',
      sameAs: ['https://github.com/rodrigofpo'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'Rodrigo F. P. Oliveira',
      url: `${siteUrl}/`,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${siteUrl}/#person` },
    },
  ];
}

export type BreadcrumbItem = { name: string; path: string };

export function getBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).href,
    })),
  };
}

type BlogPostingOptions = {
  title: string;
  description: string;
  path: string;
  publishedAt: Date;
  updatedAt?: Date;
  image: string;
};

export function getBlogPostingStructuredData(options: BlogPostingOptions) {
  const url = new URL(options.path, siteUrl).href;
  return {
    '@type': 'BlogPosting',
    headline: options.title,
    description: options.description,
    datePublished: options.publishedAt.toISOString(),
    dateModified: (options.updatedAt ?? options.publishedAt).toISOString(),
    inLanguage: 'pt-BR',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author,
    image: new URL(options.image, siteUrl).href,
  };
}
