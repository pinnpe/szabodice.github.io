var config = {};

config.contract_dice = 'dice.sol';
config.contract_dice_addrs = ['0xb10c013a492f0d771f743dddff1361129e18d737'];
config.home_url = 'http://szabodice.github.io';
config.eth_testnet = true;
config.eth_addr = '0x0000000000000000000000000000000000000000';
config.eth_addr_pk = '';

try {
  global.config = config;
  module.exports = config;
} catch (err) {}
