import { bundleAndSignData, createData, DataItem, Bundle } from "arbundles";
import fs from "fs/promises"
import path from "path"

const prepFilesForTransaction = async(signer: any, files: File[]): Promise<Map<string, DataItem>> => {
    const items: [string, DataItem][] = await Promise.all(
      files.map(async (file) => {
        return [
          file.name,
          await prepFile(file, signer),
        ];
      })
    );
  
    return new Map(items);
  }
  
  const prepFile = async(file: File, signer: any): Promise<DataItem> => {
    let item = createData(
      new Uint8Array(await file.arrayBuffer()),
      signer,
      {
        tags: [{ name: "Content-Type", value: "txt" }],
      }
    );
  
    await item.sign(signer);
    return item;
  }
  
  const bundleTransactionItems = async(itemMap: Map<string, DataItem>, signer: any, bundlr: any): Promise<Bundle> => {
    const pathMap: Map<string, string> = new Map([...itemMap].map(([path, item]) => ([path, item.id])))
  
    let manifestItem:any = await createData(
      (await bundlr.uploader.generateManifest({ items: pathMap })).manifest,
      signer,
      {
        tags: [{ 
          name: "Type",
          value: "manifest"
        }, 
        { 
          name: "Content-Type", 
          value: "application/x.arweave-manifest+json" 
        }]
      }, 
    ); 
    
    let bundle = await bundleAndSignData([...itemMap.values(), manifestItem], signer);
    return bundle
  }
  
  export const uploadFiles = async(bundlr: any, signer: any, files: File[]): Promise<string> => {
    let itemsMap = await prepFilesForTransaction(signer, files)
    let signedBundles = await bundleTransactionItems(itemsMap, signer, bundlr)
    await bundlr.ready()
  
    const tx = bundlr.createTransaction(signedBundles.getRaw(), {
      tags: [{ name: "Bundle-Format", value: "binary" }, { name: "Bundle-Version", value: "2.0.0" }]
    })
  
    await tx.sign()
    await tx.upload()
    let manifestId = signedBundles.items[signedBundles.items.length - 1].id
    return manifestId;
  }
  
  export const getTransactionPrice = async(fileSize: number, bundlr: any) => {
    let[err, price]: [any, any] = [null, null]
  
    if (fileSize <= 0|| isNaN(fileSize) ) {
      err = "incorrect file size format"
    } else {
      const price1MBAtomic = await bundlr.getPrice(fileSize);
      price = bundlr.utils.unitConverter(price1MBAtomic).c[0]
    }
  
    return [err, price]
  }
  
  export const getFundedNodeBalance = async(bundlr: any) => {
    let atomicBalance = await bundlr.getLoadedBalance();
    return atomicBalance
  }
  