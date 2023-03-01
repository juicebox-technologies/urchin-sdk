import ArweaveSigner from "arseeding-arbundles/src/signing/chains/ArweaveSigner"
import Arweave from 'arweave';
import {createData, DataItem} from "arbundles";
import deepHash from 'arweave/node/lib/deepHash';
import ArweaveBundles from 'arweave-bundles';

const deps = {
    utils: Arweave.utils,
    crypto: Arweave.crypto,
    deepHash: deepHash,
  }
  
  const arBundles = ArweaveBundles(deps);

const handler = async () => {
    const arweave = Arweave.init({});
    // create an ephemeral private key/wallet for whatever currency you're using
    const ephemeral = await arweave.wallets.generate();

    // initialise an arbundles signer for that currency
    const signer:any = new ArweaveSigner(ephemeral);

    // TODO iterate over the directory, creating a mapping of path to DataItem instances, which you then create+sign using this signer
    
    // create a DataItem from the mapping of paths to IDs, with the tags [{ name: "Type", value: "index" }, { name: "Content-Type", value: "application/x.arweave-manifest+json" }]
    const myTags = [
        { name: 'App-Name', value: 'myApp' },
        { name: 'App-Version', value: '1.0.0' }
      ];
    let item:any = await arBundles.createData({ data: 'somemessage', tags: myTags }, ephemeral);
    arBundles.addTag(item, 'MyTag', 'value1');
    arBundles.addTag(item, 'MyTag', 'value2');

    const data = await arBundles.sign(item, ephemeral);
    console.log("DATA", data);

    // pass a new mapping of paths to IDs to bundlr.uploader.generateManifest, then create a DataItem from this data for the manifest with the tags [{ name: "Type", value: "manifest" }, { name: "Content-Type", value: "application/x.arweave-manifest+json" }]
    //TODO?
    
    // add this to an array containing the other DataItem instances
    // use the bundleAndSignData method from arbundles - passing in the DataItem instance array and the signer from before

    // create a BundlrTransaction with the contents being the signed bundle data with the tags [{ name: "Bundle-Format", value: "binary" }, { name: "Bundle-Version", value: "2.0.0" }]
    // sign this BundlrTransaction (user will now be prompted)
    // upload the BundlrTransaction 
}

handler();

