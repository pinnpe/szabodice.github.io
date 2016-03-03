var config = {};

config.contract_dice = 'dice.sol';
config.addrs = ["0xe937ee393003e06d601d1e60d9dc16b734bee532"];
config.home_url = 'http://szabodice.github.io';
config.eth_testnet = true;

try {
  global.config = config;
  module.exports = config;
} catch (err) {}
