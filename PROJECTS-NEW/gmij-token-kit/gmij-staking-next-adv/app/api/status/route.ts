import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { NETWORKS } from "@/lib/networks";
import { ERC20_ABI, VAULT_ABI } from "@/lib/contracts";

export const revalidate = 15;

export async function GET() {
  try {
    const net = NETWORKS.polygon; // default for now; can accept query later
    const provider = new ethers.JsonRpcProvider(net.rpcUrl, net.chainId);
    const token = new ethers.Contract(net.token, ERC20_ABI, provider);
    const vault = new ethers.Contract(net.vault, VAULT_ABI, provider);

    const [dec, symbol] = await Promise.all([token.decimals(), token.symbol()]);
    const [vaultBal, totalStaked, rewardRate, rewardsDuration, periodFinish] = await Promise.all([
      token.balanceOf(net.vault),
      vault.totalSupply(),
      vault.rewardRate(),
      vault.rewardsDuration(),
      vault.periodFinish(),
    ]);

    const json = {
      network: net.name,
      token: net.token,
      vault: net.vault,
      symbol,
      decimals: Number(dec),
      vaultBalance: ethers.formatUnits(vaultBal, dec),
      totalStaked: ethers.formatUnits(totalStaked, dec),
      rewardRatePerSec: ethers.formatUnits(rewardRate, dec),
      rewardsDurationSec: Number(rewardsDuration),
      periodFinish: Number(periodFinish),
      aprEstimate: aprFromRate(Number(ethers.formatUnits(rewardRate, dec)), Number(ethers.formatUnits(totalStaked, dec))),
      dailyRewards: Number(ethers.formatUnits(rewardRate, dec)) * 86400
    };

    return NextResponse.json(json, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

function aprFromRate(ratePerSec: number, totalStaked: number) {
  if (!totalStaked || totalStaked <= 0) return 0;
  const daily = ratePerSec * 86400;
  const yearly = daily * 365;
  return (yearly / totalStaked) * 100;
}
