const anchor = require('@project-serum/anchor');
const { default: NodeWallet } = require('@project-serum/anchor/dist/cjs/nodewallet');
require('dotenv').config();
const { Metadata } = require("@metaplex-foundation/mpl-token-metadata");
const fetch = require('node-fetch');

const discord = require('discord.js');

const client = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const { web3, Provider, Program, BN } = anchor;

const SPLY_CANDY_MACHINE_ADDRESS = new web3.PublicKey("FAkz5dMGgznAtDeiZfivvLabokvVANZXNraTjwkK7tTx");
const TOKEN_METADATA_PROGRAM = new web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const opts = {
  preflightCommitment: "confirmed",
  commitment: "confirmed"
};
const connection = new web3.Connection(process.env.ANCHOR_PROVIDER_URL, opts.commitment);
const wallet = NodeWallet.local();
const provider = new Provider(connection, wallet, opts);
anchor.setProvider(provider);

const getImgUrl = async (txSig) => {
  // let tx = await provider.connection.getConfirmedSignaturesForAddress2(SPLY_CANDY_MACHINE_ADDRESS);

  let txData = await provider.connection.getConfirmedTransaction(txSig);
  let mint = new web3.PublicKey(txData.meta.postTokenBalances[0].mint);
  let buyer = new web3.PublicKey(txData.meta.postTokenBalances[0].owner);

  let enc = new TextEncoder();
  let [metadataAccount, _] = await web3.PublicKey.findProgramAddress(
    [
      enc.encode('metadata'),
      TOKEN_METADATA_PROGRAM.toBytes(),
      mint.toBytes(),
    ],
    TOKEN_METADATA_PROGRAM
  );

  let metadata = await Metadata.load(connection, metadataAccount);

  let res = await fetch(metadata.data.data.uri);
  let json = await res.json();

  // console.log(imgBlob);

  return json.image;
}

const run = async () => {
  getTxs();
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  let img = await getTxs();
  msg.reply(img);
});

client.on('')

client.login(process.env.CLIENT_TOKEN);
