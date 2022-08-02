require("@nomiclabs/hardhat-waffle")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  //sample just for trial 
  defaultNetwork : "hardhat",
  networks : {
    hardhat : {
      chainId : 1337
    }
  },



  solidity: {
    version : "0.8.4", 
    settings : {
      optimizer : {
        enabled : true, 
        runs : 200
      }
    }
  }
};
