const baseAddress = {
  defi: "0xA11CE00000000000000000000000000000000001",
  bridge: "0xB0B0000000000000000000000000000000000002",
  risk: "0xBAD0000000000000000000000000000000000003",
};

export const sampleWallets = [
  {
    id: "defi-power-user",
    address: baseAddress.defi,
    label: "DeFi 活跃地址",
    persona: "DeFi Power User",
    description: "多协议交互、稳定币换仓、流动性操作频繁的健康 DeFi 地址。",
    transactions: [
      tx("0xdefi01", "2026-06-01T09:10:00Z", "in", "0xCEX000000000000000000000000000000000001", "cex", "USDC", 48000, "deposit", false),
      tx("0xdefi02", "2026-06-01T09:40:00Z", "out", "0xAAVE000000000000000000000000000000000001", "defi", "USDC", 24000, "supply", true),
      tx("0xdefi03", "2026-06-02T10:15:00Z", "out", "0xUNISWAP00000000000000000000000000000001", "dex", "USDC", 12000, "swap", true),
      tx("0xdefi04", "2026-06-03T11:20:00Z", "in", "0xUNISWAP00000000000000000000000000000001", "dex", "ETH", 11800, "swap", true),
      tx("0xdefi05", "2026-06-04T12:00:00Z", "out", "0xCURVE00000000000000000000000000000000001", "defi", "USDT", 22000, "addLiquidity", true),
      tx("0xdefi06", "2026-06-05T12:30:00Z", "in", "0xCURVE00000000000000000000000000000000001", "defi", "CRV", 850, "reward", true),
      tx("0xdefi07", "2026-06-07T13:20:00Z", "out", "0xLIDO000000000000000000000000000000000001", "staking", "ETH", 18000, "stake", true),
      tx("0xdefi08", "2026-06-09T14:10:00Z", "in", "0xAAVE000000000000000000000000000000000001", "defi", "USDC", 6200, "withdraw", true),
    ],
  },
  {
    id: "bridge-hopper",
    address: baseAddress.bridge,
    label: "跨链高频地址",
    persona: "Bridge Hopper",
    description: "频繁跨链、资产分散、交互对象多，适合展示桥和多链行为分析。",
    transactions: [
      tx("0xbridge01", "2026-06-10T08:00:00Z", "in", "0xCEX000000000000000000000000000000000002", "cex", "ETH", 30000, "withdraw", false),
      tx("0xbridge02", "2026-06-10T08:12:00Z", "out", "0xSTARGATE0000000000000000000000000000001", "bridge", "USDC", 15000, "bridge", true),
      tx("0xbridge03", "2026-06-10T08:24:00Z", "out", "0xLAYERZERO000000000000000000000000000001", "bridge", "ETH", 4200, "bridge", true),
      tx("0xbridge04", "2026-06-10T08:31:00Z", "in", "0xARBITRUM0000000000000000000000000000001", "bridge", "USDC", 14880, "receiveBridge", true),
      tx("0xbridge05", "2026-06-10T08:44:00Z", "out", "0xSYNC000000000000000000000000000000000001", "bridge", "ETH", 3600, "bridge", true),
      tx("0xbridge06", "2026-06-10T09:02:00Z", "out", "0xDEX0000000000000000000000000000000000001", "dex", "USDC", 5000, "swap", true),
      tx("0xbridge07", "2026-06-11T11:00:00Z", "in", "0xOPTIMISM0000000000000000000000000000001", "bridge", "ETH", 3400, "receiveBridge", true),
    ],
  },
  {
    id: "high-risk-counterparty",
    address: baseAddress.risk,
    label: "高风险交互地址",
    persona: "High Risk Counterparty",
    description: "与 mixer、钓鱼标签地址和 dusting 交易有明显关联的高风险样例。",
    transactions: [
      tx("0xrisk01", "2026-06-12T07:20:00Z", "in", "0xMIXER00000000000000000000000000000000001", "mixer", "ETH", 9000, "receive", true, ["mixer"]),
      tx("0xrisk02", "2026-06-12T07:27:00Z", "out", "0xPHISH00000000000000000000000000000000001", "phishing", "ETH", 1200, "approve", true, ["phishing"]),
      tx("0xrisk03", "2026-06-12T07:29:00Z", "out", "0xPHISH00000000000000000000000000000000001", "phishing", "USDT", 6000, "transferFrom", true, ["phishing"], true),
      tx("0xrisk04", "2026-06-12T07:40:00Z", "in", "0xDUST000000000000000000000000000000000001", "unknown", "SCAM", 0.01, "airdrop", false, ["dusting"]),
      tx("0xrisk05", "2026-06-12T07:43:00Z", "out", "0xMIXER00000000000000000000000000000000001", "mixer", "ETH", 7800, "send", true, ["mixer"]),
      tx("0xrisk06", "2026-06-12T07:46:00Z", "out", "0xUNKNOWN00000000000000000000000000000001", "unknown", "ETH", 300, "transfer", false, [], true),
    ],
  },
];

function tx(hash, timestamp, direction, counterparty, counterpartyType, asset, amountUsd, method, contractInteraction, labels = [], failed = false) {
  return {
    hash,
    timestamp,
    direction,
    counterparty,
    counterpartyType,
    asset,
    amountUsd,
    method,
    contractInteraction,
    labels,
    failed,
  };
}

export function listSampleWallets() {
  return sampleWallets.map(({ id, address, label, persona, description }) => ({
    id,
    address,
    label,
    persona,
    description,
  }));
}

export function getSampleWallet(idOrAddress = "defi-power-user") {
  const key = String(idOrAddress).toLowerCase();
  return (
    sampleWallets.find((wallet) => wallet.id.toLowerCase() === key || wallet.address.toLowerCase() === key) ||
    sampleWallets[0]
  );
}
