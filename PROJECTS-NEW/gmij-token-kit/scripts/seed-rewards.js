const { ethers } = require("hardhat");

function toWei(n) {
  return ethers.parseUnits(n.toString(), 18);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Contract addresses (update these with your deployed addresses)
  const tokenAddress = "0x6D2067cA89F594B6838B793f19250dCcF81bc0d4";
  const vaultAddress = "0x4085b7f53F49Cc3ebeE5035D0d4072988AC9aDe5";

  // Get contract instances
  const token = await ethers.getContractAt("GMIJToken", tokenAddress);
  const vault = await ethers.getContractAt("StakingVault", vaultAddress);

  // Amount to transfer and seed as rewards (adjust as needed)
  const rewardAmount = toWei(10000); // 10,000 GMIJ tokens

  console.log("Current token balance:", ethers.formatUnits(await token.balanceOf(deployer.address), 18), "GMIJ");

  // Step 1: Transfer GMIJ tokens to the staking vault
  console.log("\n1. Transferring", ethers.formatUnits(rewardAmount, 18), "GMIJ to staking vault...");
  const transferTx = await token.transfer(vaultAddress, rewardAmount);
  await transferTx.wait();
  console.log("Transfer completed. Tx hash:", transferTx.hash);

  // Step 2: Notify the vault about the reward amount
  console.log("\n2. Notifying vault of reward amount...");
  try {
    const notifyTx = await vault.notifyRewardAmount(rewardAmount);
    await notifyTx.wait();
    console.log("Reward notification completed. Tx hash:", notifyTx.hash);
  } catch (error) {
    console.error("Error notifying reward amount:", error.message);
    console.log("Let's try to check the vault state and call manually...");

    // Check if we're the owner
    const owner = await vault.owner();
    console.log("Vault owner:", owner);
    console.log("Our address:", deployer.address);

    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.error("ERROR: You are not the owner of the vault!");
      return;
    }

    // Try with explicit gas settings
    console.log("Retrying with explicit gas settings...");
    const notifyTx = await vault.notifyRewardAmount(rewardAmount, {
      gasLimit: 200000
    });
    await notifyTx.wait();
    console.log("Reward notification completed. Tx hash:", notifyTx.hash);
  }

  // Check vault balance
  const vaultBalance = await token.balanceOf(vaultAddress);
  console.log("\nVault GMIJ balance:", ethers.formatUnits(vaultBalance, 18), "GMIJ");
  
  // Check reward rate
  const rewardRate = await vault.rewardRate();
  const rewardsDuration = await vault.rewardsDuration();
  console.log("Reward rate:", ethers.formatUnits(rewardRate, 18), "GMIJ per second");
  console.log("Rewards duration:", rewardsDuration.toString(), "seconds (", rewardsDuration.toString() / 86400, "days)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
