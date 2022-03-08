var sensor = require('node-dht-sensor');
var CryptoJS = require("crypto-js");
const { resolve } = require('path/posix');
const { json } = require('stream/consumers');
const IPFS = require('ipfs-mini');
const CONTRACT_ADDRESS = "0x7766accE6883D302AA1cab19264aACa02607dc49";
const hre = require("hardhat");
const ethers = hre.ethers;
const contract = require("./IoTDataNFT.json");
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Provider
const provider = new ethers.providers.JsonRpcProvider(process.env.PROD_ALCHEMY_KEY);

// Signer
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
// Contract
const nftContract = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);

const MARKETPLACE_ADDRESS = "0x046f73556324909976CD47E949b9cb8C288Dc6Dc";


const marketplaceca = require("./Marketplace.json");

// Contract
const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, marketplaceca.abi, signer);

var datasa = [

]
const main = async () => {

    var result = sensor.read(11, 4);
    console.log("testing");
    datasa.push({ temperature: result.temperature.toFixed(1), humidity: result.humidity.toFixed(1), time: new Date() });
    setTimeout(printing, 1000);
}

function encryptionfunc() {
    var secret = "My Secret Passphrase";
    const plainText = JSON.stringify(datasa);
    var encrypted = CryptoJS.AES.encrypt(plainText, secret, { mode: CryptoJS.mode.ECB });
    return encrypted.toString();
}


async function printing() {
    return new Promise(resolve => {
        setTimeout(resolve, 1000);
    });

}

async function ipfsupload(ipfsdatainput) {

    const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    const data = ipfsdatainput;


    const tr = await ipfs.add(data);

    mintandlist(tr);

}

async function mintandlist(ipfshash) {
    console.log(".... " + ipfshash);
    console.log("Minting.....");
    const txs = await nftContract.mintdataNFT(ipfshash);
    const receipt = await txs.wait();
    var tokid = null;
    for (const event of receipt.events) {
        tokid = event.args.tokenId.toString();
    }
    console.log(txs);

    console.log("approving...");
    const tx = await nftContract.setApprovalForAll("0x046f73556324909976CD47E949b9cb8C288Dc6Dc", true)
    await tx.wait();
    console.log(tx);
    console.log("token id: " + tokid);
    const tx1 = await marketplaceContract.createOrder(ethers.utils.parseEther("0.01"), "0x7766accE6883D302AA1cab19264aACa02607dc49", tokid);
    await tx1.wait();
    console.log(tx);
    console.log("data bought");
}
const runMain = async () => {

    try {

        var start_Time = Date.now();
        while (Date.now() - start_Time < 10000) {
            await main();
            await printing();
        }

        encryptionfunc();

        var loool = [{ deviceId: "0x2Dc36eB34735D5d25f804f71A9aF01c7A53BA4ca" }];

        var loool = {
            name: "raspberrypi",
            deviceId: "0x2Dc36eB34735D5d25f804f71A9aF01c7A53BA4ca",
            image: "https://ipfs.infura.io/ipfs/QmSRQco3rDB6PQxmeXzH7ibxkZPCChUFqtw56SNg2dLNJD"
        }

        loool.data = encryptionfunc();
        console.log("----");
        console.log(loool);
        tmp = JSON.stringify(loool);
        ipfsupload(tmp);

    }
    catch (error) {
        console.log(error);
    }

};

runMain();