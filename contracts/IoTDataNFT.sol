// SPDX-License-Identifier: MIT

// Compiler version
pragma solidity ^0.8.0;

// Imported Libraries
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract IoTDataNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping of whitelist addresses
    mapping(address => bool) public whitelistAddress;
    event newNFTminted(address sender, uint256 tokenId);

    constructor() ERC721("IoTData", "Data") {
        console.log("IoT Data factory contract has been deployed!");
    }

    // Adds addresses of vendors to whitelist
    function addToWhitelist(address addy) public onlyOwner {
        whitelistAddress[addy] = true;
    }

    // Removes a vendor from whitelist
    function removeFromWhitelist(address addy) public onlyOwner {
        delete whitelistAddress[addy];
    }

    // Mints NFT that represents data
    function mintdataNFT(string memory nfthash) public {
        // If caller isn't whitelisted reverts the transaction
        if (whitelistAddress[msg.sender] != true)
            revert("You are not allowed to mint");

        uint256 newItemId = _tokenIds.current();

        string memory finalTokenUri = nfthash;

        // Sends NFT to caller
        _safeMint(msg.sender, newItemId);

        // Stores the data in the NFT
        _setTokenURI(newItemId, finalTokenUri);

        _tokenIds.increment();

        emit newNFTminted(msg.sender, newItemId);
    }

    // Returns the total amount of NFT's minted
    function totalNFTs() public view returns (uint256) {
        return _tokenIds.current();
    }
}
