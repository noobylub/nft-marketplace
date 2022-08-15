import { ethers } from "ethers";
import { useState, useEffect } from "react";
import nftMarketAddress from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import axios from "axios";
import web3Modal from "web3modal";
import { useRouter } from "next/router";

export default function Marketplace() {
  const [NFTs, setNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    loadMyNFTs();
  }, []);

  const loadMyNFTs = async () => {
    const Web3Modal = new web3Modal();
    const instance = await Web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();

    const nftMarket = new ethers.Contract(
      nftMarketAddress,
      NFTMarketplace.abi,
      signer
    );
    const items = await nftMarket.fetchMyNFT();

    const allMyNFTs = await Promise.all(
      items.map(async (nft) => {
        //getting tokenURI from nft.storage
        const uri = await nftMarket.tokenURI(nft.tokenId);
        //getting into the meat of the NFT itself
        const meta = await axios.get(uri);
        const price = ethers.utils.formatUnits(nft.price.toString(), "ether");
        let item = {
          price,
          image: `https://nftstorage.link/ipfs/${meta.data.image.substring(7)}`,
          name: meta.data.name,
          description: meta.data.description,
          //this will be usefull later as we need to indenfity which nft to edit and to sell
          tokenId: nft.tokenId.toNumber(),
          seller: nft.seller,
        };
        return item;
      })
    );
    setNFTs(allMyNFTs);
    setLoading(false);
  };

  const listNFT = (nft) => {
    router.push(`/resell-nft?tokenId=${nft.tokenId}`)
  }

  if (loading == true) {
    return <h1>Still Loading</h1>;
  }
  return (
    <div className="flex-col justify-center">
      <div className="p-4">
        <h1>Your NFTs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {NFTs.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} className="rounded" />
              <p className="text-xl font-bold p-4">
                {nft.name}
              </p>
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Bought for - {nft.price} Eth
                </p>
                <button
                  className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                  onClick={() => listNFT(nft)}
                >
                  List
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
