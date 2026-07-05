import React from 'react';
import { ChainStats, NetworkType } from '../types';
import { formatSats, formatHashrate } from '../utils';
import { Activity, Database, Zap, Cpu, Clock, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface NetworkOverviewProps {
  bitcoinStats: ChainStats;
  noyeschainStats: ChainStats;
  currentNetwork: NetworkType;
  onNetworkChange: (network: NetworkType) => void;
}

export const NetworkOverview: React.FC<NetworkOverviewProps> = ({
  bitcoinStats,
  noyeschainStats,
  currentNetwork,
  onNetworkChange,
}) => {
  const networks = [
    {
      id: 'bitcoin' as NetworkType,
      name: 'Bitcoin Mainnet',
      stats: bitcoinStats,
      accentColor: 'bg-orange-500',
      borderColor: 'border-orange-500',
      cardBg: 'bg-orange-950/5',
      selectedBorderColor: 'border-orange-500',
      textColor: 'text-orange-500',
      description: 'The global standard digital gold ledger.',
      logoText: '₿',
    },
    {
      id: 'noyeschain' as NetworkType,
      name: 'Noyeschain Mainnet',
      stats: noyeschainStats,
      accentColor: 'bg-cyan-400',
      borderColor: 'border-cyan-400',
      cardBg: 'bg-cyan-950/5',
      selectedBorderColor: 'border-cyan-400',
      textColor: 'text-cyan-400',
      description: 'Ultra-fast pixel-powered decentralized ledger.',
      logoText: 'ℕ',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {networks.map((net) => {
        const isSelected = currentNetwork === net.id;
        const hashVal = parseFloat(net.stats.hashRate);
        const displayHash = formatHashrate(hashVal, net.id === 'noyeschain');

        return (
          <motion.div
            key={net.id}
            onClick={() => onNetworkChange(net.id)}
            className={`relative rounded-none p-6 bg-[#0c0c0c] border cursor-pointer overflow-hidden transition-all duration-300 ${
              isSelected 
                ? `border-2 ${net.selectedBorderColor} shadow-[0_0_20px_rgba(255,255,255,0.03)]` 
                : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/20'
            }`}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.15 }}
          >
            {/* Visual accent banner at the top edge */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${net.accentColor}`} />

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest mb-2 ${
                  isSelected ? `${net.textColor} bg-white/5` : 'bg-white/5 text-white/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-none ${isSelected ? net.accentColor + ' animate-pulse' : 'bg-white/20'}`} />
                  {net.id === 'bitcoin' ? 'BTC Network' : 'NYS Network'}
                </span>
                <h3 className="text-3xl font-black font-sans tracking-tighter text-white flex items-center gap-2 mt-1">
                  <span className={`${net.textColor}`}>
                    {net.logoText}
                  </span>
                  {net.name}
                </h3>
                <p className="text-xs text-white/50 tracking-tight font-sans mt-1.5 font-medium">{net.description}</p>
              </div>

              {/* Status Pill */}
              <div className={`flex items-center gap-1.5 text-[10px] tracking-widest font-mono font-bold px-3 py-1.5 rounded-none bg-black border ${
                isSelected ? 'text-emerald-400 border-emerald-500/20' : 'text-white/20 border-white/5'
              }`}>
                <Activity size={11} className={isSelected ? 'animate-pulse' : ''} />
                <span>ONLINE</span>
              </div>
            </div>

            {/* Network Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white/90">
              {/* Block Height */}
              <div className="bg-white/[0.02] rounded-none p-4 border border-white/5">
                <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Layers size={13} />
                  <span>Blokhoogte</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white tracking-tight">
                  #{net.stats.height.toLocaleString()}
                </div>
              </div>

              {/* Mempool Transaction Count */}
              <div className="bg-white/[0.02] rounded-none p-4 border border-white/5">
                <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Database size={13} />
                  <span>Onbevestigd</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white tracking-tight">
                  {net.stats.unconfirmedCount.toLocaleString()}
                  <span className="text-xs text-white/40 font-mono ml-1">txs</span>
                </div>
              </div>

              {/* Hashrate */}
              <div className="bg-white/[0.02] rounded-none p-4 border border-white/5 col-span-2 md:col-span-1">
                <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Cpu size={13} />
                  <span>Rekenkracht</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white tracking-tight truncate">
                  {displayHash}
                </div>
              </div>

              {/* Average/Median Fee */}
              <div className="bg-white/[0.02] rounded-none p-4 border border-white/5">
                <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Zap size={13} className={net.textColor} />
                  <span>Gem. Fee</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white tracking-tight">
                  {net.stats.averageFeeRate} <span className="text-xs text-white/40 font-mono font-normal">sat/vB</span>
                </div>
              </div>

              {/* Mempool Size */}
              <div className="bg-white/[0.02] rounded-none p-4 border border-white/5">
                <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Activity size={13} />
                  <span>Mempool</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white tracking-tight truncate">
                  {(net.stats.mempoolSize / 1e6).toFixed(2)} <span className="text-xs text-white/40 font-mono font-normal">MB</span>
                </div>
              </div>

              {/* Block Time */}
              <div className="bg-white/[0.02] rounded-none p-4 border border-white/5 col-span-2 md:col-span-1">
                <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Clock size={13} />
                  <span>Bloktijd</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white tracking-tight">
                  {net.stats.blockTime}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

