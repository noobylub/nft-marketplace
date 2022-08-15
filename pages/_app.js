import '../styles/globals.css'
import Link from 'next/link'
function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b flex flex-row justify-between p-6">
        <p className="text-4xl font-bold">Metaverse Markeplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a  className="mr-10 text-2xl hover-main-menu text-pink-500 ">Home</a>
          </Link>
          <Link href="/create-nft">
            <a  className="mr-10 text-2xl hover-main-menu text-pink-500">Create NFTs</a>
          </Link>
          <Link href="/my-nft">
            <a  className="mr-10 text-2xl hover-main-menu text-pink-500">My NFTs</a>
          </Link>
          <Link href="/listed-nfts">
            <a  className="mr-10 text-2xl hover-main-menu text-pink-500">Dashboard</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps}/>
    </div>

    
  )
}

export default MyApp
