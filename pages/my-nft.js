import { ethers } from "hardhat";
import { useState } from "react";
import nftMarketAddress from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import axios from "axios";
import web3Modal from "web3modal";

export default function Marketplace() {
  const [NFTs, setNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyNFTs = async () => {
    const Web3Modal = new web3Modal();
    const instance = Web3Modal.connect();
    const provider = ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();

    const nftMarket = new ethers.Contract(
      nftMarketAddress,
      NFTMarketplace,
      signer
    );
    const items = await nftMarket.fetchMyNFT();

    const allMyNFTs = Promise.all(
      items.map(async (nft) => {
        //getting tokenURI
        const uri = await nftMarket.tokenURI(nft.tokenId);
        //getting into the meat of the NFT itself
        const meta = await axios.get(uri);
        const price = ethers.utils.formatUnits(nft.price.toString(), "ether");
        let item = {
          price,
          image: meta.data.image,
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

  if (loading == true) {
    return <h1>Still Loading</h1>;
  }
  return (
    <div className="flex-col justify-center">
     <div className="p-4">
      <h1>Your NFTs</h1>
      {NFTs.map((nft, i) => (
        <div>{nft.name}</div>
      ))}
     </div>

    </div>
  );
}
