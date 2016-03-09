var config = {};

config.contract_dice = 'dice.sol';
config.contract_dice_addrs = ["0x465064252f4ae7107c6a3a2865c25ef1ae93fa81","0x4533d69a06f29e8d0deeb9b823945509f70d60d5","0xdb4f1106050fc2b5013e152dc649344250b764fa","0xc8553b18aad0987f5d37bf5d4c2522fa2b7dbdaa","0x4d0cc9e4403d0863bf651dad928d84661fae2c49"];
config.home_url = 'http://szabodice.github.io';
config.eth_testnet = false;
config.eth_addr = '0x0000000000000000000000000000000000000000';
config.eth_addr_pk = '';

try {
  global.config = config;
  module.exports = config;
} catch (err) {}
