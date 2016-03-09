var Web3 = require('web3');
var config = require('./config.js');
var utility = require('./utility.js');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');
var commandLineArgs = require('command-line-args');
require('datejs');

var cli = commandLineArgs([
	{ name: 'help', alias: 'h', type: Boolean },
  { name: 'contract_dice_addr', type: String, defaultValue: config.contract_dice_addrs[0] },
  { name: 'contract_dice', type: String, defaultValue: config.contract_dice },
  { name: 'eth_provider', type: String, defaultValue: config.eth_provider },
  { name: 'eth_testnet', type: Boolean, defaultValue: config.eth_testnet },
  { name: 'eth_addr', type: String, defaultValue: config.eth_addr },
  { name: 'eth_addr_pk', type: String, defaultValue: config.eth_addr_pk },
  { name: 'invest', type: Boolean, defaultValue: false },
  { name: 'bet', type: Boolean, defaultValue: false },
  { name: 'divest', type: Boolean, defaultValue: false },
]);
var cli_options = cli.parse()

if (cli_options.help) {
	console.log(cli.getUsage());
} else {
	//PUT FIVE OR MORE TEST ADDRESSES HERE
  var addrs = [];
  var web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(cli_options.eth_provider));
  var myContract = undefined;
  utility.readFile(cli_options.contract_dice+'.compiled', function(result){
    var compiled = JSON.parse(result);
    var code = compiled.Dice.code;
    var abi = compiled.Dice.info.abiDefinition;
    myContract = web3.eth.contract(abi);
    myContract = myContract.at(cli_options.contract_dice_addr);
    var nonce = undefined;
    if (cli_options.invest) console.log("Test invest");
    //invest
    async.parallel(
      addrs.map(function(addr){
        return function(callback){
          if (cli_options.invest) {
            utility.proxyCall(web3, myContract, cli_options.contract_dice_addr, 'getStatus', [], function(result) {
              var bankroll = result[0].toNumber();
              var pwin = result[1].toNumber();
              var edge = result[2].toNumber();
              var maxWin = result[3].toNumber();
              var minBet = result[4].toNumber();
              var amountWagered = result[5].toNumber();
              var profit = result[6].toNumber();
              var minInvestment = result[7].toNumber();
              utility.proxyCall(web3, myContract, cli_options.contract_dice_addr, 'getBalance', [addr], function(result) {
                var balance = result.toNumber();
                var investAmount = utility.ethToWei(200);
                if (balance<investAmount) {
                  // investAmount = investAmount + utility.ethToWei(Math.random()*100);
                  utility.proxySend(web3, myContract, cli_options.contract_dice_addr, 'invest', [{gas: 1000000, value: investAmount-balance}], addr, undefined, nonce, function(result) {
                    txHash = result[0];
                    nonce = result[1];
                    if (investAmount<=minInvestment) {
                      utility.proxyCall(web3, myContract, cli_options.contract_dice_addr, 'getBalance', [], function(result) {
                        if (result.toNumber()!=balance) throw Error("Balance should not increase when investing less than the minimum.");
                        callback(null, txHash);
                      });
                    } else {
                      callback(null, txHash);
                    }
                  }, true);
                } else {
                  callback(null, undefined);
                }
              });
            });
          } else {
            callback(null, undefined);
          }
        }
      }),
      function(err, results){
        if (cli_options.bet) console.log("Test bet");
        //bet
        var sizes = [];
        for (var i=0; i<5; i++) {
          // sizes.push(Math.random()*0.8);
					sizes.push(1.0);
        }
        async.parallel(
          sizes.map(function(size){
            return function(callback){
              if (cli_options.bet) {
                utility.proxyCall(web3, myContract, cli_options.contract_dice_addr, 'getStatus', [], function(result) {
                  var bankroll = result[0].toNumber();
                  var pwin = result[1].toNumber();
                  var edge = result[2].toNumber();
                  var maxWin = result[3].toNumber();
                  var minBet = result[4].toNumber();
                  var amountWagered = result[5].toNumber();
                  var profit = result[6].toNumber();
                  var minInvestment = result[7].toNumber();
                  var maxBet = maxWin * bankroll / 10000 / ( 10000/pwin - 1 );
                  var betAmount = maxBet * size;
                  var addr = addrs[Math.floor(Math.random()*addrs.length)];
                  utility.proxySend(web3, myContract, cli_options.contract_dice_addr, 'bet', [{gas: 1000000, value: betAmount}], addr, undefined, nonce, function(result) {
                    txHash = result[0];
                    nonce = result[1];
                    callback(null, txHash);
                  }, true);
                });
              } else {
                callback(null, undefined);
              }
            }
          }),
          function(err, results){
            if (cli_options.divest) console.log("Test divest");
            //divest
            async.parallel(
              addrs.map(function(addr){
                return function(callback){
                  if (cli_options.divest) {
                    utility.proxyCall(web3, myContract, cli_options.contract_dice_addr, 'getStatus', [], function(result) {
                      var bankroll = result[0].toNumber();
                      var pwin = result[1].toNumber();
                      var edge = result[2].toNumber();
                      var maxWin = result[3].toNumber();
                      var minBet = result[4].toNumber();
                      var amountWagered = result[5].toNumber();
                      var profit = result[6].toNumber();
                      var minInvestment = result[7].toNumber();
                      utility.proxyCall(web3, myContract, cli_options.contract_dice_addr, 'getBalance', [addr], function(result) {
                        var balance = result.toNumber();
                        var divestAmount = balance;
                        if (divestAmount>0) {
                          utility.proxySend(web3, myContract, cli_options.contract_dice_addr, 'divest', [divestAmount, {gas: 1000000, value: 0}], addr, undefined, nonce, function(result) {
                            txHash = result[0];
                            nonce = result[1];
                            utility.proxyCall(web3, myContract, cli_options.contract_dice_addr, 'getBalance', [addr], function(result) {
                              if (result.toNumber()!=0) throw Error("Balance should be 0.");
                              callback(null, txHash);
                            });
                          }, true);
                        } else {
                          callback(null, undefined);
                        }
                      });
                    });
                  } else {
                    callback(null, undefined);
                  }
                }
              }),
              function(err, results){
                console.log("Test run successful");
              }
            );
          }
        );
      }
    );
  });
}
