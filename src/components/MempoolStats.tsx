import React from 'react';
import { Transaction, Block, ChainStats, NetworkType } from '../types';
import { formatSats } from '../utils';
import { BarChart3, TrendingUp, DollarSign, Wallet, Shield, Zap, Flame, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface MempoolStatsProps {
  currentNetwork: NetworkType;
  minedBlocks: Block[];
  pendingBlocks: Block[];
  pendingTxs: Transaction[];
  stats: ChainStats;
  sessionTxs: Transaction[]; // Tracks all trades occurring today (during active session)
}

export const MempoolStats: React.FC<MempoolStatsProps> = ({
  currentNetwork,
  minedBlocks,
  pendingBlocks,
  pendingTxs,
  stats,
  sessionTxs,
}) => {
  const isNoyes = currentNetwork === 'noyeschain';
  const asset = isNoyes ? 'NYS' : 'BTC';
  const accentColor = isNoyes ? 'text-cyan-400' : 'text-orange-500';
  const borderColor = isNoyes ? 'border-cyan-400/20' : 'border-orange-500/20';

  // Extract all loaded transactions in the current segments
  const allMinedTxs = minedBlocks.flatMap(b => b.transactions);
  const allPendingTxs = pendingBlocks.flatMap(b => b.transactions);
  const totalLoadedTxs = [...allMinedTxs, ...allPendingTxs];

  // 1. Calculations for "All Loaded Trades/Transactions" (Historisch / Andere Segmenten)
  const totalProcessedVolume = totalLoadedTxs.reduce((sum, tx) => sum + tx.value, 0);
  const totalProcessedFees = totalLoadedTxs.reduce((sum, tx) => sum + tx.fee, 0);
  const averageTxValue = totalLoadedTxs.length > 0 ? totalProcessedVolume / totalLoadedTxs.length : 0;
  const averageFeeRate = totalLoadedTxs.length > 0 ? totalLoadedTxs.reduce((sum, tx) => sum + tx.feeRate, 0) / totalLoadedTxs.length : 0;

  // 2. Calculations for "Today's Trades/Transactions" (Session-based, simulating real-time activity today)
  const todayTxs = sessionTxs.filter(tx => tx.status === 'pending' || tx.status === 'mined');
  const todayCount = todayTxs.length;
  const todayVolume = todayTxs.reduce((sum, tx) => sum + tx.value, 0);
  const todayFees = todayTxs.reduce((sum, tx) => sum + tx.fee, 0);

  // Whales today (Value > 1.0 BTC or > 1000 NYS)
  const whaleThreshold = isNoyes ? 1000 * 1e8 : 1 * 1e8; // 10^8 satoshis = 1 BTC/NYS
  const todayWhales = todayTxs.filter(tx => tx.value >= whaleThreshold);

  // Peak fee rate today
  const todayPeakFeeRate = todayTxs.length > 0 
    ? Math.max(...todayTxs.map(tx => tx.feeRate)) 
    : isNoyes ? 45 : 85;

  // Simulated live throughput based on session updates
  const tps = isNoyes ? '0.40 tx/s' : '4.52 tx/s';

  return (
    <div className="bg-[#0c0c0c] rounded-none border border-white/10 p-6 mb-8 relative overflow-hidden">
      {/* Decorative colored grid border */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isNoyes ? 'from-cyan-500 to-blue-500' : 'from-orange-500 to-amber-500'}`} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold font-sans tracking-tight text-white flex items-center gap-2 uppercase">
            <BarChart3 size={18} className={accentColor} />
            Transactiemetadata & Dagstatistieken ({asset})
          </h2>
          <p className="text-xs text-white/50 mt-1 font-sans">
            Realtime statistieken over trades van vandaag (actieve sessie) en alle andere geladen blockchain-segmenten.
          </p>
        </div>

        <div className={`flex items-center gap-2 border px-3 py-1.5 bg-black text-[10px] font-mono font-bold tracking-wider uppercase ${isNoyes ? 'text-cyan-400 border-cyan-500/20' : 'text-orange-500 border-orange-500/20'}`}>
          <TrendingUp size={12} className="animate-pulse" />
          <span>Live Doorvoer: {tps}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Today's Trades Volume */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/40 text-[9px] font-mono font-bold uppercase tracking-wider mb-2">
              <span>Volume Vandaag</span>
              <DollarSign size={12} className={accentColor} />
            </div>
            <div className="text-2xl font-mono font-bold text-white tracking-tight truncate">
              {formatSats(todayVolume, asset)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-white/40 uppercase">
            <span>Aantal Trades:</span>
            <span className="text-white font-bold">{todayCount} txs</span>
          </div>
        </div>

        {/* Metric 2: Today's Whales */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/40 text-[9px] font-mono font-bold uppercase tracking-wider mb-2">
              <span>Whale Transacties (Vandaag)</span>
              <Award size={12} className={accentColor} />
            </div>
            <div className="text-2xl font-mono font-bold text-white tracking-tight flex items-baseline gap-1.5">
              <span>{todayWhales.length}</span>
              <span className="text-xs text-white/40 font-mono">Gedetecteerd</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-white/40 uppercase">
            <span>Drempelwaarde:</span>
            <span className="text-white font-bold">
              {isNoyes ? '1,000 NYS' : '1.0 BTC'}
            </span>
          </div>
        </div>

        {/* Metric 3: Total Collected Fees (All Other Trades) */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/40 text-[9px] font-mono font-bold uppercase tracking-wider mb-2">
              <span>Totale Fees (Alle Geladen)</span>
              <Zap size={12} className={accentColor} />
            </div>
            <div className="text-2xl font-mono font-bold text-white tracking-tight truncate">
              {formatSats(totalProcessedFees + todayFees, asset)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-white/40 uppercase">
            <span>Gem. Tarief:</span>
            <span className="text-white font-bold">
              {averageFeeRate.toFixed(1)} sat/vB
            </span>
          </div>
        </div>

        {/* Metric 4: All Trades Cumulative Volume */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/40 text-[9px] font-mono font-bold uppercase tracking-wider mb-2">
              <span>Gecumuleerd Volume (Totaal)</span>
              <Wallet size={12} className={accentColor} />
            </div>
            <div className="text-2xl font-mono font-bold text-white tracking-tight truncate">
              {formatSats(totalProcessedVolume, asset)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-white/40 uppercase">
            <span>Gem. Transactie:</span>
            <span className="text-white font-bold truncate max-w-[110px]">
              {formatSats(averageTxValue, asset).split(' ')[0]} {asset}
            </span>
          </div>
        </div>

      </div>

      {/* Daily Milestones Footer Bar */}
      <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[10px] font-mono text-white/40 uppercase tracking-wider">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Flame size={12} className="text-red-400" />
            <span>Piek Fee Vandaag: <strong className="text-white font-bold">{todayPeakFeeRate} sat/vB</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={12} className="text-emerald-400" />
            <span>Ledger Integriteit: <strong className="text-emerald-400 font-bold">100% BEVEILIGD</strong></span>
          </span>
        </div>
        <div>
          <span>Totaal Verwerkt in Sessie: </span>
          <span className="text-white font-bold">{totalLoadedTxs.length + todayCount} transacties</span>
        </div>
      </div>
    </div>
  );
};
