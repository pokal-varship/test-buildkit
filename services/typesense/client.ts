/**
 * Typesense client
 * This file initializes the Typesense client with the configuration
 */

import Typesense from 'typesense';
import { typesenseConfig } from './config';

// Create a singleton instance of the Typesense client
let typesenseClient: Typesense.Client | null = null;

export const getTypesenseClient = (): Typesense.Client => {
  if (!typesenseClient) {
    typesenseClient = new Typesense.Client({
      nodes: [
        {
          host: typesenseConfig.host,
          port: typesenseConfig.port,
          protocol: typesenseConfig.protocol,
        },
      ],
      apiKey: typesenseConfig.apiKey,
      connectionTimeoutSeconds: typesenseConfig.connectionTimeoutSeconds,
    });
  }
  
  return typesenseClient;
};