const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = "0x046f73556324909976CD47E949b9cb8C288Dc6Dc";


const contract = require("../artifacts/contracts/Marketplace.sol/Marketplace.json");

// Provider
const provider = new ethers.providers.JsonRpcProvider(process.env.PROD_ALCHEMY_KEY);

// Signer
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
// Contract
const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);

const main = async () => {

    const tx = await marketplaceContract.createOrder(ethers.utils.parseEther("0.01"), "0x7766accE6883D302AA1cab19264aACa02607dc49", 0);
    await tx.wait();
    console.log(tx);

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
