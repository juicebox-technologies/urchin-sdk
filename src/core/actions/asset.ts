import { Asset, CreateAssetPayload, UpdateAssetPayload } from '../../types/asset';
import { validateCreateAssetSchema, validateGetAssetsSchema, validateUpdateAssetSchema } from '../../validators/asset';

let CREATE_QUEUE: CreateAssetPayload[] = [];
let UPDATE_QUEUE: UpdateAssetPayload[] = [];

const createAsset = (payload: CreateAssetPayload): CreateAssetPayload => {
  validateCreateAssetSchema(payload);

  return payload;
};

const getAssets = (publicKeys: string[] = []): Asset[] => {
  validateGetAssetsSchema(publicKeys);

  return [];
};

const getAssetsCreateQueue = (): CreateAssetPayload[] => {
  return CREATE_QUEUE;
};

const getAssetsUpdateQueue = (): UpdateAssetPayload[] => {
  return UPDATE_QUEUE;
};

const updateAsset = (payload: UpdateAssetPayload): UpdateAssetPayload => {
  validateUpdateAssetSchema(payload);

  return payload;
};

export {
  createAsset,
  getAssets,
  getAssetsCreateQueue,
  getAssetsUpdateQueue,
  updateAsset
};
