import { Taxonomy, TaxonomyPayload } from '../../types/taxonomy';
import { validateCreateTaxonomySchema, validateGetTaxonomiesSchema, validateUpdateTaxonomySchema } from '../../validators/taxonomy';

let CREATE_QUEUE: TaxonomyPayload[] = [];
let UPDATE_QUEUE: TaxonomyPayload[] = [];

const createTaxonomy = (payload: TaxonomyPayload): TaxonomyPayload => {
  validateCreateTaxonomySchema(payload);

  CREATE_QUEUE.push(payload);

  return payload;
};

const getTaxonomies = (publicKeys: string[] = []): Taxonomy[] => {
  validateGetTaxonomiesSchema(publicKeys);

  return [];
};

const getTaxonomiesCreateQueue = (): TaxonomyPayload[] => {
  return CREATE_QUEUE;
};

const getTaxonomiesUpdateQueue = (): TaxonomyPayload[] => {
  return UPDATE_QUEUE;
};

const resetTaxonomiesCreateQueue = (): void => {
  CREATE_QUEUE = [];
};

const resetTaxonomiesUpdateQueue = (): void => {
  UPDATE_QUEUE = [];
};

const updateTaxonomy = (payload: TaxonomyPayload): TaxonomyPayload => {
  validateUpdateTaxonomySchema(payload);

  UPDATE_QUEUE.push(payload);

  return payload;
};

export {
  createTaxonomy,
  getTaxonomies,
  getTaxonomiesCreateQueue,
  getTaxonomiesUpdateQueue,
  resetTaxonomiesCreateQueue,
  resetTaxonomiesUpdateQueue,
  updateTaxonomy
};
