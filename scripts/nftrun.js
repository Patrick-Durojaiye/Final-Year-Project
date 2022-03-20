const hre = require("hardhat");
const URL = process.env.PROD_ALCHEMY_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = "0x7766accE6883D302AA1cab19264aACa02607dc49";


const contract = require("../artifacts/contracts/IoTDataNFT.sol/IoTDataNFT.json");

// Provider
const provider = new hre.ethers.providers.JsonRpcProvider(process.env.PROD_ALCHEMY_KEY);

// Signer
const signer = new hre.ethers.Wallet(PRIVATE_KEY, provider);
// Contract
const nftContract = new hre.ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);

const main = async () => {

    console.log("Minting.....");
    const txs = await nftContract.mintdataNFT("QmafW2n1QKJjn6EVdFJ8N1QkAQEnXtKj4aEJJQLgmKJ69D");
    //const txs = await nftContract.addToWhitelist("0x2Dc36eB34735D5d25f804f71A9aF01c7A53BA4ca")
    console.log(txs);
    console.log("minted");
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();