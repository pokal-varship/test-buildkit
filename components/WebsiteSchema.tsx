import { getTenantConfig } from '@config/tenant.config';
import React from 'react';
import { WebsiteSchemaProps } from './type/home.type';

const WebsiteSchema: React.FC<WebsiteSchemaProps> = ({ data }) => {
    if (!data) return null;

    const config = getTenantConfig();
    const schemaData = {
        type: data?.type || "WebSite",
        properties: {
            context: data?.properties?.context || "https://schema.org",
            name: data?.properties?.name || config.appName || "",
            description: data?.properties?.description || "A website dedicated to helping people achieve true freedom by creating a self-sustainable home.",
            url: data?.properties?.url || config.webUrl || "",
            potentialAction: {
                type: data?.properties?.potentialAction?.type || "SearchAction",
                target: data?.properties?.potentialAction?.target || `${config.webUrl}search?q={search_term_string}`,
                "query-input": data?.properties?.potentialAction?.["query-input"] || "required name=search_term_string"
            }
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schemaData)
            }}
        />
    );
};

export default WebsiteSchema;
