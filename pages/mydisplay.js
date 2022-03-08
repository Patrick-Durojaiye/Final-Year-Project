import { useEffect, useState } from 'react'
import axios from 'axios'
import { ethers } from 'ethers'
import Web3Modal from "web3modal"
import styles from "../styles/homepage.module.css"


const nftaddress = "0xCA61925Dd2fceA4BeA5B3F095BFEfE8C531AaF58"
const nftmarketaddress = "0xbAf7E2F0c88988263748C817f42F9cb4e9D8A593"
import NFT from '../artifacts/contracts/IoTDataNFT.sol/IoTDataNFT.json'
import Market from '../artifacts/contracts/Marketplace.sol/Marketplace.json'

let rpcEndpoint = null

rpcEndpoint = 'https://eth-rinkeby.alchemyapi.io/v2/6B7Lr607ROtgLm045sJ20FgzYNavoIHT'

export default function Home() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [currentAccount, setCurrentAccount] = useState("")
    useEffect(() => {
        checkIfWalletIsConnected();
    }, [])

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
            loadNFTs();
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account)
        } else {
            console.log("No authorized account found")
        }
    }

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
            loadNFTs()

        } catch (error) {
            console.log(error)
        }
    }

    const renderNotConnectedContainer = () => (
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
        </button>
    );

    async function loadNFTs() {
        const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
        const data = await marketContract.getMarketPlaceNfts(nftaddress)
        console.log("dd" + provider.selectedAddress);
        const items = await Promise.all(data.map(async i => {

            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get("https://ipfs.infura.io/ipfs/" + tokenUri)
            console.log("meta");
            console.log(meta);
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let orderingid = i.orderingid.toString();
            let possessor = i.possessor.toString();
            let item = {
                price,
                possessor,
                tokenId: i.tokenId.toNumber(),
                datamakerID: meta.data.deviceId,
                orderingid,
                image: meta.data.image,
                tokenUri
            }
            return item
        }))
        setNfts(items)
        setLoadingState('loaded')
    }
    async function buyNft(nft) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        console.log(nft.orderingid.toString());
        const transaction = await contract.purchase(nft.orderingid, {
            value: price
        })
        await transaction.wait()
        loadNFTs()
    }
    if (loadingState === 'loaded' && !nfts.length) return (<h1>No items in marketplace</h1>)
    return (
        <div className={styles.lol}>
            <div className="px-4" style={{ maxWidth: 'auto', paddingLeft: '70px' }}>
                {currentAccount === "" ? (
                    renderNotConnectedContainer()
                ) : (
                    <div className={styles.displaynfts}>
                        {
                            nfts.map((nft, i) => (
                                <div key={i}>

                                    <img src={nft.image} />
                                    <div>
                                        <p> Device Id: {nft.datamakerID}</p>
                                        <p> Owner of Data: {nft.possessor} </p>
                                        <p> Data: {nft.tokenUri} </p>
                                        <p>Order Id: {nft.orderingid}</p>
                                        <p>{nft.price} ETH</p>
                                        <a href={"https://rinkeby.etherscan.io/token/0xca61925dd2fcea4bea5b3f095bfefe8c531aaf58?a=" + nft.tokenId} target="_blank" rel="noopener noreferrer"> View on Etherscan </a>
                                        <p>{"\n"}</p>
                                        <button onClick={() => buyNft(nft)}>Buy</button>
                                        <p>{"\n"}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </div >
    )
}