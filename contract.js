var Web3 = require('web3');
var utility = require('./config.js');
var utility = require('./utility.js');
var request = require('request');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');
var commandLineArgs = require('command-line-args');
require('datejs');

var cli = commandLineArgs([
	{ name: 'help', alias: 'h', type: Boolean },
  { name: 'armed', type: Boolean, defaultValue: false },
  { name: 'contract_dice_addr', type: String, defaultValue: config.contract_dice_addrs[0] },
  { name: 'contract_dice', type: String, defaultValue: config.contract_dice },
  { name: 'eth_provider', type: String, defaultValue: config.eth_provider },
  { name: 'eth_testnet', type: Boolean, defaultValue: config.eth_testnet },
  { name: 'eth_addr', type: String, defaultValue: config.eth_addr },
  { name: 'eth_addr_pk', type: String, defaultValue: config.eth_addr_pk },
  { name: 'invest', type: Number, defaultValue: 0 },
  { name: 'divest', type: Number, defaultValue: 0 },
  { name: 'bet', type: Number, defaultValue: 0 },
]);
var cli_options = cli.parse()

if (cli_options.help) {
	console.log(cli.getUsage());
} else {
  var web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(cli_options.eth_provider));
  var myContract = undefined;
  utility.readFile(cli_options.contract_dice+'.compiled', function(result){
    var compiled = JSON.parse(result);
    var code = compiled.Dice.code;
    var abi = compiled.Dice.info.abiDefinition;
    web3.eth.defaultAccount = cli_options.eth_addr;
    myContract = web3.eth.contract(abi);
    myContract = myContract.at(cli_options.contract_dice_addr);
    var nonce = undefined;
    utility.proxyCall(web3, myContract, cli_options.contract_dice_addr, 'getStatus', [], function(result) {
      var bankroll = result[0].toNumber();
      var pwin = result[1].toNumber();
      var edge = result[2].toNumber();
      var maxWin = result[3].toNumber();
      var minBet = result[4].toNumber();
      var amountWagered = result[5].toNumber();
      var profit = result[6].toNumber();
      var minInvestment = result[7].toNumber();
      utility.proxyCall(web3, myContract, cli_options.contract_dice_addr, 'getBalance', [cli_options.eth_addr], function(result) {
        var balance = result.toNumber();
        console.log('Contract address: ', cli_options.contract_dice_addr);
        console.log('Probability of winning: ', (pwin/100)+'%');
        console.log('Payout: ', ((10000-edge)/pwin)+'x (includes '+(edge/100)+'% house edge)');
        console.log('Bankroll: ', (utility.weiToEth(bankroll))+' eth');
        console.log('Min bet: ', (utility.weiToEth(minBet))+' eth');
        console.log('Max bet: ', (utility.weiToEth(maxWin * bankroll / 10000 / ( 10000/pwin - 1 )))+' eth (corresponds to '+(maxWin/100)+'% of bankroll max win amount)');
        console.log('Amount wagered: ', (utility.weiToEth(amountWagered))+' eth');
        console.log('House profit: ', (utility.weiToEth(profit))+' eth');
        console.log('Minimum investment: ', (utility.weiToEth(minInvestment))+' eth');
        console.log('');
        console.log('My address: ', cli_options.eth_addr);
        console.log('My balance: ', (utility.weiToEth(balance))+' eth');
      });
    });
    //invest
    if (cli_options.invest>0) {
      console.log('');
      var investAmount = utility.ethToWei(cli_options.invest);
      console.log('Invest '+(utility.weiToEth(investAmount))+' eth');
      if (cli_options.armed) {
        utility.proxySend(web3, myContract, cli_options.contract_dice_addr, 'invest', [{gas: 1000000, value: investAmount}], cli_options.eth_addr, cli_options.eth_addr_pk, nonce, function(result) {
          txHash = result[0];
          nonce = result[1];
          console.log(txHash);
        });
      } else {
        console.log('Run command again with --armed to send the transaction.');
      }
    }
    //divest
    if (cli_options.divest>0) {
      console.log('');
      var divestAmount = utility.ethToWei(cli_options.divest);
      console.log('Divest '+(utility.weiToEth(divestAmount))+' eth');
      if (cli_options.armed) {
          utility.proxySend(web3, myContract, cli_options.contract_dice_addr, 'divest', [divestAmount , {gas: 1000000, value: 0}], cli_options.eth_addr, cli_options.eth_addr_pk, nonce, function(result) {
          txHash = result[0];
          nonce = result[1];
          console.log(txHash);
        });
      } else {
        console.log('Run command again with --armed to send the transaction.');
      }
    }
    //bet
    if (cli_options.bet>0) {
      console.log('');
      var betAmount = utility.ethToWei(cli_options.bet);
      console.log('Bet '+(utility.weiToEth(betAmount))+' eth');
      if (cli_options.armed) {
          utility.proxySend(web3, myContract, cli_options.contract_dice_addr, 'bet', [{gas: 122000, value: betAmount}], cli_options.eth_addr, cli_options.eth_addr_pk, nonce, function(result) {
          txHash = result[0];
          nonce = result[1];
          console.log(txHash);
        });
      } else {
        console.log('Run command again with --armed to send the transaction.');
      }
    }
  });
}
