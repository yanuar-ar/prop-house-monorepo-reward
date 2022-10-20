//SPDX-License-Identifier: MIT

/// @title The Prop House Proof of Winner main contract

pragma solidity ^0.8.15;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';

contract PropHouse is ERC1155, EIP712, Ownable, ERC1155Supply {
    using ECDSA for bytes32;

    error FunctionNotSupported();

    // signer for EIP-712
    address public signer;

    //base token URI
    string public baseTokenURI;

    // has minted
    mapping(uint256 => mapping(address => uint256)) public hasMinted;

    // IPFS content hash of contract-level metadata
    string private contractURIHash;

    constructor() ERC1155('') EIP712('PROPHOUSE', '1') {
        signer = msg.sender;
    }

    /// @notice minting logic
    /// @param id nounsId
    /// @param tokenId block number for seeds
    function mint(
        uint256 id,
        uint256 tokenId,
        address winner,
        bytes calldata signature
    ) public {
        // validate signature
        require(signer == _verify(id, tokenId, winner, signature), 'Invalid signature');

        // check address
        require(winner == msg.sender, 'Wrong winner');

        // check has minted
        require(hasMinted[id][msg.sender] == 0, 'Has minted');

        hasMinted[id][msg.sender] += 1;

        _mint(msg.sender, tokenId, 1, '');
    }

    //*********************************************************************//
    // ------------------------- URI functions --------------------------- //
    //*********************************************************************//

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev See {IERC721Metadata-tokenURI}
    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        require(exists(tokenId), 'Token does not exists !');
        return bytes(baseTokenURI).length > 0 ? string(abi.encodePacked(baseTokenURI, Strings.toString(tokenId))) : '';
    }

    /// @notice The IPFS URI of contract-level metadata.
    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked(contractURIHash));
    }

    //*********************************************************************//
    // ------------------------ Update Settings -------------------------- //
    //*********************************************************************//

    // token URI
    function setBaseURI(string calldata _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    /// @notice Set signer address
    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    /// @notice Set the _contractURIHash.
    function setContractURIHash(string memory _contractURIHash) external onlyOwner {
        contractURIHash = _contractURIHash;
    }

    //*********************************************************************//
    // ----------------------- Internal Funtions ------------------------- //
    //*********************************************************************//

    /// @dev The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _verify(
        uint256 id,
        uint256 tokenId,
        address winner,
        bytes calldata signature
    ) internal view returns (address) {
        bytes32 TYPEHASH = keccak256('Minter(uint256 id,uint256 tokenId,address winner)');
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(TYPEHASH, id, tokenId, winner)));
        return ECDSA.recover(digest, signature);
    }

    //*********************************************************************//
    // ------------------------- SBT Functions -------------------------- //
    //*********************************************************************//
    function setApprovalForAll(address, bool) public pure override {
        revert FunctionNotSupported();
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure override {
        revert FunctionNotSupported();
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure override {
        revert FunctionNotSupported();
    }
}
