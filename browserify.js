var Web3 = require('web3');
var utility = require('./utility.js');
var request = require('request');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');

function Main() {
}
//functions
Main.updateTable = function() {
  async.map(config.addrs,
    function(addr, callback) {
      utility.proxyCall(web3, myContract, addr, 'getStatus', [], function(result) {
        var bankroll = result[0].toNumber();
        var pwin = result[1].toNumber();
        var edge = result[2].toNumber();
        var maxWin = result[3].toNumber();
        var minBet = result[4].toNumber();
        var amountWagered = result[5].toNumber();
        var profit = result[6].toNumber();
        callback(null, {addr: addr, bankroll: bankroll, pwin: pwin, edge: edge, maxWin: maxWin, minBet: minBet, amountWagered: amountWagered, profit: profit});
      });
    },
    function(err, contracts) {
      contracts.sort(function(a,b){return a.pwin>b.pwin});
      new EJS({url: config.home_url+'/'+'contracts.ejs'}).update('contracts', {contracts: contracts});
    }
  );

}
Main.refresh = function() {
  Main.updateTable();
}

var web3 = new Web3();
var myContract = undefined;
$(function() {
  utility.readFile(config.contract_dice+'.compiled', function(result){
    var compiled = JSON.parse(result);
    var code = compiled.Dice.code;
    var abi = compiled.Dice.info.abiDefinition;
    myContract = web3.eth.contract(abi);
    myContract = myContract.at(config.addrs[0]);
    Main.refresh();
  });
});

module.exports = {Main: Main, utility: utility};
