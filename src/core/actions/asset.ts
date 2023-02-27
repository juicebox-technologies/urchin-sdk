import {BundlrPayload } from '../../types/asset';
import Bundlr from "@bundlr-network/client";
import Arweave from 'arweave';
import deepHash from 'arweave/node/lib/deepHash';
import ArweaveBundles from 'arweave-bundles';
import {bundleAndSignData, createData, signers } from "arbundles";
import ArweaveSigner from "arseeding-arbundles/src/signing/chains/ArweaveSigner"
import fs from "fs"
import path from "path"
import { webcrypto } from 'crypto'

require('dotenv').config()

// const signer = new ArweaveSigner(process.env.PRIVATE_KEY);
// const dataItems = [createData("some data"), createData("some other data")];


// 

const processTransactions = async() => {
  const arweave = Arweave.init({});
  const ephemeral = await arweave.wallets.generate();
  // const signer = new ArweaveSigner(ephemeral);

  fs.readdir(path.resolve(__dirname, './data'), (err, files) => {
    files.map(fileName => {
      console.log(fileName)
      // run logic to create DAtaItem
      let file = fs.readFileSync(path.resolve(__dirname, './data', fileName))
      console.log(file)
      // console.log(signer)
      // prepFile(file, signer)
    })
  })
}

// const prepFile = async(file: Buffer, ephemeralSigner: any) => {
//   let item = createData(
//     file,
//     ephemeralSigner,
//     {
//       tags: [{ name: "Content-Type", value: "m4a" }], //refactor later to get file type 
//     }
//   );
//   await item.sign(ephemeralSigner);
//   return item;
// }

processTransactions()

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
    processTransactions()
  } else {
    let[fundError, fundResponse] = await fundNode(bundlr, price)
      if(fundError != null ) {
      } else {
        processTransactions()
      }
  }
}

export { upload };
