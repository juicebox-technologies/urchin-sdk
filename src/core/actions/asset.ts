import {BundlrPayload } from '../../types/asset';
import Bundlr from "@bundlr-network/client";
import Arweave from 'arweave';
import deepHash from 'arweave/node/lib/deepHash';
import ArweaveBundles from 'arweave-bundles';
import {bundleAndSignData, createData, file, signers } from "arbundles";
import fs from "fs/promises"
import path from "path"


require('dotenv').config()


const generateTransactionItems = async(bundlr: any, ephemeral: any, arweave: any, arBundles: any) => {
  let files = await fs.readdir(path.resolve(__dirname, './data'))
  let dataItems = Promise.all(files.map(async fileName => {
    let file = await fs.readFile(path.resolve(__dirname, './data', fileName))
    return await createAndSignDataItem(file, ephemeral, arweave, arBundles)
  }))

  return await dataItems
}

const createAndSignDataItem = async(file: Buffer, ephemeral: any, arweave: any, arBundles: any) => {
  let item:any = await arBundles.createData(
    { 
      data: file, 
      tags: [
        { name: 'App-Name', value: 'myApp' }, //update to have correct content type and other file info
        { name: 'App-Version', value: '1.0.0' }
      ]
    }, 
    ephemeral
  );

  const data = await arBundles.sign(item, ephemeral);

  return data;
}

const bundleAndSignDataFunc = async(dataItems:any, bundlr: any, ephemeral: any, arweave: any, arBundles: any) => {
  let manifestItem:any = await arBundles.createData(
    { 
      data: (await bundlr.uploader.generateManifest({items: dataItems})).manifest,
      tags: [
        { 
          name: "Type",
          value: "manifest"
        }, 
        { 
          name: "Content-Type", 
          value: "application/x.arweave-manifest+json" 
        }
      ]
    }, 
    ephemeral
  );
  
  const manifest = await arBundles.sign(manifestItem, ephemeral);

  const myBundle = await arBundles.bundleData([...dataItems, manifest]);
  // console.log(myBundle)

  return await arweave.createTransaction({ data: Uint8Array.from(myBundle) }, ephemeral);
  
  // console.log(myTx)

}

// remove after testing
const bundlr = new Bundlr(
  "https://devnet.bundlr.network",
  "solana",
  process.env.PHANTOM_PRIVATE_KEY, 
  {
      providerUrl: "https://api.devnet.solana.com"
  }
)

const test = async() => {
  const arweave = Arweave.init({
    host: 'arweave.net',
  port: 443,
  protocol: 'https'
  });

  const ephemeral = await arweave.wallets.generate();

    const deps = {
    utils: Arweave.utils,
    crypto: Arweave.crypto,
    deepHash: deepHash,
  }
  
  const arBundles = ArweaveBundles(deps);

  // // iterate over the directory, creating a mapping 
  // of path to DataItem instances, which you then create+sign using this signer
  let items = await generateTransactionItems(bundlr, ephemeral, arweave, arBundles)
  // pass a new mapping of paths to IDs to bundlr.uploader.generateManifest, 
  // then create a DataItem from this data for the manifest 
  // with the tags [{ name: "Type", value: "manifest" }, 
  // { name: "Content-Type", value: "application/x.arweave-manifest+json" }]  
  const r = await bundleAndSignDataFunc(items, bundlr, ephemeral, arweave, arBundles)
  console.log("r", r)
}
test()


const getTransactionPrice = async(fileSize: number, bundlr: any) => {
  let[err, price]: [any, any] = [null, null]

  if (fileSize <= 0|| isNaN(fileSize) ) {
    err = "incorrect file size format"
  } else {
    const price1MBAtomic = await bundlr.getPrice(fileSize);
    price = bundlr.utils.unitConverter(price1MBAtomic).c[0]
  }

  return [err, price]
}

const getFundedNodeBalance = async(bundlr: any) => {
  let atomicBalance = await bundlr.getLoadedBalance();
  return atomicBalance
}

const fundNode = async (bundlr: any, price: any) => {
  try {
    let response = await bundlr.fund(price);
    console.log(
        `Funding successful txID=${response.id} amount funded=${response.quantity}`,
    );
    return [null, response]
  } catch (e) {
    console.log("Error funding node ", e);
    return [e, null]
  } 
}

const upload = async (payload: BundlrPayload[]) => {
  return
  const bundlr = new Bundlr(
    "https://devnet.bundlr.network",
    "solana",
    process.env.PHANTOM_PRIVATE_KEY, 
    {
        providerUrl: "https://api.devnet.solana.com"
    }
  )

  const arweave = Arweave.init({});
  const ephemeral = await arweave.wallets.generate();

    const deps = {
    utils: Arweave.utils,
    crypto: Arweave.crypto,
    deepHash: deepHash,
  }
  
  const arBundles = ArweaveBundles(deps);

  
  const dataSizeToCheck = 1; // temp remove this later 
  const[priceErorr, price] = await getTransactionPrice(dataSizeToCheck, bundlr)
  const nodeBalance = await getFundedNodeBalance(bundlr)
  if( priceErorr !== null ) {
  } else if(price <= nodeBalance) {
    generateTransactionItems(bundlr, ephemeral, arweave, arBundles)
  } else {
    let[fundError, fundResponse] = await fundNode(bundlr, price)
      if(fundError != null ) {
      } else {
        console.log("going for it");
        generateTransactionItems(bundlr, ephemeral, arweave, arBundles)
      }
  }
}

export { upload };
