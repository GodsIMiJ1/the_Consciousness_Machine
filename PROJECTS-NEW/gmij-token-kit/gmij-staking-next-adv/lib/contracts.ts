export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

export const VAULT_ABI = [
  "function stake(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function exit()",
  "function getReward()",
  "function earned(address account) view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function rewardsDuration() view returns (uint256)",
  "function periodFinish() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
];
