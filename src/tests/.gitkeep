'use strict';

import Playa from './../dist';

const playa = Playa({});

playa.v1.taxonomy.createTaxonomy('queue1', { label: 'Test label 1' });
playa.v1.taxonomy.createTaxonomy('queue1', { label: 'Test label 2' });

console.log('Queued', playa.v1.taxonomy.getTaxonomyQueue('queue1'));
console.log('Run', playa.v1.taxonomy.processTaxonomyQueue('queue1'));
