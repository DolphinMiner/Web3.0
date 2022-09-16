require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */

// 账户地址
const OWNER_ADDRESS = "30";
// 账户私钥 设置为自己的账户私钥
const PRIVATE_KEY = "8a2";

// infrua 可以去infrua官网申请
const INFURA_PROJECT_KEY = "1a";

// alchemy
const ALCHEMY_PORJECT_KEY = "lP";

// nft.storage API Token
const NFT_STORAGE_KEY = "ek";

// 部署成功后的合约地址
const NFT_CONTRACT_ADDRESS = "0x6334ff95222dc286D95b26A3F0e1E65233B24106";

module.exports = {
  solidity: "0.8.9",
// 配置部署的网络，这里我配置了两个测试环境ropsten和goerli
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_PROJECT_KEY}`,
      accounts: [`${PRIVATE_KEY}`]

    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_PORJECT_KEY}`,
      accounts: [`${PRIVATE_KEY}`]
    },
  },
  // 配置mint需要的属性，这里是通过NFT.Storage铸币，所在的链是goerli测试链
    mintConfig:{
      contractAddress:`${NFT_CONTRACT_ADDRESS}`,
      storageKey:`${NFT_STORAGE_KEY}`,
      privateKey: `${PRIVATE_KEY}`,
      infuraKey:`${INFURA_PROJECT_KEY}`,
      ownerAddress:`${OWNER_ADDRESS}`,
      network:'goerli'
    }
};