import {BundlrPayload } from '../../types/asset';
import Bundlr from "@bundlr-network/client";

require('dotenv').config()

const getTransactionPrice = async(fileSize: number, bundlr: any) => {
  let[err, price]: [any, any] = [null, null]

  if (fileSize <= 0|| isNaN(fileSize) ) {
    err = "incorrect file size format"
  } else {
    const price1MBAtomic = await bundlr.getPrice(fileSize);
    price = bundlr.utils.unitConverter(price1MBAtomic)
  }

  return [err, price]
}

const processTransactions = (bundlr:any) => {

}

const fundNode = async (bundlr: any, price: any) => {
    try {
        // response = {
        //  id, // the txID of the fund transfer
        //  quantity, // how much is being transferred
        //  reward, // the amount taken by the network as a fee
        //  target, // the address the funds were sent to
        // };
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
  const[err, price] = await getTransactionPrice(dataSizeToCheck, bundlr)
  if( err !== null ) {
    let[fundError, fundResponse] = await fundNode(bundlr, price)

      if(fundError != null ) {
        console.log(fundResponse)
      }
  }
}

export { upload };

// payload: {path: "pathToFile"}