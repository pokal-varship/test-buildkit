import React from 'react';

export interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  id?: string;
}

const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items, id }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map(item => ({
      "@type": "ListItem",
      "position": item.position,
      "name": item.name,
      "item": item.item
    }))
  };

  return (
    <script
      id={id || 'breadcrumb-schema'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
};

export default BreadcrumbSchema;

