import { createAsset, getAssets } from './core/actions/asset';
import { createEntry, getEntries} from './core/actions/entry';
import { createTaxonomy, getTaxonomies, updateTaxonomy } from './core/actions/taxonomy';
import { createTemplate, getTemplates } from './core/actions/template';
import { PlayaArgs } from './types/core';

const playa = ({ apiVersion }: PlayaArgs) => {
  // TODO: create method to automate this part
  return {
    asset: {
      create: createAsset,
      get: getAssets,
    },
    entry: {
      create: createEntry,
      get: getEntries,
    },
    taxonomy: {
      create: createTaxonomy,
      get: getTaxonomies,
      update: updateTaxonomy,
    },
    template: {
      create: createTemplate,
      get: getTemplates,
    },
  };
};

export default playa;
