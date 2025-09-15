const { ethers } = require("hardhat");

function toWei(n) {
  return ethers.parseUnits(n.toString(), 18);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Parameters
  const initialReceiver = deployer.address; // change to treasury later
  const initialSupply = toWei(100_000_000); // 100m GMIJ

  // Deploy token
  const Token = await ethers.getContractFactory("GMIJToken");
  const token = await Token.deploy(initialReceiver, initialSupply);
  await token.waitForDeployment();
  console.log("GMIJToken:", await token.getAddress());

  // Deploy staking vault
  const Vault = await ethers.getContractFactory("StakingVault");
  const vault = await Vault.deploy(await token.getAddress());
  await vault.waitForDeployment();
  console.log("StakingVault:", await vault.getAddress());

  // Approve and seed initial rewards example (optional small seed)
  // await token.approve(await vault.getAddress(), toWei(1000));
  // await token.transfer(await vault.getAddress(), toWei(1000));
  // await vault.notifyRewardAmount(toWei(1000));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
