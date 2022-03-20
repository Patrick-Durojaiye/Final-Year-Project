import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import styles from "../styles/sellpage.module.css"

const nftaddress = "0x7766accE6883D302AA1cab19264aACa02607dc49"
const nftmarketaddress = "0x046f73556324909976CD47E949b9cb8C288Dc6Dc"
import NFT from '../artifacts/contracts/IoTDataNFT.sol/IoTDataNFT.json'
import Market from '../artifacts/contracts/Marketplace.sol/Marketplace.json'

export default function sellData() {

    const router = useRouter()

    async function createSale() {

        // Connects wallet to webpage
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        // Get NFT contract and abi
        let contract = null
        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const nftid = await document.getElementById("idtokenid").value
        console.log("id: " + nftid)
        // Gets price from input 
        const price = ethers.utils.parseEther(await document.getElementById("priceid").value)
        console.log(price.toString())
        // Calls the contract to sell the NFT data on the marketplace
        let transaction = await contract.createOrder(price.toString(), nftaddress, nftid)
        await transaction.wait()
        router.push('/')
    }

    async function approveNFT() {

        // Connects wallet to web page
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        // Gets contract and abi
        let nftContract = null
        nftContract = new ethers.Contract(nftaddress, NFT.abi, signer)

        // Approves the marketplace contract for transferring the NFT data a user owns
        const tx = await nftContract.setApprovalForAll("0x046f73556324909976CD47E949b9cb8C288Dc6Dc", true)
        await tx.wait();
        console.log(tx);
    }

    return (
        <div className={styles.main}>

            <div className={styles.formpart}>
                <h1> Sell Your Data </h1>
                <p> To sell your data please input the Token Id representing your data as a NFT and include the price in Ether you want to sell it for </p>
                {/* Collects information from user to sell the data*/}
                <input
                    id="idtokenid"
                    placeholder="Token ID"
                    className={styles.tokenidinput}
                />

                <input
                    id="priceid"
                    placeholder="Asset Price in Eth"
                    className={styles.priceinput}
                    type="number"
                />

                <button onClick={createSale}>
                    Sell NFT
                </button>
                <p>{"\n"}</p>
                <button onClick={approveNFT}> Appprove NFT </button>
            </div>
        </div>
    )
}