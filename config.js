var config = {};

config.contract_dice = 'dice.sol';
config.contract_dice_addrs = ["0xf4e219005bf0e96f69d6a9b3c7e39ae4ce455fd1","0x29ccdfd8243bcce2d44173cea61691c2b7b43dec","0x248f78ac8fede2d47c0a20fc91b92fe0fd4b277c","0x7dbe576bb948f9a78149e1295fcac8d9a9062573","0xa6a9e2e45e5f15f09eb29dbcc4a07533c964ce26"];
config.home_url = 'http://szabodice.github.io';
config.eth_testnet = false;
config.eth_addr = '0x0000000000000000000000000000000000000000';
config.eth_addr_pk = '';

try {
  global.config = config;
  module.exports = config;
} catch (err) {}
