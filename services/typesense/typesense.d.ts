declare module 'typesense' {
    export class Client {
        constructor(config: {
            nodes: Array<{ host: string; port: number; protocol: string }>;
            apiKey: string;
            connectionTimeoutSeconds?: number;
        });

        collections(collectionName: string): {
            documents(): {
                search(params: any): Promise<any>; // Adjust the return type as needed
            };
        };

        multiSearch: {
            perform(params: any): Promise<any>; // Method for performing multi-search operations
        };
    }
}