import '../styles/globals.css'
import styles from "../styles/navigation.module.css"
import Link from 'next/link'

function Navagation({ Component, pageProps }) {
    return (
        <div className={styles.topnav}>
            <nav>
                <p className={styles.titletext}>IoT Data Marketplace</p>
                {/* Navagation Items */}
                <div className={styles.navitems}>
                    <Link href="/">
                        <p>
                            Home
                        </p>
                    </Link>
                    <Link href="/sell">
                        <p>
                            Sell Data
                        </p>
                    </Link>
                    <Link href="/cancel">
                        <p>
                            Cancel Sells
                        </p>
                    </Link>

                    <Link href="/mynfts">
                        <p>
                            My Nft's
                        </p>
                    </Link>

                </div>
            </nav>
            <Component {...pageProps} />
        </div >
    )
}

export default Navagation