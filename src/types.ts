export interface Transaction {
  id: string;
  txid: string;
  time: number;
  fee: number; // satoshis
  feeRate: number; // sat/vB
  size: number; // vB
  value: number; // Satoshis or NYS base unit (10^8)
  inputs: { address: string; value: number }[];
  outputs: { address: string; value: number }[];
  status: 'pending' | 'mined';
  blockHeight?: number;
  message?: string; // OP_RETURN message or Noyeschain memo
  color?: string; // hex color code mapped to fee rate
}

export interface Block {
  height: number;
  hash: string;
  time: number;
  txCount: number;
  size: number; // vB (max 1,000,000 for standard, or customized for Noyeschain)
  weight: number; // vB * 4
  medianFee: number;
  feeRange: [number, number]; // min fee rate, max fee rate in this block
  status: 'pending' | 'mined';
  transactions: Transaction[];
  coinbaseMessage?: string;
  reward?: number; // total reward (subsidy + fees)
}

export interface ChainStats {
  height: number;
  unconfirmedCount: number;
  mempoolSize: number; // total vB in mempool
  averageFeeRate: number;
  hashRate: string; // e.g., "710 EH/s" or "4.2 GH/s"
  difficulty: string;
  blockTime: string; // "10 min" or "30 sec"
  nativeAsset: string; // "BTC" or "NYS"
}

export type NetworkType = 'bitcoin' | 'noyeschain';
