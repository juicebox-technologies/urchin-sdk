import Bundlr from "@bundlr-network/client";
import Arweave from 'arweave';
import { signers } from "arbundles";
import {uploadFiles, getTransactionPrice, getFundedNodeBalance} from './arbundle-helpers'
require('dotenv').config()

const upload = async (files: File[]): Promise<any> => {
  const bundlr = new Bundlr(
    "https://devnet.bundlr.network",
    "solana",
    process.env.WALLET_PRIVATE_KEY, 
    {
        providerUrl: "https://api.devnet.solana.com"
    }
  )

  const arweave = Arweave.init({
    host: 'arweave.dev',
    port: 443,
    protocol: 'https', 
    logger: console.log, 
    logging: true,
  });

  const ephemeral = await arweave.wallets.generate();

  const signer = new signers.ArweaveSigner(ephemeral);
  
  const fileSize = 1000000; // change to check for file sizes once we have that logic ready
  const[err, price] = await getTransactionPrice(fileSize, bundlr)

  if( err !== null ) {
    throw new Error(`Could not connect to wallet: ${err}`);
  } 
  
  const nodeBalance = await getFundedNodeBalance(bundlr)
  
  if(price <= nodeBalance) {
    uploadFiles(bundlr, signer, files)
  } else {
    try {
      await bundlr.fund(price);
      uploadFiles(bundlr, signer, files)
    } catch (e) {
      throw new Error(`${e}`)
    } 
  }
}

export { upload };

