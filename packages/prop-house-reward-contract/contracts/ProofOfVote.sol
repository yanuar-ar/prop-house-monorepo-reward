//SPDX-License-Identifier: MIT

/// @title The Prop House's Proof of Win main contract

pragma solidity ^0.8.15;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';

contract ProofOfVote is ERC1155, EIP712, Ownable, ERC1155Burnable, ERC1155Supply {
    using ECDSA for bytes32;

    error FunctionNotSupported();

    // signer for EIP-712
    address public signer;

    //base token URI
    mapping(uint256 => string) public baseTokenURI;

    // has minted
    mapping(uint256 => mapping(address => uint256)) public hasMinted;

    // IPFS content hash of contract-level metadata
    string private contractURIHash;

    constructor() ERC1155('') EIP712('PROPHOUSE', '1') {
        signer = msg.sender;
    }

    /// @notice minting logic
    /// @param id auction id
    /// @param tokenId token Id
    /// @param voter voter address
    /// @param signature EIP-712 signature
    function mint(
        uint256 id,
        uint256 tokenId,
        address voter,
        bytes calldata signature
    ) public {
        // validate signature
        require(signer == _verify(id, tokenId, voter, signature), 'Invalid signature');

        // check address
        require(voter == msg.sender, 'Wrong voter');

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
        return bytes(baseTokenURI[tokenId]).length > 0 ? string(abi.encodePacked(baseTokenURI[tokenId])) : '';
    }

    /// @notice The IPFS URI of contract-level metadata.
    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked(contractURIHash));
    }

    //*********************************************************************//
    // ------------------------ Update Settings -------------------------- //
    //*********************************************************************//

    // token URI
    function setBaseURI(uint256 tokenId, string calldata _baseTokenURI) external onlyOwner {
        baseTokenURI[tokenId] = _baseTokenURI;
    }

    /// @notice Set EIP-712 signer address
    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    /// @notice Set the contract URI
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

    //verify EIP-712 signature
    function _verify(
        uint256 id,
        uint256 tokenId,
        address voter,
        bytes calldata signature
    ) internal view returns (address) {
        bytes32 TYPEHASH = keccak256('Minter(uint256 id,uint256 tokenId,address voter)');
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(TYPEHASH, id, tokenId, voter)));
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
