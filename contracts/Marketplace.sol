// SPDX-License-Identifier: MIT

// Compiler version
pragma solidity ^0.8.0;

// Imported Libraries
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Marketplace is IERC721Receiver, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private amount_Of_Marketplace_Nfts;

    // Marketplace order nonce initialized
    uint256 orderNonce = 1;

    // Events for different occurrences that take place in the marketplace
    event newOrder(Order order);
    event itemSold(address indexed purchaser, Order order);
    event orderCanceled(Order order);

    // Struct type containing marketplace order information
    struct Order {
        address possessor;
        uint256 price;
        ERC721 nftContract;
        uint256 tokenId;
        uint256 orderingid;
    }

    // Mapping of marketplace order information
    mapping(uint256 => Order) public orders;

    // Function to receive ERC721 tokens
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // Sells the NFT data on the marketplace
    function createOrder(
        uint256 price,
        ERC721 nftContract,
        uint256 tokenId
    ) public returns (uint256) {
        // If caller doesn't own the data trying to be sold, transaction is reverted
        if (msg.sender != nftContract.ownerOf(tokenId))
            revert("ERC721: You don't own this Data");

        // Order information is saved
        Order memory order = Order({
            possessor: msg.sender,
            price: price,
            nftContract: nftContract,
            tokenId: tokenId,
            orderingid: orderNonce
        });

        console.log("\n--------------------");
        console.log(order.possessor);
        console.log(order.price);
        console.log(order.nftContract.name());
        console.log(order.tokenId);
        console.log("--------------------\n");

        // Order information is stored inside the map
        orders[orderNonce] = order;

        emit newOrder(order);

        // NFT data is transfered to the marketplace address
        order.nftContract.safeTransferFrom(
            msg.sender,
            address(this),
            order.tokenId
        );
        amount_Of_Marketplace_Nfts.increment();
        return orderNonce++;
    }

    // Purchases NFT data
    function purchase(uint256 orderId) public payable {
        // Finds the order information for the NFT data being sought to buy
        Order memory order = orders[orderId];

        // Reverts transaction is the user doesn't have enough ETH to pay for the data or if the data order doesn't exist
        if ((order.price != msg.value))
            revert("Data cost more than amount you want to buy!");
        if (order.possessor == address(0))
            revert("Can't buy data as order doesn't exist");

        // Transfers the ETH from the NFT data sale to the seller
        TransferHelper.safeTransferETH(order.possessor, order.price);

        // Transfers the NFT data to the buyer
        order.nftContract.safeTransferFrom(
            address(this),
            msg.sender,
            order.tokenId
        );
        amount_Of_Marketplace_Nfts.decrement();
        emit itemSold(msg.sender, order);
        // Removes order information from the mapping
        delete orders[orderId];
    }

    // Cancels the NFT data from being sold on the marketplace
    function cancelOrder(uint256 orderId) public {
        Order memory order = orders[orderId];

        if ((order.possessor != msg.sender))
            revert("ERC721: You don't own this Data");
        delete orders[orderId];

        // Sends NFT data back to the seller
        order.nftContract.safeTransferFrom(
            address(this),
            msg.sender,
            order.tokenId
        );
        amount_Of_Marketplace_Nfts.decrement();
        emit orderCanceled(order);
    }

    // Returns the NFT data being sold on the marketplace
    function getMarketPlaceNfts(ERC721 nftAddress)
        public
        view
        returns (Order[] memory)
    {
        uint256 nftAmount = amount_Of_Marketplace_Nfts.current();
        uint256 nft_Amount_Index = 0;
        Order[] memory pieces = new Order[](nftAmount);

        // Loops through the orders and finds the orders related to the NFT data
        for (uint256 i = 0; i < orderNonce; i++) {
            if (orders[i + 1].nftContract == nftAddress) {
                uint256 nonce = i + 1;
                Order storage currentpiece = orders[nonce];
                pieces[nft_Amount_Index] = currentpiece;
                nft_Amount_Index += 1;
            }
        }

        return pieces;
    }

    // Self destructs the marketplace contract
    function destroy(address payable adr) public onlyOwner {
        selfdestruct(adr);
    }
}
