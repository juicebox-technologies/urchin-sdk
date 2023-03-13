import * as anchor from '@project-serum/anchor';
import * as SolanaInteractions from '../../services/anchor/programs';
import { TemplateCreatePayload, Template, TemplateUpdatePayload, TemplateQueues } from '../../types/template';
import { loadSolanaConfig, sleep } from '../../services/solana';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { PublicKey } from '@solana/web3.js';
import { PlayaArgs } from '../../types/core';
import { validateCreateTemplateSchema, validateGetTemplatesSchema, validateUpdateTemplateSchema } from '../../validators/template';
import { formatTemplateAccounts } from '../../services/solana/transform';
import * as metadata from '../../services/arweave/metadata';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';

let CREATE_QUEUE: TemplateCreatePayload[] = [];
let UPDATE_QUEUE: TemplateUpdatePayload[] = [];

const _resetTemplatesCreateQueue = (): void => {
  CREATE_QUEUE = [];
};

const _resetTemplatesUpdateQueue = (): void => {
  UPDATE_QUEUE = [];
};

const createTemplate = (payload: TemplateCreatePayload[]): TemplateCreatePayload[] => {
  validateCreateTemplateSchema(payload);

  CREATE_QUEUE = [...CREATE_QUEUE, ...payload];

  return payload;
};

const getTemplates = async (args: PlayaArgs, publicKeys: PublicKey[] = []): Promise<Template[]> => {
  validateGetTemplatesSchema(publicKeys);

  const { cluster, payer, rpc, wallet, preflightCommitment } = loadSolanaConfig(args);
  const sdk = new SolanaInteractions.AnchorSDK(
    wallet as NodeWallet,
    rpc,
    preflightCommitment as anchor.web3.ConfirmOptions,
    'template',
    cluster
  );

  let templateAccounts: any = await new SolanaInteractions.Template(sdk).getTemplate(publicKeys);
  return formatTemplateAccounts(templateAccounts);
};

const getAllTemplates = async (args: PlayaArgs) => {

  const { cluster, payer, owner, rpc, wallet, preflightCommitment } = loadSolanaConfig(args);
  const sdk = new SolanaInteractions.AnchorSDK(
    wallet as NodeWallet,
    rpc,
    preflightCommitment as anchor.web3.ConfirmOptions,
    'template',
    cluster
  );

  let templateAccounts: any = await new SolanaInteractions.Template(sdk).getTemplateAll(owner || payer);
  return templateAccounts

};


const getTemplateCreateQueue = (): TemplateCreatePayload[] => {
  return CREATE_QUEUE;
};

const getTemplateUpdateQueue = (): TemplateUpdatePayload[] => {
  return UPDATE_QUEUE;
};

const getTemplatesQueues = (): TemplateQueues => ({ create: CREATE_QUEUE, update: UPDATE_QUEUE });

const processTemplates = async (args: PlayaArgs): Promise<any> => {
  const { cluster, payer, rpc, wallet, preflightCommitment, owner } = await loadSolanaConfig(args);

  const sdk = new SolanaInteractions.AnchorSDK(
    wallet as NodeWallet,
    rpc,
    preflightCommitment as anchor.web3.ConfirmOptions,
    'template',
    cluster
  );

  let mutatedTemplateIds: PublicKey[] = [];

  for (const createTemplateFromQueue of CREATE_QUEUE) {
    // Arweave
    const arweaveData = { // TODO MJZ update
      taxonomies: createTemplateFromQueue.taxonomies,
      inputs: createTemplateFromQueue.inputs,
      created: Date.now()
    }

    // const arweaveResponse = await metadata.uploadData(bs58.encode( new Uint8Array(payer.secretKey)), cluster, arweaveData);
    const arweaveId = "2222222222222222222222222222222222222222222" // arweaveResponse.id;

    // Solana 
    const createdTemplate = await new SolanaInteractions.Template(sdk).createTemplate(
      owner || payer,
      arweaveId,
      createTemplateFromQueue.archived,
      createTemplateFromQueue.original || null,
    );
    const { tx } = createdTemplate;
    const data: any = await rpc.getTransaction(tx, { maxSupportedTransactionVersion: 0 });
    const { postBalances, preBalances } = data.meta;
    console.log("TXN COST:", postBalances[0] - preBalances[0]); // TODO: remove
    mutatedTemplateIds.push(createdTemplate.publicKey);
  }

  for (const updateTemplateFromQueue of UPDATE_QUEUE) {
    if (!updateTemplateFromQueue.publicKey) continue;

    const updatedTemplate = await new SolanaInteractions.Template(sdk).updateTemplate(
      updateTemplateFromQueue.publicKey,
      owner || payer,
      updateTemplateFromQueue.archived,
      updateTemplateFromQueue.version
    );
    const { tx } = updatedTemplate;
    const data: any = await rpc.getTransaction(tx, { maxSupportedTransactionVersion: 0 });
    const { postBalances, preBalances } = data.meta;
    console.log("TXN COST:", postBalances[0] - preBalances[0]); // TODO: remove
    mutatedTemplateIds.push(updatedTemplate.publicKey);
  }

  await sleep(8000);

  let templateAccounts: any = await new SolanaInteractions.Template(sdk).getTemplate(mutatedTemplateIds);
  templateAccounts = formatTemplateAccounts(templateAccounts);   //TODO MJZ 

  _resetTemplatesCreateQueue();
  _resetTemplatesUpdateQueue();

  return templateAccounts;
};

const updateTemplate = (payload: TemplateUpdatePayload[]): TemplateUpdatePayload[] => {
  validateUpdateTemplateSchema(payload);

  UPDATE_QUEUE = [...UPDATE_QUEUE, ...payload];

  return payload;
};

export { createTemplate, getTemplates, getTemplatesQueues, updateTemplate, processTemplates, getAllTemplates };
