require('dotenv').config();
const discord = require('discord.js');
const { writeData } = require('./helpers/data-helper');

const {
  getTxInfo,
  pollCandyMachine,
  getPrevTxs,
 } = require('./helpers/solana-helper');

const client = new discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });




client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  getPrevTxs();
  const intervalId = setInterval(async () => {
    console.log("poll")
    let { txInfos } = await pollCandyMachine();
    
    if(txInfos.length > 0){
      let channel = client.channels.cache.get('936792569684328448');

      writeData(txInfos[0]);
      txInfos.forEach((info) => {
        let img = info.image;
        channel.send(img);
      });

    }


  }, 5 * 1000);
});

// client.on('apiRequest', async (req) => {
//   console.log("yurr");
  // let tx = await provider.connection.getConfirmedSignaturesForAddress2(SPLY_CANDY_MACHINE_ADDRESS);
  // let img = await getTxInfo(tx[0].signature);

  // let channel = client.channels.cache.get('936792569684328448');
  // channel.send(img);
// });


client.login(process.env.CLIENT_TOKEN);
