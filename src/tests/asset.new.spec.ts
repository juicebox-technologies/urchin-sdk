import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';

import { cleanAssets, createAsset, getAllAssets, getAssets, getAssetsQueues, processAssets, updateAsset } from '../core/actions/asset';
import testKeypair from './test-wallet';

const _payer = testKeypair;
const _pubkey: PublicKey = _payer.publicKey;

const basicCreateAssetPayload: any = {
  immutable: false,
  archived: false,
  arweaveId: '2222222222222222222222222222222222222222222',
};

const basicUpdateAssetPayload: any = {
  immutable: false,
  archived: false,
  arweaveId: '2222222222222222222222222222222222222222222',
  publicKey: _pubkey,
};

describe('Manage asset', () => {
  beforeEach(() => { cleanAssets(); });

  it('should create a new asset', () => {
    const asset = createAsset([basicCreateAssetPayload]);

    expect(asset).to.deep.equal([basicCreateAssetPayload]);
  });

  // TODO: Fix error
  it('should get assets', async () => {
    const assets = await getAssets({ cluster: 'devnet', payer: _payer }, []);

    // TODO: Need a public key
  });

  it('should get all assets', async () => {
    const assets = await getAllAssets({ cluster: 'devnet', payer: _payer });

    expect(assets.length).to.satisfy((count: number) => count > 0);
  });

  it('should get assets queues', () => {
    createAsset([basicCreateAssetPayload]);
    updateAsset([basicUpdateAssetPayload]);

    const assetsQueues = getAssetsQueues();

    expect(assetsQueues).to.deep.equal({ create: [basicCreateAssetPayload], update: [basicUpdateAssetPayload] });
  });

  it('should process assets', async () => {
    createAsset([basicCreateAssetPayload]);

    const assets = await processAssets({ cluster: 'devnet', payer: _payer });

    expect(assets).to.deep.equal([
      {
        archived: false,
        arweaveId: '2222222222222222222222222222222222222222222',
        immutable: false,
        publicKey: assets[0].publicKey,
        owner: '5SKNwTC2Svdd7AbynWTSwPdyZitDcLVcFeQrkqQ137Hd',
        url: 'https://arweave.net/2222222222222222222222222222222222222222222',
      }
    ]);
  }).timeout(20000);

  it('should update asset', () => {
    const asset = updateAsset([basicUpdateAssetPayload]);

    expect(asset).to.deep.equal([basicUpdateAssetPayload]);
  });

  it('should throw an error due to invalid public key', () => {
    const failedPayload = { ...basicUpdateAssetPayload, ...{ publicKey: 'pubkey' } }
    const asset = () => updateAsset([failedPayload]);

    expect(asset).to.throw('Invalid public key input');
  });
});