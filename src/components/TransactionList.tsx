import React from 'react';
import { Transaction, NetworkType } from '../types';
import { formatSats } from '../utils';
import { Flame, Clock, Coins, UserCheck, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionListProps {
  transactions: Transaction[];
  currentNetwork: NetworkType;
  onSelectTransaction: (tx: Transaction) => void;
  selectedTransaction: Transaction | null;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentNetwork,
  onSelectTransaction,
  selectedTransaction,
}) => {
  const isNoyes = currentNetwork === 'noyeschain';
  const asset = isNoyes ? 'NYS' : 'BTC';

  return (
    <div className="bg-[#0c0c0c] rounded-none border border-white/10 p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-md font-bold font-sans tracking-tight text-white flex items-center gap-2">
              <Radio size={16} className={`${isNoyes ? 'text-cyan-400' : 'text-orange-500'} animate-pulse`} />
              LIVE TRANSACTIESTROOM
            </h3>
            <p className="text-xs text-white/50 mt-1 font-sans">
              Recent uitgezonden transacties die wachten in de geheugenpool.
            </p>
          </div>
          
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-none px-2 py-0.5 font-mono font-bold tracking-widest animate-pulse">
            LIVE FEED
          </span>
        </div>

        {/* Live list container */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence initial={false}>
            {transactions.slice(0, 10).map((tx) => {
              const isSelected = selectedTransaction?.txid === tx.txid;
              
              // Get custom visual badges
              const isHighFee = tx.feeRate >= 45;
              const isLargeValue = tx.value >= 1e8; // >= 1.0 Coin

              return (
                <motion.div
                  key={tx.txid}
                  initial={{ opacity: 0, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => onSelectTransaction(tx)}
                  className={`p-3 rounded-none border cursor-pointer transition-all duration-200 flex flex-col justify-between gap-2 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-white/5 border-white/30 shadow-md' 
                      : 'bg-black/40 border-white/5 hover:bg-white/[0.03] hover:border-white/10'
                  }`}
                >
                  {/* Subtle color highlight in left border */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1" 
                    style={{ backgroundColor: tx.color }}
                  />

                  {/* Header info */}
                  <div className="flex justify-between items-center pl-1.5">
                    <span className="text-[11px] font-mono font-bold text-white">
                      {tx.txid.substring(0, 6)}...{tx.txid.substring(58)}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      {new Date(tx.time * 1000).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Main specs and stats */}
                  <div className="flex justify-between items-center pl-1.5">
                    <div className="flex items-center gap-1.5">
                      <Coins size={12} className="text-white/40" />
                      <span className="text-xs font-mono font-black text-white">
                        {formatSats(tx.value, asset)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* High Fee Warning Badge */}
                      {isHighFee && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-none text-[8px] font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-tight">
                          <Flame size={8} /> High Fee
                        </span>
                      )}

                      {/* Large value highlight */}
                      {isLargeValue && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-none text-[8px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-tight">
                          Whale
                        </span>
                      )}

                      <span 
                        className="px-2 py-0.5 rounded-none text-[10px] font-black font-mono text-black"
                        style={{ backgroundColor: tx.color }}
                      >
                        {tx.feeRate} sat/vB
                      </span>
                    </div>
                  </div>

                  {/* Optional short info on input/output count or message */}
                  {tx.message ? (
                    <div className="pl-1.5 text-[10px] text-cyan-400 font-mono truncate border-t border-white/5 pt-1.5 mt-0.5">
                      Memo: "{tx.message}"
                    </div>
                  ) : (
                    <div className="pl-1.5 flex justify-between items-center text-[9px] text-white/30 font-mono border-t border-white/5 pt-1.5 mt-0.5 uppercase tracking-wider">
                      <span>{tx.size} vB</span>
                      <span>{tx.inputs.length} in → {tx.outputs.length} out</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/30 uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Clock size={11} /> Update: ~1.5s
        </span>
        <span>{transactions.length} txs geladen</span>
      </div>
    </div>
  );
};
