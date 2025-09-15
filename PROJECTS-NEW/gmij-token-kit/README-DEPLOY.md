GMIJ token quickstart

1) Prereqs
   - Node 18 LTS
   - A wallet with Base Sepolia test ETH
   - npm i

2) Configure
   - cp .env.example .env
   - set PRIVATE_KEY and RPC_URL_BASE_SEPOLIA

3) Deploy token and staking vault to Base Sepolia
   - npm run deploy:base-sepolia

4) Verify
   - npm run verify:base-sepolia <GMIJToken_address> "GMIJ" "GMIJ" 18 <initialReceiver> <initialSupplyWei>

Notes
   - StakingVault uses Synthetix style rewards. Fund rewards by calling notifyRewardAmount with GMIJ that you have transferred to the vault first.
   - Unstaking has a 7 day cooldown window. Call exit to claim rewards and withdraw stake after cooldown.
