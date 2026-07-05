import React from 'react';
import { Block, NetworkType } from '../types';
import { Clock, CheckCircle, HelpCircle, ArrowRightLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface MempoolVisualizerProps {
  minedBlocks: Block[];
  pendingBlocks: Block[];
  currentNetwork: NetworkType;
  selectedBlock: Block | null;
  onSelectBlock: (block: Block) => void;
}

export const MempoolVisualizer: React.FC<MempoolVisualizerProps> = ({
  minedBlocks,
  pendingBlocks,
  currentNetwork,
  selectedBlock,
  onSelectBlock,
}) => {
  const isNoyes = currentNetwork === 'noyeschain';

  // Format age of mined block
  const getBlockAgeStr = (timestamp: number) => {
    const diff = Math.floor(Date.now() / 1000) - timestamp;
    if (diff < 60) return 'Zojuist';
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} min. geleden`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} uur geleden`;
  };

  return (
    <div className="w-full bg-[#0c0c0c] rounded-none border border-white/10 p-6 mb-8 overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <ArrowRightLeft size={18} className={isNoyes ? 'text-cyan-400' : 'text-orange-500'} />
            LIVE BLOKKEN & MEMPOOL PIPELINE
          </h2>
          <p className="text-xs text-white/50 mt-1 font-sans">
            Mined blokken worden links getoond. Onbevestigde mempool blokken representeren toekomstige prognoses op basis van fee-prioriteit.
          </p>
        </div>
        
        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">
          <span className="text-white/60">FEE RATE (sat/vB):</span>
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5">
            <span className="w-2 h-2 rounded-none bg-[#22c55e]" /> 1-2
          </span>
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5">
            <span className="w-2 h-2 rounded-none bg-[#10b981]" /> 3-8
          </span>
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5">
            <span className="w-2 h-2 rounded-none bg-[#3b82f6]" /> 8-15
          </span>
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5">
            <span className="w-2 h-2 rounded-none bg-[#eab308]" /> 15-30
          </span>
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5">
            <span className="w-2 h-2 rounded-none bg-[#f97316]" /> 30-60
          </span>
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5">
            <span className="w-2 h-2 rounded-none bg-[#ef4444]" /> 60-120
          </span>
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5">
            <span className="w-2 h-2 rounded-none bg-[#a855f7]" /> 120+
          </span>
        </div>
      </div>

      {/* Horizontal Conveyor Belt of Blocks */}
      <div className="relative w-full flex items-center justify-center py-6 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="flex items-stretch gap-5 px-4 min-w-max">
          
          {/* MINED BLOCKS (Left Side) */}
          <div className="flex items-stretch gap-4">
            {minedBlocks.map((block, idx) => {
              const isSelected = selectedBlock?.height === block.height && selectedBlock?.status === 'mined';
              const scaleRatio = Math.min(block.size / (isNoyes ? 1500000 : 1000000), 1.0);
              const percentFull = Math.round((block.size / (isNoyes ? 1500000 : 1000000)) * 100);

              return (
                <motion.div
                  key={`mined-${block.height}-${idx}`}
                  onClick={() => onSelectBlock(block)}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`w-48 rounded-none p-4 bg-black/40 border cursor-pointer flex flex-col justify-between transition-all relative ${
                    isSelected 
                      ? 'border-2 border-emerald-500 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                      : 'border-emerald-500/25 hover:border-emerald-500/60 hover:bg-black/60'
                  }`}
                  whileHover={{ y: -4 }}
                >
                  <div className="absolute top-3 right-3 text-emerald-400">
                    <CheckCircle size={14} className="opacity-80" />
                  </div>

                  <div>
                    <div className="text-white/40 text-[9px] font-bold tracking-wider uppercase font-mono">
                      MINED BLOCK
                    </div>
                    <div className="text-xl font-mono font-black text-white mt-1">
                      #{block.height.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/50 flex items-center gap-1 mt-1 font-mono uppercase">
                      <Clock size={11} />
                      <span>{getBlockAgeStr(block.time)}</span>
                    </div>
                  </div>

                  {/* Visual block capacity fill */}
                  <div className="my-4">
                    <div className="flex justify-between text-[9px] text-white/40 font-mono mb-1 uppercase">
                      <span>{percentFull}% Vol</span>
                      <span className="text-white font-bold">{(block.size / 1000).toFixed(0)} kB</span>
                    </div>
                    <div className="w-full h-1.5 bg-black border border-white/5 rounded-none overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 rounded-none opacity-80"
                        style={{ width: `${percentFull}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono uppercase tracking-tight text-white/50">
                      <div>
                        <span className="block text-[9px]">Median Fee</span>
                        <span className="text-white font-bold text-[11px] font-mono">{block.medianFee} sat</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px]">Txs</span>
                        <span className="text-white font-bold text-[11px] font-mono">{block.txCount}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* THE DIVIDING LINE (Mempool Separator) */}
          <div className="flex flex-col items-center justify-center px-4 border-l border-r border-dashed border-white/10 select-none relative">
            <div className="bg-gradient-to-b from-transparent via-white/10 to-transparent w-px h-full absolute" />
            <div className="bg-black p-3.5 border border-white/10 rounded-none z-10 flex flex-col items-center justify-center shadow-lg">
              <span className="text-[9px] font-black tracking-widest text-white/40 uppercase font-mono">
                MEMPOOL
              </span>
              <span className={`text-[10px] font-black tracking-widest ${isNoyes ? 'text-cyan-400' : 'text-orange-500'} uppercase font-mono mt-0.5`}>
                GRENS
              </span>
            </div>
          </div>

          {/* PENDING FORECAST BLOCKS (Right Side) */}
          <div className="flex items-stretch gap-4">
            {pendingBlocks.map((block, idx) => {
              const isSelected = selectedBlock?.height === block.height && selectedBlock?.status === 'pending';
              const percentFull = Math.round((block.size / (isNoyes ? 1500000 : 1000000)) * 100);
              
              // Map colors depending on average/median fee rate of this forecasted block
              const blockColorClass = block.medianFee > 100
                ? 'border-purple-500/30 text-purple-400'
                : block.medianFee > 40
                  ? 'border-red-500/30 text-red-400'
                  : block.medianFee > 15
                    ? 'border-orange-500/30 text-orange-400'
                    : 'border-cyan-400/30 text-cyan-400';

              const progressColorClass = block.medianFee > 100
                ? 'bg-purple-500'
                : block.medianFee > 40
                  ? 'bg-red-500'
                  : block.medianFee > 15
                    ? 'bg-orange-500'
                    : 'bg-cyan-400';

              const glowClass = isSelected
                ? block.medianFee > 100
                  ? 'border-2 border-purple-500 bg-purple-950/10'
                  : block.medianFee > 40
                    ? 'border-2 border-red-500 bg-red-950/10'
                    : block.medianFee > 15
                      ? 'border-2 border-orange-500 bg-orange-950/10'
                      : 'border-2 border-cyan-400 bg-cyan-950/10'
                : 'bg-black/30 hover:bg-black/60';

              return (
                <motion.div
                  key={`pending-${block.height}-${idx}`}
                  onClick={() => onSelectBlock(block)}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`w-48 rounded-none p-4 border cursor-pointer flex flex-col justify-between transition-all relative ${blockColorClass} ${glowClass}`}
                  whileHover={{ y: -4 }}
                >
                  <div className="absolute top-3 right-3 text-white/20">
                    <HelpCircle size={14} className="opacity-60" />
                  </div>

                  <div>
                    <div className="text-white/40 text-[9px] font-bold tracking-wider uppercase font-mono">
                      PREDICTED ~{idx * 10 + 10}M
                    </div>
                    <div className="text-xl font-mono font-black text-white mt-1">
                      #{block.height.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/50 flex items-center gap-1 mt-1 font-mono uppercase">
                      <Clock size={11} />
                      <span>{idx === 0 ? 'Volgende Blok' : `In ~${(idx + 1) * (isNoyes ? 30 : 600)} sec`}</span>
                    </div>
                  </div>

                  {/* Capacity Meter */}
                  <div className="my-4">
                    <div className="flex justify-between text-[9px] text-white/40 font-mono mb-1 uppercase">
                      <span>{percentFull}% Vol</span>
                      <span className="text-white font-bold">{(block.size / 1000).toFixed(0)} kB</span>
                    </div>
                    <div className="w-full h-1.5 bg-black border border-white/5 rounded-none overflow-hidden">
                      <div 
                        className={`h-full rounded-none opacity-80 ${progressColorClass}`}
                        style={{ width: `${percentFull}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono uppercase tracking-tight text-white/50">
                      <div>
                        <span className="block text-[9px]">Fee Bereik</span>
                        <span className="text-white font-bold text-[10px] truncate block font-mono">
                          {block.feeRange[0]}-{block.feeRange[1]} sat
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px]">Txs</span>
                        <span className="text-white font-bold text-[11px] font-mono">{block.txCount}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
