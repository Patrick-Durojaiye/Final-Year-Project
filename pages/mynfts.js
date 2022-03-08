import { useEffect, useState } from 'react'
import axios from 'axios'
import { ethers } from 'ethers'
import Web3Modal from "web3modal"
import styles from "../styles/homepage.module.css"

var CryptoJS = require("crypto-js");

const secret = process.env.NEXT_PUBLIC_DECRYPTION_KEY

const nftaddress = "0x7766accE6883D302AA1cab19264aACa02607dc49"
import NFT from '../artifacts/contracts/IoTDataNFT.sol/IoTDataNFT.json'

export default function MyNfts() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        displayMyNFTs()
    }, [])
    async function displayMyNFTs() {

        // Connects wallet to web page
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        // Gets address of connected wallet
        var address = await signer.getAddress()

        // Gets the contract and abi
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

        // Gets the total amount of NFT's
        var totalTotalIds = await tokenContract.totalNFTs()
        var nfthashes = []

        for (let k = 0; k < totalTotalIds; k++) {

            var ownernft = await tokenContract.ownerOf(k)
            console.log(ownernft)
            if (ownernft == address) {

                // Stores NFT data inside array
                nfthashes.push(await tokenContract.tokenURI(k))
            }
        }

        const nfttokens = await Promise.all(nfthashes.map(async i => {
            console.log("hash: " + i)
            const meta = await axios.get("https://ipfs.infura.io/ipfs/" + i)
            console.log("meta");
            console.log(meta);

            // Stores NFT data information
            let item = {
                data: i,
                datamakerID: meta.data.deviceId,
                image: meta.data.image,
                encrypteddata: meta.data.data,
            }
            return item
        }))

        setNfts(nfttokens)
        setLoadingState('loaded')
    }

    async function show(nft) {

        // Gets encrypted data 
        var ciphertext = nft.encrypteddata;

        // Decrypts encrypted data stored in NFT
        var decrypted = CryptoJS.AES.decrypt(ciphertext, secret, { mode: CryptoJS.mode.ECB });

        let id = (id) => document.getElementById(id);

        let decryptmessage = id("dt");

        // Displays decrypted data
        decryptmessage.innerHTML = decrypted.toString(CryptoJS.enc.Utf8);
    }
    if (loadingState === 'loaded' && !nfts.length) return (<h1>No items in marketplace</h1>)
    return (
        <div className={styles.lol}>
            <div className="px-4" style={{ maxWidth: 'auto', paddingLeft: '70px' }}>
                <div className={styles.displaynfts}>
                    {
                        nfts.map((nft, i) => (

                            // Displays each NFT information
                            <div key={i}>
                                <img src={nft.image} />
                                <div>
                                    <p> Device Id: {nft.datamakerID}</p>
                                    <p> Data: {nft.data}</p>
                                    <p>{"\n"}</p>
                                    <button onClick={() => show(nft)}>Decrypt and view data</button>
                                    <p>{"\n"}</p>
                                    <div id='dt' style={{ color: '#ffffff' }}></div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div >
    )
}