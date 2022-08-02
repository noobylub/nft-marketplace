pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    //about the owner
    uint256 listingPrice = 0.005 ether;
    //updating marketplace fee

    address payable owner;

    //the individual items in the market, taking the nft and the buyer and seller
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    //to keep track of the market item
    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price,
        bool sold
    );
    mapping(uint256 => MarketItem) private idToMarketItem;

    function updateMarketplaceFee(uint256 price) public {
        require(
            msg.sender == owner,
            "You need to be the owner of this marketplace"
        );
        listingPrice = price;
    }

    function marketFee() public view returns (uint256) {
        return listingPrice;
    }

    //construtor, setting things at first with the name and symbol
    constructor() ERC721("Lubbil Tokens", "ML") {
        owner = payable(msg.sender);
    }

    //minting the nft, or creating the nft
    //with minting, it would be like mapping between id and that nft with tokenURI and can be queried with .ownerOf(the id of the item you want to query)
    //and also .tokenURI(the id that you want to find you) which gives more information
    function createToken(string memory tokenURI, uint256 price)
        public
        payable
        returns (uint256)
    {
        //basically starts with one and end with the actual number of tokens in tokenID
        _tokenIds.increment();
        uint256 newTokenID = _tokenIds.current();
        //mint with owner first then the item itself
        //then setting the ID of it with that specific URI
        _mint(msg.sender, newTokenID);
        _setTokenURI(newTokenID, tokenURI);
        puttingMarket(_tokenIds.current(), price);
        return newTokenID;
    }

    //putting token id into the market
    function puttingMarket(uint256 tokenId, uint256 price) private {
        require(price > 0, "price must be greater than 0");
        //collecting the fund
        require(msg.value >= listingPrice, "Listing price funds needed");
        //putting into market means transfering ownership to market
        _transfer(msg.sender, address(this), tokenId);

        //creating the market and actually putting it in the market
        MarketItem memory newItem = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );
        idToMarketItem[tokenId] = newItem;
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    //creates a sale for market item and transfer the funds and nfts to the other person
    function marketItemSold(uint256 _tokenID) public payable {
        MarketItem memory itemSold = idToMarketItem[_tokenID];
        address seller = itemSold.seller;
        //putting the money into the smart contract
        require(
            msg.value >= itemSold.price,
            "Item not sold, requires higher price"
        );
        itemSold.owner = payable(msg.sender);
        //changing to none because it is not in the market
        itemSold.seller = payable(address(0));

        itemSold.sold = true;
        idToMarketItem[_tokenID] = itemSold;
        //transfering ownership from the market which technically owns it right now
        _transfer(address(this), msg.sender, _tokenID);
        _itemsSold.increment();
        //so the user put money to the smart contract already
        payable(seller).transfer(msg.value);
        payable(owner).transfer(listingPrice);
    }

    //putting it in the market again
    function resellingToken(uint256 tokenID, uint256 _price) public payable {
        //edit the content first
        MarketItem memory itemMarket = idToMarketItem[tokenID];
        require(itemMarket.sold == true, "Item already in the market");
        require(
            itemMarket.owner == msg.sender,
            "You must be the owner of the NFT"
        );
        require(msg.value >= listingPrice, "You must submit listing price fee");
        itemMarket.sold = false;
        itemMarket.seller = payable(msg.sender);
        itemMarket.price = _price;
        //transfer ownership to the contract or the market itself
        itemMarket.owner = payable(address(this));
        //keeping track of number of items in the market
        _itemsSold.decrement();
        _transfer(itemMarket.owner, payable(address(this)), tokenID);
        idToMarketItem[tokenID] = itemMarket;
    }

    // this function is different from the tutorial
    function fetchMarket() public view returns (MarketItem[] memory) {
        uint256 allItems = _tokenIds.current();
        uint256 unsoldItems = _tokenIds.current() - _itemsSold.current();

        MarketItem[] memory marketItems = new MarketItem[](unsoldItems);
        //this way works because there is still something at the very end,
        //and starts with 1, so the +=1 works.
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= allItems; i++) {
            if (idToMarketItem[i].owner == address(this)) {
                MarketItem storage unsoldItem = idToMarketItem[i];
                marketItems[currentIndex] = unsoldItem;
                currentIndex++;
            }
        }
        return marketItems;
    }

    //fetches all nfts listed and unlisted
    function fetchMyNFT() public view returns (MarketItem[] memory, uint256) {
        //keep track of how many items I have
        uint256 ownedItemCount = 0;
        uint256 ownedIndex = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                ownedItemCount++;
            }
        }

        MarketItem[] memory ownedNFTs = new MarketItem[](ownedItemCount);
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                MarketItem storage ownedItem = idToMarketItem[i];
                ownedNFTs[ownedIndex] = ownedItem;
                ownedIndex++;
            }
        }
        return (ownedNFTs, ownedItemCount);
    }

    function fetchMyListedNFT() public view returns (MarketItem[] memory) {
        uint256 ownedTotal = 0;
        uint256 ownedID = 0;
        uint256 totalMarketItem = _tokenIds.current();

        for (uint256 i = 1; i <= totalMarketItem; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                ownedTotal++;
            }
        }

        MarketItem[] memory listedOwnedNFT = new MarketItem[](ownedTotal);
        for (uint256 i = 1; i < totalMarketItem; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                MarketItem storage itemListed = idToMarketItem[i];
                listedOwnedNFT[ownedID] = itemListed;
                ownedID++;
            }
        }
        return listedOwnedNFT; 
    }
}
