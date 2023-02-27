import ArweaveSigner from "arseeding-arbundles/src/signing/chains/ArweaveSigner"
import Arweave from 'arweave';

const handler = async () => {
    const arweave = Arweave.init({});
    
    // create an ephemeral private key/wallet for whatever currency you're using
    const ephemeral = await arweave.wallets.generate();

    // initialise an arbundles signer for that currency
    const signer = new ArweaveSigner(ephemeral);
    
    // iterate over the directory, creating a mapping of path to DataItem instances, which you then create+sign using this signer
    // pass a new mapping of paths to IDs to bundlr.uploader.generateManifest, then create a DataItem from this data for the manifest with the tags [{ name: "Type", value: "manifest" }, { name: "Content-Type", value: "application/x.arweave-manifest+json" }]
    // add this to an array containing the other DataItem instances
    // use the bundleAndSignData method from arbundles - passing in the DataItem instance array and the signer from before

    // create a BundlrTransaction with the contents being the signed bundle data with the tags [{ name: "Bundle-Format", value: "binary" }, { name: "Bundle-Version", value: "2.0.0" }]
    // sign this BundlrTransaction (user will now be prompted)
    // upload the BundlrTransaction 
}

handler();



// create an ephemeral private key/wallet for whatever currency you're using
// initialise an arbundles signer for that currency
// iterate over the directory, creating a mapping of path to DataItem instances, which you then create+sign using this signer
// pass a new mapping of paths to IDs to bundlr.uploader.generateManifest, then create a DataItem from this data for the manifest with the tags [{ name: "Type", value: "manifest" }, { name: "Content-Type", value: "application/x.arweave-manifest+json" }]
// add this to an array containing the other DataItem instances
// use the bundleAndSignData method from arbundles - passing in the DataItem instance array and the signer from before

// create a BundlrTransaction with the contents being the signed bundle data with the tags [{ name: "Bundle-Format", value: "binary" }, { name: "Bundle-Version", value: "2.0.0" }]
// sign this BundlrTransaction (user will now be prompted)
// upload the BundlrTransaction 
// as you can tell this is a pretty involved process, we do have plans to build most of this functionality into the client but that's still a WIP



async prepFiles(files: File[]): Promise<Map<string, DataItem>> {
    const items: [string, DataItem][] = await Promise.all(
      files.map(async (file) => {
        return [
          file.name,
          await this.prepFile(file),
        ];
      })
    );
    return new Map(items);
  }

  async prepFile(file: File): Promise<DataItem> {
    let item = createData(
      new Uint8Array(await file.arrayBuffer()),
      this.ephemeralSigner,
      {
        tags: [{ name: "Content-Type", value: file.type }],
      }
    );
    await item.sign(this.ephemeralSigner);
    return item;
  }

  async bundle(itemMap: Map<string, DataItem>): Promise<Bundle> {
    const pathMap: Map<string, string> = new Map([...itemMap].map(([path, item]) => ([path, item.id])))
    const manifestItem = await createData(
      (await this.bundlr.uploader.generateManifest({items: pathMap})).manifest, 
      this.ephemeralSigner, 
      {
        tags: [{ name: "Type", value: "manifest" }, { name: "Content-Type", value: "application/x.arweave-manifest+json" }],
      }
    );
    let bundle = await bundleAndSignData([...itemMap.values(), manifestItem], this.ephemeralSigner);
    return bundle
  }
  
  async uploadBundle(bundle: Bundle): Promise<string> {
    await this.bundlr.ready();
    const tx = this.bundlr.createTransaction(bundle.getRaw(), {
      tags: [{ name: "Bundle-Format", value: "binary" }, { name: "Bundle-Version", value: "2.0.0" }]
    })
    await tx.sign()
    let res = await tx.upload()
    // console.log(res);
    let manifestId = bundle.items[bundle.items.length - 1].id
    console.log(`Manifest ID: ${manifestId}`)
    return manifestId;
  }