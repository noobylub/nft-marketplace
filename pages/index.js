import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import web3Modal from "web3modal";
import nftMarketAddress from "../config";
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
    const NFTMarketContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarketplace.abi,
      provider
    );
    const allNFTs = await NFTMarketContract.fetchMarket();

    //map over the items to get individual image and name
    const items = await Promise.all(
      allNFTs.map(async (nft) => {
        //when we store nft, we store the uri which was helped by infura client.add method
        const tokenURI = await NFTMarketContract.tokenURI(nft.tokenId);
        //the image, name and other things like that
        const meta = await axios.get(tokenURI);

        //parse is chaning from normal representative string  to ether
        //format is changing from BIgNumberIsh representing ether to normal
        const value = ethers.utils.formatUnits(nft.price.toString(), "ether");
        let item = {
          value,
          tokenId: nft.tokenId.toNumber(),
          seller: nft.seller,
          image: `https://nftstorage.link/ipfs/${meta.data.image.substring(7)}`,
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
    // const x = JSON.stringify(nft);
    // console.log(x.value)
    //web3 sets up for the wallet to support wallet
    //modal is like the popup by the way
    const Web3Modal = new web3Modal();
    const instance = await Web3Modal.connect();
    //web3modal gets ready so that you can get the signer wallet not just provider
    //and provider basically means that you can only see with the view
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();

    //the contract instance
    const nftMarketplace = new ethers.Contract(
      nftMarketAddress,
      NFTMarketplace.abi,
      signer
    );
    //knowing the price to set up for msg.value
    const price = ethers.utils.parseUnits(nft.value.toString(), "ether");
    const tx = await nftMarketplace.marketItemSold(nft.tokenId, {
      value: price,
    });
    await tx.wait();
    loadNFTs();
  }
  if (loading === true) {
    return (
      <div className="flex justify-center my-6 ">
        <h1>Please Wait while Loading</h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center my-6 ">
      <h1>Welcome to Polygon Marketplace</h1>
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              //mapping out the NFTs and just to remember we need the key
              //you can put anything else besides nft, its just the individual instance is nft
              nfts.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} alt="" />
                  <div className="p-4">
                    <p
                      style={{ height: "64px" }}
                      className="font-semibold text-2xl"
                    >
                      {nft.name}
                    </p>
                    <p className="font-semibold text-2xl">{nft.seller}</p>
                    <div style={{ height: "70px", overflow: "hidden" }}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                    {/* for the buying option */}
                    <div className="p-4 bg-black">
                      <p className="text-2xl font-bold text-white">
                        {nft.value}
                      </p>
                      <button
                        onClick={() => {
                          buyNFTs(nft);
                        }}
                        className="mt-4 2-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                      >
                        Buy {nft.name}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
