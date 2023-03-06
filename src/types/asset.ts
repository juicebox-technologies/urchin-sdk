type Asset = {
  id: string;
  publicKey: string;
  updated: number;
  url: string;
};

type CreateAssetPayload = {
  original: string;
};

type UpdateAssetPayload = {
  original: string;
};

export type { Asset, CreateAssetPayload, UpdateAssetPayload };
