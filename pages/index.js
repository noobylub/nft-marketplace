import { ethers } from "hardhat";
import { useEffect, useState } from "react";
import { axios } from "axios";
import web3Modal from "web3modal";
import { nftMarketAddress } from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

//the home page with all the NFTs in them
export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    //loads only the provider because we are not transacting or editing
    setLoading(true);
    const provider = new ethers.providers.JsonRpcProvider();
    const NFTMarketContract = ethers.Contract(
      nftMarketAddress,
      NFTMarketplace,
      provider
    );
    const allNFTs = await NFTMarketContract.fetchMarket();

    //map over the items to get individual image and name
    const items = Promise.all(
      allNFTs.map(async (nft) => {
        const tokenURI = await NFTMarketContract.tokenURI(nft.tokenId);
        //the image, name and other things like that
        const meta = await axios.get(tokenURI);
        console.log(meta);
        //parse is chaning from normal to ether format is changing from ether to normal
        const value = ethers.utils.formatUnits(nft.price.toString(), "ethers");
        let item = {
          value,
          tokenId: nft.tokenId.toNumber(),
          seller: nft.seller,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoading(false);
  }

  async function buyNFTs(nft) {
    //web3 sets up for the wallet to support wallet
    const Web3Modal = new web3Modal();
    const instance = Web3Modal.connect();
    //web3modal gets ready so that you can get the signer wallet not just provider
    //and provider basically means that you can only see with the view
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();

    //the contract instance
    const nftMarketplace = new ethers.Contract(
      nftMarketAddress,
      NFTMarketplace,
      signer
    );
    //knowing the price to set up for msg.value
    const price = ethers.utils.parseUnits(nft.value.toString(), "ethers");
    const tx = await nftMarketplace.marketItemSold(nft.tokenId, {
      value: price,
    });
    await tx.wait();
    loadNFTs();
  }
  if (loading === true) {
    <div className="flex justify-center my-6 ">
      <h1>Please Wait while Loading</h1>
    </div>;
  } else if (loading === false && !nfts.length) {
    <div className="flex justify-center my-6 ">
      <h1>Oops nothings to show here</h1>
      <h1>Please come back to see something more later</h1>
    </div>;
  }

  return (
    <div className="flex justify-center my-6 ">
      <h1>Welcome to Polygon Marketplace</h1>
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              //mapping out the NFTs and just to remember we need the key
              nfts.map((nft, i) => {
                <div></div>
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
