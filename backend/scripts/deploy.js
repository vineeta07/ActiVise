const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CertificateRegistry with:", deployer.address);

  const factory = await ethers.getContractFactory("CertificateRegistry");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("CertificateRegistry deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
