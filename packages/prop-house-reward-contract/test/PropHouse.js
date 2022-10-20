const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Prop House Testing', async () => {
  let propHouse;
  let owner;
  let nonOwner;

  let id = 84;
  let tokenId = 1;

  let domain = {
    name: 'PROPHOUSE',
    version: '1',
    chainId: 31337,
    verifyingContract: '',
  };

  let types = {
    Minter: [
      { name: 'id', type: 'uint256' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'winner', type: 'address' },
    ],
  };

  before(async () => {
    [owner, nonOwner] = await ethers.getSigners();

    const propHouseFactory = await ethers.getContractFactory('PropHouse');
    propHouse = await propHouseFactory.deploy();

    domain.verifyingContract = propHouse.address;
  });

  describe('Deployment', async () => {
    it('should deployed', async function () {
      expect(propHouse.address).to.not.equal('');
    });
  });

  describe('Testing ERC1155 functionality', async () => {
    it('should set contract URI', async () => {
      await propHouse.setContractURIHash('ipfs://qm6yUiaiak');

      expect(await propHouse.contractURI()).to.eq('ipfs://qm6yUiaiak');
    });

    it('should set token URI', async () => {
      await propHouse.setBaseURI('ipfs://qm6yUiaiak/');

      expect(await propHouse.baseTokenURI()).to.eq('ipfs://qm6yUiaiak/');
    });
  });

  describe('Testing Mint function', async () => {
    it('Mint: should revert Invalid Signature', async () => {
      const signature = await nonOwner._signTypedData(domain, types, {
        id: id,
        tokenId: tokenId,
        winner: nonOwner.address,
      });

      await expect(propHouse.mint(id, tokenId, nonOwner.address, signature)).to.be.revertedWith(
        'Invalid signature',
      );
    });

    it('Mint: should revert Wrong winner', async () => {
      const signature = await owner._signTypedData(domain, types, {
        id: id,
        tokenId: tokenId,
        winner: nonOwner.address,
      });

      await expect(propHouse.mint(id, tokenId, nonOwner.address, signature)).to.be.revertedWith(
        'Wrong winner',
      );
    });

    it('Mint: it should mint', async () => {
      const signature = await owner._signTypedData(domain, types, {
        id: id,
        tokenId: tokenId,
        winner: owner.address,
      });

      await expect(propHouse.mint(id, tokenId, owner.address, signature)).not.to.be.reverted;
      expect(await propHouse.balanceOf(owner.address, 1)).to.eq(ethers.BigNumber.from('1'));
    });

    it('Mint: should revert Has minted', async () => {
      const signature = await owner._signTypedData(domain, types, {
        id: id,
        tokenId: tokenId,
        winner: owner.address,
      });

      await expect(propHouse.mint(id, tokenId, owner.address, signature)).to.be.revertedWith(
        'Has minted',
      );
    });
  });

  describe('Testing Signer', async () => {
    it('should signer = msg.sender', async () => {
      expect(await propHouse.signer()).to.eq(owner.address);
    });

    it('should set signer', async () => {
      await propHouse.setSigner(nonOwner.address);

      expect(await propHouse.signer()).to.eq(nonOwner.address);
    });
  });
});
