var config = {};

config.contract_dice = 'dice.sol';
config.addrs = ["0x5f2bd66ac0653702530d3b899a96ad977eb0a0e1"];
config.home_url = 'http://szabodice.github.io';
config.home_url = 'http://localhost:8080';
config.eth_testnet = true;

try {
  global.config = config;
  module.exports = config;
} catch (err) {}
