// const { ethers } = require("ethers");

//test 1 done
// describe("Create NFTs", () => {
//   it("Should create some nft ", async function () {
//     //NFTMarketplace is the place for the contract deployment
//     const NFTMarketplaceContract = await ethers.getContractFactory(
//       "NFTMarketplace"
//     );
//     //nftMarket is the actual contract
//     const nftMarket = await NFTMarketplaceContract.deploy();
//     await nftMarket.deployed();

//     let listingPrice = await nftMarket.marketFee();
//     console.log("price is: " + listingPrice.toString());

//     //creating some tokens
//     auctionPrice = ethers.utils.parseUnits("1", "ether");
//     //the last is the msg.value and you want to put the listing price
//     await nftMarket.createToken(
//       "https://www.mytokenlocation.com",
//       auctionPrice,
//       { value: listingPrice }
//     );
//     auctionPrice = ethers.utils.parseUnits("3", "ether");
//     await nftMarket.createToken(
//         "https://www.mytokenlocation2.com",
//         auctionPrice,
//         {value : listingPrice}
//     )

//     const [owner, customer1, customer2] = await ethers.getSigners();
//     items = await nftMarket.fetchMarket();
//     items = await Promise.all(items.map(async i => {
//       //apparently within ERC721 methods you can get the tokenURI and the owner of
//         const tokenURI = await nftMarket.tokenURI(i.tokenId);
//         let item = {
//             price: i.price.toString(),
//             tokenId: i.tokenId.toString(),
//             seller: i.seller,
//             owner: await nftMarket.ownerOf(i.tokenId),
//             tokenURI
//         }
//         return item
//     }));
//     console.log(items);
//   });

// });

describe("Scenarios", () => {
  //just creates 4 nfts first by t
  let owner, customer1, customer2, customer3, customer4;
  let itemTest;
  let nftMarket;
  beforeEach(async () => {
    const nftMarketContract = await ethers.getContractFactory("NFTMarketplace");
    nftMarket = await nftMarketContract.deploy();
    const marketFee = await nftMarket.marketFee();
    await nftMarket.deployed();
    [owner, customer1, customer2, customer3, customer4] =
      await ethers.getSigners();

    //creating the tokens to use
    //they are all two tokens
    let price = ethers.utils.parseUnits('1', 'ether');
    await nftMarket
      .connect(customer1)
      .createToken("https://www.mytokenlocation2.com", price, {
        value: marketFee,
      });
    await nftMarket
      .connect(customer2)
      .createToken("https://www.mytokenlocation.com", price, {
        value: marketFee,
      });

    await nftMarket
      .connect(customer2)
      .createToken("https://www.mytokenlocation2.com", price, {
        value: marketFee,
      });
    await nftMarket
      .connect(owner)
      .createToken("https://www.mytokenlocation2.com", price, {
        value: marketFee,
      });
  });
 
  it("The NFTs in the market should be all", async () => {
    let items = await nftMarket.fetchMarket();
    items = await Promise.all(items.map(async(i) => {
      let item = { 
        tokenID : i.tokenId,
        tokenURI :  await nftMarket.tokenURI(i.tokenId).toString(),
        owner : await nftMarket.ownerOf(i.tokenId),
        seller : i.seller, 
        price : i.price.toString()
      }
      return item
    }));
    console.log(items);
  });

  //scenario of transfering some nft 
  it('NFTs transfered between people', () => {
    console.log("Before or the starting positions")
    let items = await nftMarket.fetchMarket();
    items = await Promise.all(items.map(async(i) => {
      let item = { 
        tokenID : i.tokenId,
        tokenURI :  await nftMarket.tokenURI(i.tokenId).toString(),
        owner : await nftMarket.ownerOf(i.tokenId),
        seller : i.seller, 
        price : i.price.toString()
      }
      return item
    }));
    console.log(items);
  });

  //now transfering some NFTs 
  nftMarket.
  



});
