const { task } = require('hardhat/config');

task('deploypov', 'Deploy contract').setAction(async ({}, { ethers }) => {
  const proofOfVoteFactory = await ethers.getContractFactory('ProofOfVote');

  const proofOfVote = await proofOfVoteFactory.deploy({ gasLimit: 3000000 });

  await proofOfVote.deployed();

  console.log('Contract deployed to: ', proofOfVote.address);
});
