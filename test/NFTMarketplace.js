// test 1 done
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
    let price = ethers.utils.parseUnits("1", "ether");
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
      .connect(customer1)
      .createToken("https://www.mytokenlocation2.com", price, {
        value: marketFee,
      });
  });

  it("The NFTs in the market should be all the Initial state", async () => {
    let items = await nftMarket.fetchMarket();
    items = await Promise.all(
      items.map(async (i) => {
        const tokenURI = await nftMarket.tokenURI(i.tokenId);
        let item = {
          tokenID: i.tokenId.toString(),
          tokenURI,
          owner: await nftMarket.ownerOf(i.tokenId),
          seller: i.seller,
          price: i.price.toString(),
        };
        return item;
      })
    );
    console.log("All the items in the market currently");
    console.log(items);
  });
  it("Returns items owned by customer1 with address of ", async () => {
    console.log("The items owned by customer1 with address of " + customer1);
    items = await nftMarket.connect(customer1).fetchMyListedNFT();
    items = await Promise.all(
      items.map(async (i) => {
        const tokenURI = await nftMarket.tokenURI(i.tokenId);
        let item = {
          tokenID: i.tokenId.toString(),
          tokenURI,
          owner: await nftMarket.ownerOf(i.tokenId),
          seller: i.seller,
          price: i.price.toString(),
        };
        return item;
      })
    );
    console.log(items);
  });
});

describe("Transfering NFTs", () => {
  let owner, customer1, customer2, customer3, customer4;
  let nftMarket;
  before(async () => {
    const nftMarketContract = await ethers.getContractFactory("NFTMarketplace");
    nftMarket = await nftMarketContract.deploy();
    const marketFee = await nftMarket.marketFee();
    await nftMarket.deployed();
    [owner, customer1, customer2, customer3, customer4] =
      await ethers.getSigners();

    //creating the tokens to use
    //they are all two tokens
    let price = ethers.utils.parseUnits("1", "ether");
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
      .connect(customer1)
      .createToken("https://www.mytokenlocation2.com", price, {
        value: marketFee,
      });
  });

  it("should transfer NFTs from customer1 to customer 4", async () => {
    let price = ethers.utils.parseUnits("1", "ether");
    await nftMarket.connect(customer4).marketItemSold(1, { value: price });
    console.log("Checking ownership of customer 4");
    let items = await nftMarket.connect(customer4).fetchMyNFT();
    items = await Promise.all(
      items.map(async (i) => {
        const tokenURI = await nftMarket.tokenURI(i.tokenId);
        let item = {
          tokenID: i.tokenId.toString(),
          tokenURI,
          owner: await nftMarket.ownerOf(i.tokenId),
          seller: i.seller,
          price: i.price.toString(),
        };
        return item;
      })
    );
    console.log(items);
  });

  it("Should have one less nft on the market", async () => {
    let items = await nftMarket.fetchMarket();
    items = await Promise.all(
      items.map(async (i) => {
        const tokenURI = await nftMarket.tokenURI(i.tokenId);
        let item = {
          tokenID: i.tokenId.toString(),
          tokenURI,
          owner: await nftMarket.ownerOf(i.tokenId),
          seller: i.seller,
          price: i.price.toString(),
        };
        return item;
      })
    );
    console.log(items);
  });
  it("should resells token from customer 4 with a price of 3 ethers", async () => {
    let price = ethers.utils.parseUnits("3", "ether");
    const marketFee = await nftMarket.marketFee();
    await nftMarket
      .connect(customer4)
      .resellingToken(1, price, { value: marketFee });
    console.log("Should output nothing");
    let items = await nftMarket.connect(customer4).fetchMyNFT();
    items = await Promise.all(
      items.map(async (i) => {
        const tokenURI = await nftMarket.tokenURI(i.tokenId);
        let item = {
          tokenID: i.tokenId.toString(),
          tokenURI,
          owner: await nftMarket.ownerOf(i.tokenId),
          seller: i.seller,
          price: i.price.toString(),
        };
        return item;
      })
    );
    console.log(items);
  
    console.log("Should output that one NFT on market");
    items = await nftMarket.connect(customer4).fetchMyListedNFT();
    items = await Promise.all(
      items.map(async (i) => {
        const tokenURI = await nftMarket.tokenURI(i.tokenId);
        let item = {
          tokenID: i.tokenId.toString(),
          tokenURI,
          owner: await nftMarket.ownerOf(i.tokenId),
          seller: i.seller,
          price: i.price.toString(),
        };
        return item;
      })
    );
    console.log(items);
  
  
    console.log("All of the market now")
    items = await nftMarket.fetchMarket();
    items = await Promise.all(
      items.map(async (i) => {
        const tokenURI = await nftMarket.tokenURI(i.tokenId);
        let item = {
          tokenID: i.tokenId.toString(),
          tokenURI,
          owner: await nftMarket.ownerOf(i.tokenId),
          seller: i.seller,
          price: i.price.toString(),
        };
        return item;
      })
    );
    console.log(items);
  });
  
});

