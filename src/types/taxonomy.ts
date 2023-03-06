type Taxonomy = {
    label: string;
    level: number;
    parent: string;
    publicKey: string;
    updated: number;
};

type TaxonomyPayload = {
    label: string;
    parent?: string;
    publicKey?: string;
};

export type { Taxonomy, TaxonomyPayload };