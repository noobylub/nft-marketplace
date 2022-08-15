import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import nftMarketAddress from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import axios from "axios";
import Web3Modal from "web3modal";

export default function resellFunction() {
  const router = useRouter();
  const { tokenId } = router.query;
  const [description, setDescription] = useState();
  const [name, setName] = useState();
  const [price, setPrice] = useState();
  const [image, setimage] = useState();

  useEffect(() => {
    getData();
  }, [tokenId]);

  const getData = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarketplace.abi,
      provider
    );
    const myNFTs = await marketContract.tokenURI(tokenId);
    const meta = await axios.get(myNFTs);
    setDescription(meta.data.description);
    setName(meta.data.name);
    setimage(`https://nftstorage.link/ipfs/${meta.data.image.substring(7)}`);
    console.log(myNFTs);
  };

  const submitResell = async () => {
    const web3modal = new Web3Modal();
    const web3Instance = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(web3Instance);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarketplace.abi,
      signer
    );
    const maticPrice = ethers.utils.parseUnits(price, "ether");
    let listingPrice = await marketContract.marketFee();
    listingPrice = listingPrice.toString();
    const tx = await marketContract.resellingToken(tokenId, maticPrice, {
      value: listingPrice,
    });
    await tx.wait();
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col pb-12 w-1/2 justify-center">
        <input
          type="number"
          placeholder="Asset price Matic Polygon"
          className="mt-8 border rounded p-5 hover:border-pink-500 texting"
          onChange={(e) => {
            setPrice(e.target.value);
          }}
        />
        <div className="flex flex-col justify-center align-middle p-10 border w-1/2">
          <img src={image} alt="" className="rounded " width="350" />
          <p className="text-2xl font-bold p-10">{name}</p>
          <p className="text-xl p-2">{description}</p>
        </div>

        <button
          className=" w-1/2 py-3 px-3 mx-auto mt-8 button bg-pink-500 text-white hover:rounded-2xl transition-all duration-300"
          onClick={submitResell}
        >
          Submit to Marketplace
        </button>
      </div>
    </div>
  );
}
