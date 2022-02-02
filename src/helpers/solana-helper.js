const anchor = require('@project-serum/anchor');
const { default: NodeWallet } = require('@project-serum/anchor/dist/cjs/nodewallet');
const { Metadata } = require("@metaplex-foundation/mpl-token-metadata");
const fetch = require('node-fetch');
const { writeData, readData } = require('./data-helper');

const { web3, Provider, Program, BN } = anchor;

const SPLY_CANDY_MACHINE_ADDRESS = new web3.PublicKey(process.env.CANDY_MACHINE_ADDRESS);
const TOKEN_METADATA_PROGRAM = new web3.PublicKey(process.env.TOKEN_METADATA_PROGRAM);

//State
let txMap = null;

const getProvider = () => {
  const opts = {
    preflightCommitment: "confirmed",
    commitment: "confirmed"
  };
  const connection = new web3.Connection(process.env.ANCHOR_PROVIDER_URL, opts.commitment);
  const wallet = NodeWallet.local();
  const provider = new Provider(connection, wallet, opts);
  anchor.setProvider(provider);

  return provider;
}

const getTxInfo = async (tx) => {
  const provider =  getProvider();

  const txData = await provider.connection.getConfirmedTransaction(tx.signature);
  const mint = new web3.PublicKey(txData.meta.postTokenBalances[0].mint);
  const buyer = new web3.PublicKey(txData.meta.postTokenBalances[0].owner);

  const enc = new TextEncoder();
  const [metadataAccount, _] = await web3.PublicKey.findProgramAddress(
    [
      enc.encode('metadata'),
      TOKEN_METADATA_PROGRAM.toBytes(),
      mint.toBytes(),
    ],
    TOKEN_METADATA_PROGRAM
  );

  const metadata = await Metadata.load(provider.connection, metadataAccount);

  const res = await fetch(metadata.data.data.uri);
  const json = await res.json();

  // console.log(tx);

  return {
    signature: tx.signature,
    mint,
    buyer,
    timestamp: tx.blockTime,
    image: json.image,
  };
}

const pollCandyMachine = async () => {
  const provider = getProvider();
  const txs = await provider.connection.getConfirmedSignaturesForAddress2(SPLY_CANDY_MACHINE_ADDRESS, { limit: 5 });
  let done = false;

  const promises = txs.map(async (tx) => {
    if(tx.err || done){
      return null;
    }

    if(txMap.has(tx.signature)){
      done = true;
      return null;
    }

    const txInfo = await getTxInfo(tx);
    txMap.set(txInfo.signature, txInfo);

    return txInfo;
  });

  const txInfos = (await Promise.all(promises)).filter((item) => item);

  return {
    txMap,
    txInfos,
  };
  // writeData(txInfos);
}

const getPrevTxs = async () => {
  const tx = readData('tx-data.json');
  txMap = new Map();

  txMap.set(tx.signature, tx);
  
  return txMap;
}

module.exports = {
  getTxInfo,
  pollCandyMachine,
  getPrevTxs,
};