const { task } = require('hardhat/config');

task('deploy', 'Deploy contract').setAction(async ({}, { ethers }) => {
  const propHouseFactory = await ethers.getContractFactory('PropHouse');

  const propHouse = await propHouseFactory.deploy({ gasLimit: 3000000 });

  await propHouse.deployed();

  console.log('Contract deployed to: ', propHouse.address);
});
