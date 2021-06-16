const HDWalletProvider = require("@truffle/hdwallet-provider");


module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*"
        },
        main: {
            provider: function () {
                return new HDWalletProvider(
                    config.MAINNET_SECRET_KEY,
                    `https://mainnet.infura.io/v3/ada153645fff42218a7148f679997679}`// Url to an Ethereum Node
                )
            },
            gas: 5000000,
            gasPrice: 5000000000,
            network_id: 42
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(
                    config.RINKEBY_SECRET_KEY,
                    `https://rinkeby.infura.io/v3/ada153645fff42218a7148f679997679}`// Url to an Ethereum Node
                )
            },
            gas: 5000000,
            gasPrice: 5000000000,
            network_id: 4
        }
    },
    contracts_directory: './src/contracts/',
    contracts_build_directory: './src/abis',
    compilers: {
        solc: {
            version: ">=0.6.0 <0.8.0",
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
};