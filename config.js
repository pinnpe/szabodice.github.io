var config = {};

config.contract_dice = 'dice.sol';
config.addrs = ["0x563dfdf93e7d7f8bb226319d1fd96a0f78a00c78"];
// config.home_url = 'http://szabodice.github.io';
config.home_url = 'http://localhost:8080';
config.eth_testnet = true;

try {
  global.config = config;
  module.exports = config;
} catch (err) {}
