import { PlayaArgs } from './types/core';
declare const playa: ({ apiVersion }: PlayaArgs) => {
    v1: {
        taxonomy: {
            createTaxonomy: (queue: string, payload: import("./types/taxonomy").TaxonomyPayload) => import("./types/taxonomy").Taxonomy;
            getTaxonomyQueue: (queue: string) => import("./types/taxonomy").Taxonomy[];
            processTaxonomyQueue: (queue: string) => {
                id: string;
                pubkey: string;
                success: boolean;
            };
        };
        asset: {
            upload: (payload: import("./types/asset").BundlrPayload[]) => Promise<void>;
        };
    };
};
export default playa;
