import { ethers } from "ethers";
import { useState, useEffect } from "react";
import web3modal from "web3modal";
import axios from "axios";

import nftMarketAddress from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function ListedNFT() {
  const [NFT, setNFTs] = useState([]);

    const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadListedNFT();
  }, []);

  const loadListedNFT = async () => {
    setLoading(true); 
    const Web3Modal = new web3modal();
    const connection = await Web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    //marketplace
    const marketplace = new ethers.Contract(
      nftMarketAddress,
      NFTMarketplace.abi,
      signer
    ); 

    const item = await marketplace.fetchMyListedNFT();
    const myFinalNFT = await Promise.all(
      item.map(async (i) => {
        const uri = await marketplace.tokenURI(i.tokenId);
        console.log(i.tokenId);
        const meta = await axios.get(uri);
        const price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let oneItem = {
          price,
          name: meta.data.name,
          description: meta.data.description,
          image: `https://nftstorage.link/ipfs/${meta.data.image.substring(7)}`,
          tokenId: i.tokenId.toNumber(),
          owner: i.owner,
          seller: i.seller,
        };
        return oneItem;
      })
    );
    setNFTs(myFinalNFT);
    setLoading(false);
  };

  if (loading === true && !NFT.length)
    return <h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>;
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Listed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {NFT.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} Eth
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
