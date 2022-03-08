import { useEffect, useState } from 'react'
import axios from 'axios'
import { ethers } from 'ethers'
import Web3Modal from "web3modal"
import styles from "../styles/homepage.module.css"


const nftaddress = "0x7766accE6883D302AA1cab19264aACa02607dc49"
const nftmarketaddress = "0x046f73556324909976CD47E949b9cb8C288Dc6Dc"
import NFT from '../artifacts/contracts/IoTDataNFT.sol/IoTDataNFT.json'
import Market from '../artifacts/contracts/Marketplace.sol/Marketplace.json'


export default function Homepage() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        displayNFTs()
    }, [])
    async function displayNFTs() {

        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)

        // Gets NFT and Marketplace contract and abi
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)

        // Returns the order information of the nft's listed on the marketplace
        const data = await marketContract.getMarketPlaceNfts(nftaddress)

        // returns and gets the nft item data information 
        const nfttokens = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get("https://ipfs.infura.io/ipfs/" + tokenUri)
            console.log("meta");
            console.log(meta);
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let orderingid = i.orderingid.toString();
            let possessor = i.possessor.toString();
            let orderitem = {
                price,
                possessor,
                tokenId: i.tokenId.toNumber(),
                datamakerID: meta.data.deviceId,
                orderingid,
                image: meta.data.image,
                tokenUri
            }
            return orderitem
        }))
        setNfts(nfttokens)
        setLoadingState('loaded')
    }

    async function buyNft(nft) {

        // Connects wallet to the web page
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

        // Gets price of the NFT listed
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

        // Calls the contract to buy the NFT data
        const tx = await contract.purchase(nft.orderingid, {
            value: price
        })
        await tx.wait()
        displayNFTs()
    }

    if (loadingState === 'loaded' && !nfts.length) return (<h1>No Data is Currently Being Sold</h1>)
    return (
        <div className={styles.main}>
            <div style={{ maxWidth: 'auto', paddingLeft: '70px' }}>
                <div className={styles.displaynfts}>
                    {
                        nfts.map((nft, i) => (
                            // Gets individual NFT items and displays the information relating to it 
                            <div key={i}>
                                <img src={nft.image} />
                                <div>
                                    <p> Device Id: {nft.datamakerID}</p>
                                    <p> Owner of Data: {nft.possessor} </p>
                                    <p> Data: {nft.tokenUri} </p>
                                    <p> Token Id: {nft.tokenId} </p>
                                    <p>Order Id: {nft.orderingid}</p>
                                    <p>{nft.price} ETH</p>
                                    <a href={"https://rinkeby.etherscan.io/token/0x7766accE6883D302AA1cab19264aACa02607dc49?a=" + nft.tokenId} target="_blank" rel="noopener noreferrer"> View on Etherscan </a>
                                    <p>{"\n"}</p>
                                    <button onClick={() => buyNft(nft)}>Buy</button>
                                    <p>{"\n"}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div >
    )
}