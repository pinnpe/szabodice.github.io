var config = (typeof(global.config) == 'undefined' && typeof(config) == 'undefined') ? require('./config.js') : global.config;
var fs = require('fs');
var request = require('request');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');
var Web3 = require('web3');
var SolidityFunction = require('web3/lib/web3/function.js');
var coder = require('web3/lib/solidity/coder.js');
var utils = require('web3/lib/utils/utils.js');
var sha3 = require('web3/lib/utils/sha3.js');
var Tx = require('ethereumjs-tx');

function weiToEth(wei) {
  return (wei/1000000000000000000).toFixed(3);
}

function readFile(filename, callback) {
  if (callback) {
    try {
      if (typeof(window) === 'undefined') {
        fs.readFile(filename,{ encoding: 'utf8' }, function(err, data) {
          if (callback) {
            callback(data);
          }
        });
      } else {
        request.get(config.home_url+"/"+filename, function(err, httpResponse, body){
          callback(body);
        });
      }
    } catch (err) {
      callback(undefined);
    }
  } else {
    try {
      return fs.readFileSync(filename,{ encoding: 'utf8' });
    } catch (err) {
      return undefined;
    }
  }
}

function proxyCall(web3, contract, address, functionName, args, callback) {
  var web3 = new Web3();
  var data = contract[functionName].getData.apply(null, args);
  var result = undefined;
  var url = 'http://'+(config.eth_testnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_call&to='+address+'&data='+data;
  request.get(url, function(err, httpResponse, body){
    if (!err) {
      result = JSON.parse(body);
      var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
      var solidityFunction = new SolidityFunction(web3._eth, functionAbi, address);
      callback(solidityFunction.unpackOutput(result['result']));
    }
  });
}

exports.weiToEth = weiToEth;
exports.readFile = readFile;
exports.proxyCall = proxyCall;
