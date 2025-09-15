"use client";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS, type NetKey } from "@/lib/networks";
import { ERC20_ABI, VAULT_ABI } from "@/lib/contracts";

function fmt(num: number, decimals = 4) {
  if (num === null || num === undefined) return "0";
  const n = Number(num);
  if (!Number.isFinite(n)) return "0";
  if (n === 0) return "0";
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
  return n.toPrecision(Math.min(6, decimals + 2));
}

function useNow(tickMs = 1000) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  return now;
}

function Countdown({ to }: { to: number }) {
  const now = useNow(1000);
  const sec = Math.max(0, (to || 0) - now);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return <span>{d}d {h}h {m}m {s}s</span>;
}

function useAllowlist() {
  const list = (process.env.NEXT_PUBLIC_ALLOWLIST || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
  return (addr?: string | null) => {
    if (!list.length) return true; // allow if no list configured
    if (!addr) return false;
    return list.includes(addr.toLowerCase());
  };
}

function parseErr(e: any) {
  const msg = e?.shortMessage || e?.info?.error?.message || e?.message || String(e);
  return msg.replace(/\(.*\)/, "").trim();
}

export default function StakingDashboard() {
  const [netKey, setNetKey] = useState<NetKey>("polygon");
  const net = NETWORKS[netKey];

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>("");

  const [symbol, setSymbol] = useState("GMIJ");
  const [decimals, setDecimals] = useState(18);

  const [balToken, setBalToken] = useState(0);
  const [balVault, setBalVault] = useState(0);
  const [staked, setStaked] = useState(0);
  const [earned, setEarned] = useState(0);

  const [rewardRate, setRewardRate] = useState(0);
  const [rewardsDuration, setRewardsDuration] = useState(0);
  const [periodFinish, setPeriodFinish] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);

  const [inputStake, setInputStake] = useState<string>("");
  const [inputWithdraw, setInputWithdraw] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const allow = useAllowlist();

  const readProvider = useMemo(() => new ethers.JsonRpcProvider(net.rpcUrl, net.chainId), [net]);
  const tokenRead = useMemo(() => net.token ? new ethers.Contract(net.token, ERC20_ABI, readProvider) : null, [readProvider, net]);
  const vaultRead = useMemo(() => net.vault ? new ethers.Contract(net.vault, VAULT_ABI, readProvider) : null, [readProvider, net]);

  const tokenWrite = useMemo(() => (signer && net.token ? new ethers.Contract(net.token, ERC20_ABI, signer) : null), [signer, net]);
  const vaultWrite = useMemo(() => (signer && net.vault ? new ethers.Contract(net.vault, VAULT_ABI, signer) : null), [signer, net]);

  async function connect() {
    try {
      if (!(window as any).ethereum) throw new Error("No wallet detected");
      const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const nw = await web3Provider.getNetwork();
      if (Number(nw.chainId) !== net.chainId) {
        await (window as any).ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: net.chainHex }] });
      }
      const s = await web3Provider.getSigner();
      const addr = await s.getAddress();
      setProvider(web3Provider);
      setSigner(s);
      setAddress(addr);
      setStatus("Connected");
      setToast("Wallet connected");
      setTimeout(() => setToast(""), 3000);
      refresh(addr);
    } catch (e) {
      setToast(parseErr(e));
      setTimeout(() => setToast(""), 4000);
    }
  }

  function aprFromRate(ratePerSec: number, total: number) {
    if (!total || total <= 0) return 0;
    const daily = ratePerSec * 86400;
    const yearly = daily * 365;
    return (yearly / total) * 100;
  }

  async function refresh(addr?: string) {
    try {
      if (!tokenRead || !vaultRead) return;
      const [sym, dec] = await Promise.all([tokenRead.symbol(), tokenRead.decimals()]);
      setSymbol(sym);
      setDecimals(Number(dec));
      const [rt, dur, fin, ts, vb] = await Promise.all([
        vaultRead.rewardRate(),
        vaultRead.rewardsDuration(),
        vaultRead.periodFinish(),
        vaultRead.totalSupply(),
        tokenRead.balanceOf(net.vault),
      ]);
      const rewardRateNum = Number(ethers.formatUnits(rt, dec));
      const totalStakedNum = Number(ethers.formatUnits(ts, dec));
      setRewardRate(rewardRateNum);
      setRewardsDuration(Number(dur));
      setPeriodFinish(Number(fin));
      setTotalStaked(totalStakedNum);
      setBalVault(Number(ethers.formatUnits(vb, dec)));

      const who = addr || address;
      if (who) {
        const [bt, st, er] = await Promise.all([
          tokenRead.balanceOf(who),
          vaultRead.balanceOf(who),
          vaultRead.earned(who),
        ]);
        setBalToken(Number(ethers.formatUnits(bt, dec)));
        setStaked(Number(ethers.formatUnits(st, dec)));
        setEarned(Number(ethers.formatUnits(er, dec)));
      }
    } catch (e) {
      setToast(parseErr(e));
      setTimeout(() => setToast(""), 4000);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(() => refresh(), 15000);
    return () => clearInterval(id);
  }, [netKey, address]); // eslint-disable-line react-hooks/exhaustive-deps

  async function gated() {
    const ok = allow(address);
    if (!ok) throw new Error("Address not on allowlist");
    // Optional captcha flow. If HCAPTCHA_SITEKEY set, require token from client-side widget and POST to /api/captcha-verify
    return true;
  }

  async function ensureAllowance(amountWei: bigint) {
    if (!tokenWrite || !signer) throw new Error("Wallet not connected");
    const owner = await (signer as any).getAddress();
    const allowance: bigint = await tokenWrite.allowance(owner, net.vault);
    if (allowance >= amountWei) return;
    setStatus("Approving GMIJ");
    const tx = await tokenWrite.approve(net.vault, amountWei);
    await tx.wait();
  }

  async function onStake() {
    try {
      await gated();
      if (!vaultWrite) throw new Error("Connect wallet first");
      const amt = inputStake.trim();
      if (!amt || Number(amt) <= 0) return;
      setLoading(true);
      const amountWei = ethers.parseUnits(amt, decimals);
      await ensureAllowance(amountWei);
      setStatus("Staking");
      const tx = await (vaultWrite as any).stake(amountWei);
      await tx.wait();
      setToast("Staked successfully");
      setInputStake("");
      refresh();
    } catch (e) {
      setToast(parseErr(e));
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 4000);
    }
  }

  async function onWithdraw() {
    try {
      await gated();
      if (!vaultWrite) throw new Error("Connect wallet first");
      const amt = inputWithdraw.trim();
      if (!amt || Number(amt) <= 0) return;
      setLoading(true);
      setStatus("Withdrawing");
      const tx = await (vaultWrite as any).withdraw(ethers.parseUnits(amt, decimals));
      await tx.wait();
      setToast("Withdrawn");
      setInputWithdraw("");
      refresh();
    } catch (e) {
      setToast(parseErr(e));
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 4000);
    }
  }

  async function onClaim() {
    try {
      await gated();
      if (!vaultWrite) throw new Error("Connect wallet first");
      setLoading(true);
      setStatus("Claiming rewards");
      const tx = await (vaultWrite as any).getReward();
      await tx.wait();
      setToast("Rewards claimed");
      refresh();
    } catch (e) {
      setToast(parseErr(e));
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 4000);
    }
  }

  async function onExit() {
    try {
      await gated();
      if (!vaultWrite) throw new Error("Connect wallet first");
      setLoading(true);
      setStatus("Exiting vault");
      const tx = await (vaultWrite as any).exit();
      await tx.wait();
      setToast("Exited vault");
      refresh();
    } catch (e) {
      setToast(parseErr(e));
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 4000);
    }
  }

  const apr = aprFromRate(rewardRate, totalStaked);
  const daily = rewardRate * 86400;

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GMIJ Staking Dashboard</h1>
            <p className="text-sm text-neutral-400">Stake GMIJ and earn continuous rewards.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={netKey}
              onChange={(e) => setNetKey(e.target.value as NetKey)}
              className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            >
              <option value="polygon">Polygon</option>
              <option value="base">Base</option>
              <option value="baseSepolia">Base Sepolia</option>
            </select>
            <button onClick={connect} className="rounded-2xl bg-orange-500 px-4 py-2 font-semibold shadow hover:bg-orange-400">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Card title="Your GMIJ" value={`${fmt(balToken)} ${symbol}`} sub="Wallet balance" />
          <Card title="Your Staked" value={`${fmt(staked)} ${symbol}`} sub="Currently staked" />
          <Card title="Your Earned" value={`${fmt(earned)} ${symbol}`} sub="Unclaimed rewards" />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <Card title="Vault Rewards" value={`${fmt(balVault)} ${symbol}`} sub="Vault balance" />
          <Card title="Total Staked" value={`${fmt(totalStaked)} ${symbol}`} sub="All users" />
          <Card title="Reward Rate" value={`${fmt(rewardRate, 6)} ${symbol}/sec`} sub="Live emission" />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <Card title="APR Estimate" value={`${fmt(apr, 2)} %`} sub="Based on current rate and total staked" />
          <Card title="Daily Rewards" value={`${fmt(daily, 4)} ${symbol}/day`} sub="Total emitted per day" />
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
            <h2 className="text-lg font-semibold">Stake</h2>
            <p className="mt-1 text-sm text-neutral-400">Deposit GMIJ and start earning.</p>
            <div className="mt-4 flex items-center gap-2">
              <input type="number" min="0" step="0.000001" value={inputStake} onChange={(e) => setInputStake(e.target.value)} placeholder="Amount"
                className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800/70 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500" />
              <button onClick={() => setInputStake(String(Math.max(0, balToken)))}
                className="rounded-xl border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">Max</button>
              <button disabled={loading} onClick={onStake}
                className="rounded-xl bg-orange-500 px-5 py-2 font-semibold hover:bg-orange-400 disabled:opacity-60">Stake</button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">Balance: {fmt(balToken)} {symbol}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
            <h2 className="text-lg font-semibold">Withdraw</h2>
            <p className="mt-1 text-sm text-neutral-400">You can withdraw after the cooldown from your last stake.</p>
            <div className="mt-4 flex items-center gap-2">
              <input type="number" min="0" step="0.000001" value={inputWithdraw} onChange={(e) => setInputWithdraw(e.target.value)} placeholder="Amount"
                className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800/70 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500" />
              <button onClick={() => setInputWithdraw(String(Math.max(0, staked)))}
                className="rounded-xl border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">Max</button>
              <button disabled={loading} onClick={onWithdraw}
                className="rounded-xl bg-neutral-200 px-5 py-2 font-semibold text-neutral-900 hover:bg-white disabled:opacity-60">Withdraw</button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">Staked: {fmt(staked)} {symbol}</p>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap items-center gap-3">
          <button disabled={loading} onClick={onClaim}
            className="rounded-xl bg-green-500 px-4 py-2 font-semibold text-neutral-900 hover:bg-green-400 disabled:opacity-60">Claim Rewards</button>
          <button disabled={loading} onClick={onExit}
            className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-400 disabled:opacity-60">Exit (Withdraw all + Claim)</button>
          <p className="text-sm text-neutral-400">Ends in: <Countdown to={periodFinish} /></p>
          <p className="text-sm text-neutral-400">Status: {status}</p>
        </section>

        {toast ? (
          <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-neutral-800 px-4 py-2 text-sm shadow">{toast}</div>
        ) : null}

        <footer className="mt-10 border-t border-neutral-800 pt-6 text-xs text-neutral-500">
          <p>Network: {net.name} | Token {net.token || "N/A"} | Vault {net.vault || "N/A"}</p>
          <p>Public Status API: /api/status</p>
        </footer>
      </div>
    </div>
  );
}

function Card({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
      <p className="text-sm text-neutral-400">{title}</p>
      <h3 className="mt-1 text-2xl font-semibold tracking-tight">{value}</h3>
      {sub ? <p className="mt-1 text-xs text-neutral-500">{sub}</p> : null}
    </div>
  );
}
