//the user creates some NFTs
import { ethers } from "ethers";
import { useState, useEffect } from "react";


import Web3Modal from "web3modal";
import nftMarketAddress from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { useRouter } from "next/router";
import { NFTStorage } from "nft.storage";
export default function CreateNFT() {
 
  //the data
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [fileURL, setFileURL] = useState(null);

  //used later
  const [message, setMessage] = useState("Input the Following Details");
  const router = useRouter();
  
  const nftstore = new NFTStorage({
    token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDIzZUU1NGZEZDY2OGUzRTk4REYzOWVmNzdjZUFEQjdEMGNBMmE1NWIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MDMxNzgwOTkwMywibmFtZSI6IkZpcnN0IE1hcmtldHBsYWNlIn0.8NPIuZob3oJnxmozrrwx0EH9x1raRJaH3MFxTJ8t74M'
  });

  

  async function onChange(e) {
   
    const imageURL = e.target.files[0];
    console.log(imageURL);

    try {
      console.log("starting");

      const added = await nftstore.store({
        name : 'NFT name', 
        description : "some descriptions here ",
        image: imageURL,
      });
      //adding a file to this  computer
      
      
      const ipfsData = `https://nftstorage.link/ipfs/${added.ipnft}/metadata.json`
      console.log(ipfsData);
    } catch (e) {
      console.log(e);
      console.log("Something wrong");
    }
  }

  //upload the onClick button to submit the entire thing

  //uploading IPFS after all data is done which would be used to store the data as JSON
  async function uploadIPFS() {
    if (!price || !description || !name || !fileURL || price < 0) {
      setMessage("Please input properly");
      return;
    }

    const data = JSON.stringify({
      description,
      name,
      image: fileURL,
    });
    try {
      //client.add is from the aforementioned clien
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log(url);

      return url;
    } catch (e) {
      console.log("something wrong");
      console.log(e);
    }
  }

  async function SubmitMarketplace() {
    //setting up web3
    const url = await uploadIPFS();

    const web3Modal = new Web3Modal();
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    console.log(provider);
    const signer = provider.getSigner();

    //actaully uses the previsouly set up web3 to connect to providers
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
    router.push("/");
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
        <button
          className=" w-1/2 py-3 px-3 mx-auto mt-8 button bg-pink-500 text-white hover:rounded-2xl transition-all duration-300"
          onClick={uploadIPFS}
        >
          Submit to Marketplace
        </button>
      </div>
    </div>
  );
}
