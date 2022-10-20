const { task } = require('hardhat/config');

task('deploy', 'Deploy contract').setAction(async ({}, { ethers }) => {
  const proofOfWinFactory = await ethers.getContractFactory('ProofOfWin');

  const proofOfWin = await proofOfWinFactory.deploy({ gasLimit: 3000000 });

  await proofOfWin.deployed();

  console.log('Contract deployed to: ', proofOfWin.address);
});
