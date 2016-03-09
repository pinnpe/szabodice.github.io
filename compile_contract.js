var config = require('./config.js');
var utility = require('./utility.js');
var fs = require('fs');
var Web3 = require('web3');
var async = require('async');

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.eth_provider));
var source = fs.readFileSync(config.contract_dice,{ encoding: 'utf8' });
var compiled = web3.eth.compile.solidity(source);
utility.writeFile(config.contract_dice+'.compiled', JSON.stringify(compiled));
var code = compiled.Dice.code;
var abi = compiled.Dice.info.abiDefinition;
web3.eth.defaultAccount = config.eth_addr;
var pwins = [1000, 2000, 5000, 8000, 9000];

async.map(pwins,
	function(pwin, callback_map) {
		var edge = 200;
		var maxWin = 200;
		var minBet = utility.ethToWei(1);
		var maxInvestors = 5;
		var myContract = web3.eth.contract(abi);
		var contract = myContract.new(pwin, edge, maxWin, minBet, maxInvestors, {data: code, gas: 3141592, gasPrice: 20000000000}, function (err, contract) {
			if(err) {
				console.log(err);
				callback_map(null, undefined);
			} else if(contract.address){
				myContract = myContract.at(contract.address);
				callback_map(null, contract.address);
			}
		});
	},
	function(err, addresses) {
		console.log('['+addresses.map(function(addr){return '"'+addr+'"'}).join(",")+']');
	}
);
