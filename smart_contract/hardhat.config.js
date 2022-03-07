require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.2",
  networks: {
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/IPmAPFHvFy7Lcyp8M1VaSjItVilHPFbX",
      accounts: [
        "2045ca9d173b037856b6942fca015ad8ff8f05d3d52c7579937063d9960bf748",
      ],
    },
  },
};

// 0x19f4FD40e739Ae1591e8FDe3Ca07D8922431F580
