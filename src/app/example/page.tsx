/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useSignMessage,
  useWaitForTransactionReceipt,
  useWriteContract,
  useDisconnect,
} from "wagmi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ethers } from "ethers";

const API = "https://gorillaz-backend-43c2e114d9b4.herokuapp.com/api";
// const API = "http://localhost:3001/api";
const COINFLIP_ABI = [
  {
    name: "flipCoin",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "guess",
        type: "bool",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
  {
    type: "event",
    name: "CoinFlipped",
    inputs: [
      {
        name: "player",
        type: "address",
        indexed: true,
      },
      {
        name: "guess",
        type: "bool",
        indexed: false,
      },
      {
        name: "isHeads",
        type: "bool",
        indexed: false,
      },
      {
        name: "blockNumber",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
];

const COINFLIP_ADDRESS = "0x7883eA8C0107b34496aCF00Dd0c3472F509EC595";
const COINFLIP_FEE = "0.0001";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const { connect, connectors, error: connectError } = useConnect();
  const { data: hash, writeContract } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1, // optional, defaults to 1
  });

  const [guess, setGuess] = useState<"heads" | "tails">("heads");

  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const queryClient = useQueryClient();
  const [referralCode, setReferralCode] = useState("");

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("gorillaz_token");
    if (stored) setToken(stored);
  }, []);

  // Reactively refresh data once confirmed
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["myFlips"] });
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["flipCount"] });
      queryClient.invalidateQueries({ queryKey: ["globalStats"] });
    }
  }, [isConfirmed, queryClient]);

  const login = async () => {
    const message = `Sign this message to login: ${address}`;
    const signature = await signMessageAsync({ message });
    const { data } = await axios.post(`${API}/auth/login`, {
      address,
      signature,
    });
    localStorage.setItem("gorillaz_token", data.token);
    setToken(data.token);
    queryClient.invalidateQueries();
  };

  const logout = () => {
    localStorage.removeItem("gorillaz_token");
    setToken(null);
    queryClient.clear();
    disconnect(); // 👈 Disconnect from wallet
  };

  const claimAchievement = async (id: string) => {
    const res = await axios.post(
      `${API}/achievements/claim/${id}`,
      {},
      { headers: authHeaders },
    );
    return res.data;
  };

  const claimMutation = useMutation({
    mutationFn: claimAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: async () =>
      (await axios.get(`${API}/stats/me`, { headers: authHeaders })).data,
    enabled: !!token && isClient,
  });

  const flipsQuery = useQuery({
    queryKey: ["myFlips"],
    queryFn: async () =>
      (
        await axios.get(`${API}/stats/flip-history/me`, {
          headers: authHeaders,
        })
      ).data,
    enabled: !!token && isClient,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => (await axios.get(`${API}/leaderboard`)).data,
    enabled: isClient,
  });

  const questsQuery = useQuery({
    queryKey: ["quests"],
    queryFn: async () =>
      (await axios.get(`${API}/quests/${address}`, { headers: authHeaders }))
        .data,
    enabled: !!token && !!address && isClient,
  });

  const achievementsQuery = useQuery({
    queryKey: ["achievements"],
    queryFn: async () =>
      (await axios.get(`${API}/achievements/me`, { headers: authHeaders }))
        .data,
    enabled: !!token && isClient,
  });

  const referralQuery = useQuery({
    queryKey: ["referral"],
    queryFn: async () =>
      (await axios.get(`${API}/referrals/me`, { headers: authHeaders })).data,
    enabled: !!token && isClient,
  });

  const flipLimitQuery = useQuery({
    queryKey: ["flipCount"],
    queryFn: async () =>
      (await axios.get(`${API}/stats/flip-count/me`, { headers: authHeaders }))
        .data,
    enabled: !!token && isClient,
  });

  const globalStatsQuery = useQuery({
    queryKey: ["globalStats"],
    queryFn: async () =>
      (await axios.get(`${API}/stats/global`, { headers: authHeaders })).data,
    enabled: !!token && isClient,
  });

  const startCoinFlip = async () => {
    const guessBool = guess === "heads";
    writeContract({
      address: COINFLIP_ADDRESS,
      abi: COINFLIP_ABI,
      functionName: "flipCoin",
      args: [guessBool],
      value: ethers.parseEther(COINFLIP_FEE),
    });
  };
  const submitReferral = async () => {
    await axios.post(
      `${API}/referrals`,
      { referralCode },
      { headers: authHeaders },
    );
    alert("Referral registered!");
    setReferralCode("");
    queryClient.invalidateQueries({ queryKey: ["referral"] });
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="max-w-xl p-6 mx-auto">
        <h1 className="mb-4 text-2xl font-bold">🍌 Gorillaz Bananas Tester</h1>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">🍌 Gorillaz Bananas Tester</h1>

      {!isConnected && (
        <div className="mb-4">
          <h2 className="font-semibold">Connect Wallet</h2>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="px-4 py-2 mb-2 mr-2 text-white bg-blue-600 rounded"
            >
              {connector.name}
            </button>
          ))}
          {connectError && (
            <p className="text-red-500">{connectError.message}</p>
          )}
        </div>
      )}

      {!token && isConnected && (
        <button onClick={login} className="px-4 py-2 text-white bg-black">
          Sign & Login
        </button>
      )}

      {token && (
        <button className="text-red-600 underline" onClick={logout}>
          Logout
        </button>
      )}

      {token && statsQuery.data && (
        <div className="p-4 mt-4 rounded shadow ">
          <h2 className="font-semibold">🧍 Your Stats</h2>
          <p>Bananas (🍌 Bananas): {statsQuery.data.xp}</p>
          <p>Total Flips: {statsQuery.data.totalFlips}</p>
          <p>
            Heads: {statsQuery.data.totalHeads} | Tails:{" "}
            {statsQuery.data.totalTails}
          </p>

          <div className="my-2">
            <label className="mr-2">Your Guess:</label>
            <select
              value={guess}
              onChange={(e) => setGuess(e.target.value as "heads" | "tails")}
              className="px-2 py-1 border"
            >
              <option value="heads">Heads</option>
              <option value="tails">Tails</option>
            </select>
          </div>

          <button
            onClick={startCoinFlip}
            className="px-3 py-1 mt-3 text-white bg-green-600 rounded"
          >
            🎲 Flip Coin (${COINFLIP_FEE} ETH)
          </button>
        </div>
      )}

      {token && globalStatsQuery.data && (
        <div className="p-4 mt-4 rounded shadow">
          <h2 className="font-semibold">🌍 Global Stats</h2>
          <p>Your Bananas Rank: #{globalStatsQuery.data.rank}</p>
          <p>Total Users: {globalStatsQuery.data.totalUsers}</p>
          <p>Total Bananas Given: 🍌 {globalStatsQuery.data.totalXpGiven}</p>
        </div>
      )}

      {token && flipLimitQuery.data && (
        <p className="text-sm text-gray-500">
          Daily flips remaining: {flipLimitQuery.data.remaining}/10
        </p>
      )}

      {token && flipsQuery.data && (
        <div className="mt-4">
          <h2 className="font-semibold">🪙 Flip History</h2>
          <ul className="text-sm">
            {flipsQuery.data.map((flip: any) => (
              <li key={flip.id}>
                {flip.result} — {new Date(flip.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {leaderboardQuery.data && (
        <div className="mt-4">
          <h2 className="font-semibold">🏆 Leaderboard</h2>
          <ul className="text-sm">
            {leaderboardQuery.data.map((user: any, i: number) => (
              <li key={user.walletAddress}>
                #{i + 1} — {user.walletAddress} — 🍌 {user.xp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {questsQuery.data && (
        <div className="mt-4">
          <h2 className="font-semibold">🧩 Quests</h2>
          <ul className="text-sm">
            {questsQuery.data.map((q: any) => (
              <li key={q.id}>
                {q.quest.condition} —{" "}
                {q.completed ? "✅ Done" : `⏳ In Progress ${q.progressCount}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {achievementsQuery.data && (
        <div className="mt-4">
          <h2 className="font-semibold">🏅 Achievements</h2>
          <ul className="space-y-2 text-sm">
            {achievementsQuery.data.map((a: any) => (
              <li
                key={a.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                  <p className="text-xs">
                    Progress: {a.progress}/{a.goal}
                  </p>
                </div>

                {a.claimed ? (
                  <span className="text-sm text-green-500">✅ Claimed</span>
                ) : a.progress >= a.goal ? (
                  <button
                    onClick={() => claimMutation.mutate(a.id)}
                    className="px-2 py-1 text-xs text-white bg-yellow-500 rounded"
                  >
                    🎁 Claim {a.xpReward} Bananas
                  </button>
                ) : (
                  <span className="text-sm text-gray-400">⏳ In Progress</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {referralQuery.data && (
        <div className="mt-4">
          <h2 className="font-semibold">👥 Referral</h2>
          <p>Your Code: {referralQuery.data.referralCode}</p>
          <p>Invited: {referralQuery.data.referredUsers.length}</p>
        </div>
      )}

      {token && (
        <div className="mt-4">
          <input
            placeholder="Enter referral code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="p-1 border"
          />
          <button
            onClick={submitReferral}
            className="px-3 py-1 ml-2 text-white bg-blue-600 rounded"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
