import {BundlrPayload } from '../../types/asset';
import Bundlr from "@bundlr-network/client";
import Arweave from 'arweave';
import deepHash from 'arweave/node/lib/deepHash';
import ArweaveBundles from 'arweave-bundles';
import {bundleAndSignData, createData, signers } from "arbundles";
import ArweaveSigner from "arseeding-arbundles/src/signing/chains/ArweaveSigner"
import fs from "fs"
import path from "path"
require('dotenv').config()

const processTransactions = async(bundlr: any) => {
  const arweave = Arweave.init({});
  const ephemeral = await arweave.wallets.generate();
  // const signer = new ArweaveSigner(ephemeral);

  let dataItems:any = []
  await fs.readdir(path.resolve(__dirname, './data'), async (err, files) => {
    dataItems = await files.map(async fileName => {
      let file = fs.readFileSync(path.resolve(__dirname, './data', fileName))
      let result =  await prepFile(file, ephemeral)
      return result
    })
  })

  return dataItems
}

const prepFile = async(file: Buffer, ephemeral: any) => {
  const deps = {
    utils: Arweave.utils,
    crypto: Arweave.crypto,
    deepHash: deepHash,
  }
  
  const arBundles = ArweaveBundles(deps);

  let item:any = await arBundles.createData(
    { 
      data: "file-string", 
      tags: [
        { name: 'App-Name', value: 'myApp' },
        { name: 'App-Version', value: '1.0.0' }
      ]
    }, 
    ephemeral
  );

  const data = await arBundles.sign(item, ephemeral);
  return data;
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

processTransactions(bundlr)

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
  const bundlr = new Bundlr(
    "https://devnet.bundlr.network",
    "solana",
    process.env.PHANTOM_PRIVATE_KEY, 
    {
        providerUrl: "https://api.devnet.solana.com"
    }
  )
  
  const dataSizeToCheck = 1; // temp remove this later 
  const[priceErorr, price] = await getTransactionPrice(dataSizeToCheck, bundlr)
  const nodeBalance = await getFundedNodeBalance(bundlr)
  if( priceErorr !== null ) {
  } else if(price <= nodeBalance) {
    processTransactions(bundlr)
  } else {
    let[fundError, fundResponse] = await fundNode(bundlr, price)
      if(fundError != null ) {
      } else {
        processTransactions(bundlr)
      }
  }
}

export { upload };
