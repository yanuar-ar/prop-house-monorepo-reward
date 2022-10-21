const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Prop of Vote Testing', async () => {
  let proofOfVote;
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
      { name: 'voter', type: 'address' },
    ],
  };

  before(async () => {
    [owner, nonOwner] = await ethers.getSigners();

    const proofOfVoteFactory = await ethers.getContractFactory('ProofOfVote');
    proofOfVote = await proofOfVoteFactory.deploy();

    domain.verifyingContract = proofOfVote.address;
  });

  describe('Deployment', async () => {
    it('should deployed', async function () {
      expect(proofOfVote.address).to.not.equal('');
    });
  });

  describe('Testing ERC1155 functionality', async () => {
    it('should set contract URI', async () => {
      await proofOfVote.setContractURIHash('ipfs://qm6yUiaiak');

      expect(await proofOfVote.contractURI()).to.eq('ipfs://qm6yUiaiak');
    });

    it('should set token URI', async () => {
      await proofOfVote.setBaseURI(ethers.BigNumber.from('1'), 'ipfs://qm6yUiaiak/');

      expect(await proofOfVote.baseTokenURI(ethers.BigNumber.from('1'))).to.eq(
        'ipfs://qm6yUiaiak/',
      );
    });
  });

  describe('Testing Mint function', async () => {
    it('Mint: should revert Invalid Signature', async () => {
      const signature = await nonOwner._signTypedData(domain, types, {
        id: id,
        tokenId: tokenId,
        voter: nonOwner.address,
      });

      await expect(proofOfVote.mint(id, tokenId, nonOwner.address, signature)).to.be.revertedWith(
        'Invalid signature',
      );
    });

    it('Mint: should revert Wrong voter', async () => {
      const signature = await owner._signTypedData(domain, types, {
        id: id,
        tokenId: tokenId,
        voter: nonOwner.address,
      });

      await expect(proofOfVote.mint(id, tokenId, nonOwner.address, signature)).to.be.revertedWith(
        'Wrong voter',
      );
    });

    it('Mint: it should mint', async () => {
      const signature = await owner._signTypedData(domain, types, {
        id: id,
        tokenId: tokenId,
        voter: owner.address,
      });

      await expect(proofOfVote.mint(id, tokenId, owner.address, signature)).not.to.be.reverted;
      expect(await proofOfVote.balanceOf(owner.address, 1)).to.eq(ethers.BigNumber.from('1'));
    });

    it('Mint: should revert Has minted', async () => {
      const signature = await owner._signTypedData(domain, types, {
        id: id,
        tokenId: tokenId,
        voter: owner.address,
      });

      await expect(proofOfVote.mint(id, tokenId, owner.address, signature)).to.be.revertedWith(
        'Has minted',
      );
    });
  });

  describe('Testing Signer', async () => {
    it('should signer = msg.sender', async () => {
      expect(await proofOfVote.signer()).to.eq(owner.address);
    });

    it('should set signer', async () => {
      await proofOfVote.setSigner(nonOwner.address);

      expect(await proofOfVote.signer()).to.eq(nonOwner.address);
    });
  });
});
