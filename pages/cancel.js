import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import styles from "../styles/sellpage.module.css"

const nftmarketaddress = "0x046f73556324909976CD47E949b9cb8C288Dc6Dc"

import Market from '../artifacts/contracts/Marketplace.sol/Marketplace.json'

export default function Cancel() {
    const router = useRouter()

    async function cancelSale() {

        // Connects web page to the Ethereum wallet
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        console.log("signer: " + signer.toString())

        let contract = null
        // Gets contract address and abi 
        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

        // Gets order Id from the input 
        const orderid = await document.getElementById("orderid").value;

        // Calles the contract to cancel the NFT data listing
        let transaction = await contract.cancelOrder(orderid.toString())
        await transaction.wait()
        router.push('/')
    }


    return (
        <div className={styles.main}>

            <div className={styles.formpart}>
                <h1> Sell Your Data </h1>
                <p> To sell your data please input the Token Id representing your data as a NFT and include the price in Ether you want to sell it for </p>
                {/* Input to get order Id to cancel NFT data listing */}
                <input
                    id="orderid"
                    placeholder="Order ID"
                    className={styles.orderidinput}
                />

                <button onClick={cancelSale}>
                    Create Digital Asset
                </button>

            </div>
        </div>
    )
}