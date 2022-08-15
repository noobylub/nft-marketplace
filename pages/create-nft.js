//the user creates some NFTs
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";

import Web3Modal from "web3modal";
import nftMarketAddress from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { useRouter } from "next/router";
import { NFTStorage } from "nft.storage";
export default function CreateNFT() {
  //the data
  const [price, setPrice] = useState("");
  const [descriptionF, setDescription] = useState("");
  const [nameF, setName] = useState("");
  const [fileURL, setFileURL] = useState(null);
  const [loading, setLoading] = useState(false);

  //used later
  const [message, setMessage] = useState("Input the Following Details");
  const router = useRouter();

  const nftstore = new NFTStorage({
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDIzZUU1NGZEZDY2OGUzRTk4REYzOWVmNzdjZUFEQjdEMGNBMmE1NWIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MDMxNzgwOTkwMywibmFtZSI6IkZpcnN0IE1hcmtldHBsYWNlIn0.8NPIuZob3oJnxmozrrwx0EH9x1raRJaH3MFxTJ8t74M",
  });

  async function onChange(e) {
    const imageURL = e.target.files[0];
    setFileURL(imageURL);

    // try {
    //   console.log("starting");

    //   const added = await nftstore.store({
    //     name : 'NFT name',
    //     description : "some descriptions here ",
    //     image: imageURL,
    //   });
    //   //adding a file to this  computer

    //   console.log(added)
    //   const ipfsData = `https://nftstorage.link/ipfs/${added.ipnft}/metadata.json`
    //   console.log(ipfsData);
    //   const name = await axios.get(ipfsData)

    //   const imageData = name.data.image.substring(7);
    //   const images = `https://nftstorage.link/ipfs/${imageData}`
    //   console.log(imageData);
    //   setFileURL(images);
    // } catch (e) {
    //   console.log(e);
    //   console.log("Something wrong");
    // }
  }

  //uploading IPFS after all data is done which would be used to store the data as JSON
  async function uploadIPFS() {
    if (!price || !descriptionF || !nameF || !fileURL || price < 0) {
      setMessage("Please input properly");
      return;
    }
    try {
      const newToken = await nftstore.store({
        name: nameF,
        description: descriptionF,
        image: fileURL,
      });
      //the ipfs URL but the image needs some adjustment to be display with
      //   const images = `https://nftstorage.link/ipfs/${imageData}`
      //   console.log(imageData);
      //   setFileURL(images);
      const ipfsData = `https://nftstorage.link/ipfs/${newToken.ipnft}/metadata.json`;
      console.log(ipfsData);
      return ipfsData;
    } catch (e) {
      console.log("something wrong");
      console.log(e);
    }
  }

  async function SubmitMarketplace() {
    try{
      setLoading(true); 
      //setting up web3
      const url = await uploadIPFS();
  
      const web3Modal = new Web3Modal();
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      console.log(provider);
      const signer = provider.getSigner();
  
      //actaully uses the previsouly set up web3 to connect to providers
      //remember ethers is in matic
      const Maticprice = ethers.utils.parseUnits(price, "ether");
      //create an instance of the contract so I can interact with it
      const NFTmarketplace = new ethers.Contract(
        nftMarketAddress,
        NFTMarketplace.abi,
        signer
      );
      let listingPrice = await NFTmarketplace.marketFee();
      console.log("Listing Price is: " + listingPrice);
      listingPrice = listingPrice.toString();
      //calls to the function
      let createTokenTX = await NFTmarketplace.createToken(url, Maticprice, {
        value: listingPrice,
      });
      await createTokenTX.wait();
      setLoading(false); 
      router.push("/");
    }
    catch(e){
      console.log(e); 
      setLoading(false); 
    }
   
  }

  return (
    <div className="flex justify-center ">
      <div className="flex w-1/2 flex-col text-center pb-12">
        <input
          type="text"
          name="Asset Name"
          placeholder="Asset Name"
          className="mt-8 border rounded p-5 hover:border-pink-500 texting "
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <textarea
          type="text"
          name="Asset Description"
          placeholder="Asset Description"
          className="mt-8 border rounded p-5 hover:border-pink-500 texting"
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
        <input
          type="number"
          name="Asset Price"
          placeholder="Asset Price"
          className="mt-8 border rounded p-5 hover:border-pink-500  texting"
          onChange={(e) => {
            setPrice(e.target.value);
          }}
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileURL && (
          <img src={fileURL} alt="" className="rounded" width="350" />
        )}

        {loading ? (
          <h1 className=" w-1/2 py-3 px-3 mx-auto mt-8 button bg-pink-500 text-white hover:rounded-2xl transition-all duration-300">
            Loading
          </h1>
        ) : (
          <button
            className=" w-1/2 py-3 px-3 mx-auto mt-8 button bg-pink-500 text-white hover:rounded-2xl transition-all duration-300"
            onClick={SubmitMarketplace}
          >
            Submit to Marketplace
          </button>
        )}
      </div>
    </div>
  );
}
