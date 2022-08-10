import { ethers } from "hardhat";
import { useState } from "react";
import nftMarketAddress from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function Marketplace() {
  const [nft, setNFTs] = useState([]);
  const [loading, setLoading] = useState();

  const loadMyNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const nftMarket = new ethers.Contract(
      nftMarketAddress,
      NFTMarketplace,
      provider
    );
  };
}
