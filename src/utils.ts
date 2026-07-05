import { Transaction, Block, ChainStats } from './types';

// Color map for fee rates
export function getFeeColor(feeRate: number): string {
  if (feeRate <= 2) return '#22c55e';      // Green (low fee, 1-2 sat/vB)
  if (feeRate <= 8) return '#10b981';      // Teal (2-8)
  if (feeRate <= 15) return '#3b82f6';     // Blue (8-15)
  if (feeRate <= 30) return '#eab308';     // Yellow (15-30)
  if (feeRate <= 60) return '#f97316';     // Orange (30-60)
  if (feeRate <= 120) return '#ef4444';    // Red (60-120)
  if (feeRate <= 250) return '#ec4899';    // Pink (120-250)
  return '#a855f7';                        // Purple (250+)
}

export function formatSats(sats: number, asset: 'BTC' | 'NYS'): string {
  const coins = sats / 100000000;
  return coins >= 0.001 
    ? `${coins.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })} ${asset}`
    : `${sats.toLocaleString('en-US')} sats`;
}

export function formatHashrate(val: number, isNoyes = false): string {
  if (isNoyes) {
    if (val >= 1e9) return `${(val / 1e9).toFixed(2)} GH/s`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(2)} MH/s`;
    return `${(val / 1e3).toFixed(2)} KH/s`;
  } else {
    // Bitcoin values in EH/s
    return `${(val / 1e18).toFixed(2)} EH/s`;
  }
}

// Generate realistic BTC address
export function generateBitcoinAddress(): string {
  const chars = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  let hrp = 'bc1q'; // segwit
  if (Math.random() > 0.7) hrp = '3'; // legacy/p2sh
  if (Math.random() > 0.9) hrp = '1'; // legacy/p2pkh
  
  let rest = '';
  const len = hrp.startsWith('bc1') ? 38 : 33;
  for (let i = 0; i < len; i++) {
    rest += chars[Math.floor(Math.random() * chars.length)];
  }
  return hrp + rest;
}

// Generate Noyeschain address
export function generateNoyeschainAddress(): string {
  const chars = 'abcdefghijkmnopqrstuvwxyz123456789';
  let rest = '';
  for (let i = 0; i < 35; i++) {
    rest += chars[Math.floor(Math.random() * chars.length)];
  }
  return 'nys1q' + rest;
}

// Generate random hex string for transaction hashes
export function generateHash(len = 64): string {
  const hex = '0123456789abcdef';
  let res = '';
  for (let i = 0; i < len; i++) {
    res += hex[Math.floor(Math.random() * 16)];
  }
  return res;
}

const NOYESCHAIN_MEMOS = [
  "Noyeschain Mainnet launch celebration!",
  "Dylan Noyes pixel art NFT transfer",
  "Pixel perfect liquidity provision",
  "NYS smart contract deployment",
  "Mempool visualizer transaction test",
  "Fueling the Noyeschain dApps",
  "Gas fee payment for Noyeschain VM",
  "Secure p2p payment on NYS",
  "NoyesCoin staking reward claim",
  "NYS Genesis block milestone transfer"
];

// Helper to generate a single simulated transaction
export function createMockTransaction(
  isNoyes: boolean,
  customFeeRate?: number,
  customMessage?: string,
  customValue?: number
): Transaction {
  const txid = generateHash(64);
  const time = Math.floor(Date.now() / 1000);
  
  // Custom fee rate or random distribution
  const feeRate = customFeeRate !== undefined 
    ? customFeeRate 
    : Math.random() > 0.8
      ? Math.floor(Math.random() * 200) + 40 // high fees
      : Math.random() > 0.4
        ? Math.floor(Math.random() * 35) + 6  // med fees
        : Math.floor(Math.random() * 5) + 1;  // low fees

  const size = Math.floor(Math.random() * 400) + 140; // size in vB
  const fee = Math.floor(feeRate * size);
  
  const value = customValue !== undefined 
    ? customValue 
    : Math.floor(Math.random() * 500000000) + 10000; // 0.0001 to 5.0 coins

  const numInputs = Math.floor(Math.random() * 3) + 1;
  const numOutputs = Math.floor(Math.random() * 2) + 1;
  
  const inputs = Array.from({ length: numInputs }).map(() => ({
    address: isNoyes ? generateNoyeschainAddress() : generateBitcoinAddress(),
    value: Math.floor((value + fee) / numInputs)
  }));
  
  const outputs = Array.from({ length: numOutputs }).map((_, idx) => ({
    address: isNoyes ? generateNoyeschainAddress() : generateBitcoinAddress(),
    value: idx === 0 ? value : Math.floor(Math.random() * 5000000)
  }));

  const message = isNoyes
    ? customMessage || (Math.random() > 0.6 ? NOYESCHAIN_MEMOS[Math.floor(Math.random() * NOYESCHAIN_MEMOS.length)] : undefined)
    : Math.random() > 0.95 ? "OP_RETURN: " + generateHash(16) : undefined;

  return {
    id: txid,
    txid,
    time,
    fee,
    feeRate,
    size,
    value,
    inputs,
    outputs,
    status: 'pending',
    message,
    color: getFeeColor(feeRate)
  };
}

// Generate an entire pending block from transaction array
export function assembleBlock(
  height: number,
  transactions: Transaction[],
  status: 'pending' | 'mined' = 'pending',
  isNoyes = false
): Block {
  // Sort transactions by fee rate desc
  const sortedTx = [...transactions].sort((a, b) => b.feeRate - a.feeRate);
  
  let totalSize = 0;
  let totalFee = 0;
  const blockTx: Transaction[] = [];

  const maxBlockSize = isNoyes ? 1500000 : 1000000; // Noyeschain has larger 1.5MB blocks!

  for (const tx of sortedTx) {
    if (totalSize + tx.size <= maxBlockSize) {
      totalSize += tx.size;
      totalFee += tx.fee;
      blockTx.push({
        ...tx,
        status,
        blockHeight: height
      });
    } else if (status === 'mined') {
      // For mined blocks, we strictly limit capacity.
      // For pending mempool forecasts, we can let other blocks hold the remainder.
      break;
    }
  }

  const medianFee = blockTx.length > 0 
    ? blockTx[Math.floor(blockTx.length / 2)].feeRate 
    : 1;

  const minFee = blockTx.length > 0 ? blockTx[blockTx.length - 1].feeRate : 1;
  const maxFee = blockTx.length > 0 ? blockTx[0].feeRate : 1;

  return {
    height,
    hash: '00000000' + generateHash(56),
    time: Math.floor(Date.now() / 1000),
    txCount: blockTx.length,
    size: totalSize,
    weight: totalSize * 4,
    medianFee,
    feeRange: [minFee, maxFee],
    status,
    transactions: blockTx,
    coinbaseMessage: isNoyes ? "Mined by Dylan Noyes Pixel Pool 🚀" : "Mined by AntPool",
    reward: (isNoyes ? 50 * 100000000 : 3.125 * 100000000) + totalFee
  };
}
