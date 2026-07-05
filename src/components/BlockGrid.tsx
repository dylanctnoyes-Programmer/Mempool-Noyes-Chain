import React, { useState } from 'react';
import { Block, Transaction, NetworkType } from '../types';
import { formatSats, getFeeColor } from '../utils';
import { Search, Info, HardDrive, Hash, FileText, Send, Clock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlockGridProps {
  block: Block;
  currentNetwork: NetworkType;
  selectedTransaction: Transaction | null;
  onSelectTransaction: (tx: Transaction) => void;
}

export const BlockGrid: React.FC<BlockGridProps> = ({
  block,
  currentNetwork,
  selectedTransaction,
  onSelectTransaction,
}) => {
  const [hoveredTx, setHoveredTx] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isNoyes = currentNetwork === 'noyeschain';
  const asset = isNoyes ? 'NYS' : 'BTC';

  // Filter transactions within the block
  const filteredTxs = block.transactions.filter(tx => 
    tx.txid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.inputs.some(i => i.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    tx.outputs.some(o => o.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.message && tx.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Visual Block Pixel Map Container */}
      <div className="lg:col-span-2 bg-[#0c0c0c] rounded-none border border-white/10 p-6 flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h3 className="text-md font-bold font-sans tracking-tight text-white flex items-center gap-2">
              <HardDrive size={16} className={isNoyes ? 'text-cyan-400' : 'text-orange-500'} />
              BLOK TRANSACTIE-PIXELKAART ({block.status === 'mined' ? 'MINED' : 'IN MEMPOOL'})
            </h3>
            <p className="text-xs text-white/50 mt-1 font-sans">
              Elke pixel is een onbevestigde transactie. Grootte representeert datavolume (vB), kleur representeert fee rate. Hover voor info, klik voor details.
            </p>
          </div>

          {/* Search bar inside block */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Zoek in dit blok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-none pl-8 pr-3 py-1.5 text-xs text-white font-mono placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Pixel Map Area */}
        <div className="bg-black rounded-none border border-white/10 p-4 min-h-[340px] flex flex-col justify-between relative overflow-hidden">
          {filteredTxs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 py-12">
              <Search size={32} className="opacity-30 mb-2" />
              <p className="text-xs font-mono">Geen transacties gevonden</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 items-start content-start max-h-[300px] overflow-y-auto pr-1">
              {filteredTxs.map((tx) => {
                // Calculate dynamic visual size of pixel proportional to transaction size in vB
                const sizePx = Math.max(8, Math.min(26, Math.ceil(tx.size / 24)));
                const isSelected = selectedTransaction?.txid === tx.txid;

                return (
                  <motion.div
                    key={tx.txid}
                    className={`rounded-none transition-all cursor-pointer relative flex-shrink-0 ${
                      isSelected 
                        ? 'ring-2 ring-white scale-110 z-10' 
                        : 'hover:scale-115 hover:z-10'
                    }`}
                    style={{
                      width: `${sizePx}px`,
                      height: `${sizePx}px`,
                      backgroundColor: tx.color || getFeeColor(tx.feeRate)
                    }}
                    onMouseEnter={() => setHoveredTx(tx)}
                    onMouseLeave={() => setHoveredTx(null)}
                    onClick={() => onSelectTransaction(tx)}
                    whileHover={{ scale: 1.15 }}
                  />
                );
              })}
            </div>
          )}

          {/* Quick HUD bottom bar */}
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-white/40 uppercase tracking-wider">
            <div>
              <span>Totaal in blok:</span>{' '}
              <span className="text-white font-bold">{block.transactions.length} txs</span>
            </div>
            <div>
              <span>Gefilterd:</span>{' '}
              <span className="text-white font-bold">{filteredTxs.length} txs</span>
            </div>
            <div>
              <span>Grootte:</span>{' '}
              <span className="text-white font-bold">{(block.size / 1000).toFixed(2)} kB</span>
            </div>
          </div>

          {/* Live Hover Tooltip Popover */}
          <AnimatePresence>
            {hoveredTx && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-4 bottom-14 z-20 bg-[#0d0d0d] border border-white/20 rounded-none p-3 shadow-xl max-w-xs font-mono text-[11px]"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1.5 mb-1.5">
                  <span className="text-white font-bold truncate">
                    TXID: {hoveredTx.txid.substring(0, 8)}...{hoveredTx.txid.substring(56)}
                  </span>
                  <span 
                    className="px-1.5 py-0.5 rounded-none text-[9px] font-bold text-black"
                    style={{ backgroundColor: hoveredTx.color }}
                  >
                    {hoveredTx.feeRate} sat/vB
                  </span>
                </div>
                <div className="space-y-1 text-white/70">
                  <div className="flex justify-between">
                    <span>Grootte:</span>
                    <span>{hoveredTx.size} vB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waarde:</span>
                    <span>{formatSats(hoveredTx.value, asset)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Totaal Fee:</span>
                    <span className="text-orange-400">{(hoveredTx.fee).toLocaleString()} sats</span>
                  </div>
                  {hoveredTx.message && (
                    <div className="border-t border-white/10 pt-1 mt-1 text-[10px] text-cyan-400 italic truncate">
                      Memo: "{hoveredTx.message}"
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transaction Details Side Panel */}
      <div className="bg-[#0c0c0c] rounded-none border border-white/10 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-md font-bold font-sans tracking-tight text-white flex items-center gap-2 mb-4">
            <FileText size={16} className={isNoyes ? 'text-cyan-400' : 'text-orange-500'} />
            GESELECTEERDE TRANSACTIE
          </h3>

          <AnimatePresence mode="wait">
            {selectedTransaction ? (
              <motion.div
                key={selectedTransaction.txid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* ID Header Card */}
                <div className="bg-black rounded-none p-4 border border-white/10">
                  <div className="flex items-center gap-1.5 text-white/40 text-[9px] font-bold uppercase font-mono tracking-wider">
                    <Hash size={12} />
                    <span>Transaction Hash</span>
                  </div>
                  <div className="text-xs font-mono text-white break-all select-all font-semibold mt-1">
                    {selectedTransaction.txid}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5 text-[10px] font-mono uppercase tracking-wider text-white/40">
                    <span>Tijdstip</span>
                    <span className="text-white font-bold">
                      {new Date(selectedTransaction.time * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Core Parameters Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] rounded-none p-3 border border-white/5">
                    <span className="text-[9px] text-white/40 block font-mono uppercase tracking-wider">Fee Rate</span>
                    <span className="text-md font-mono font-bold text-white flex items-baseline gap-1 mt-0.5">
                      {selectedTransaction.feeRate}
                      <span className="text-[10px] text-white/30 font-normal">sat/vB</span>
                    </span>
                  </div>
                  <div className="bg-white/[0.02] rounded-none p-3 border border-white/5">
                    <span className="text-[9px] text-white/40 block font-mono uppercase tracking-wider">Grootte</span>
                    <span className="text-md font-mono font-bold text-white flex items-baseline gap-1 mt-0.5">
                      {selectedTransaction.size}
                      <span className="text-[10px] text-white/30 font-normal">vB</span>
                    </span>
                  </div>
                  <div className="bg-white/[0.02] rounded-none p-3 border border-white/5">
                    <span className="text-[9px] text-white/40 block font-mono uppercase tracking-wider">Totale Waarde</span>
                    <span className="text-sm font-mono font-bold text-white truncate mt-0.5 block">
                      {formatSats(selectedTransaction.value, asset)}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] rounded-none p-3 border border-white/5">
                    <span className="text-[9px] text-white/40 block font-mono uppercase tracking-wider">Netwerk Fee</span>
                    <span className="text-sm font-mono font-bold text-orange-500 truncate mt-0.5 block">
                      {selectedTransaction.fee.toLocaleString()} sats
                    </span>
                  </div>
                </div>

                {/* Inputs & Outputs Flow Chart */}
                <div className="space-y-2 font-mono text-[11px]">
                  {/* Inputs */}
                  <div>
                    <div className="text-white/40 font-bold uppercase tracking-wider text-[9px] mb-1 flex justify-between">
                      <span>Inputs ({selectedTransaction.inputs.length})</span>
                      <span className="text-white">{formatSats(selectedTransaction.inputs.reduce((acc, i) => acc + i.value, 0), asset)}</span>
                    </div>
                    <div className="max-h-20 overflow-y-auto space-y-1 pr-1">
                      {selectedTransaction.inputs.map((inp, idx) => (
                        <div key={idx} className="bg-black rounded-none p-1.5 border border-white/5 flex justify-between items-center">
                          <span className="text-[10px] text-white/50 truncate w-32 select-all font-mono">{inp.address}</span>
                          <span className="text-white font-medium">{formatSats(inp.value, asset)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-white/20 py-0.5">
                    <ArrowRight size={14} className="rotate-90" />
                  </div>

                  {/* Outputs */}
                  <div>
                    <div className="text-white/40 font-bold uppercase tracking-wider text-[9px] mb-1 flex justify-between">
                      <span>Outputs ({selectedTransaction.outputs.length})</span>
                      <span className="text-white">{formatSats(selectedTransaction.outputs.reduce((acc, o) => acc + o.value, 0), asset)}</span>
                    </div>
                    <div className="max-h-20 overflow-y-auto space-y-1 pr-1">
                      {selectedTransaction.outputs.map((out, idx) => (
                        <div key={idx} className="bg-black rounded-none p-1.5 border border-white/5 flex justify-between items-center">
                          <span className="text-[10px] text-white/50 truncate w-32 select-all font-mono">{out.address}</span>
                          <span className="text-cyan-400 font-medium">{formatSats(out.value, asset)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Optional Message Field */}
                {selectedTransaction.message && (
                  <div className="bg-cyan-950/10 border border-cyan-500/20 rounded-none p-3 mt-2">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase font-mono tracking-wider block">
                      Message / OP_RETURN
                    </span>
                    <p className="text-xs font-mono text-white/90 mt-1 break-words leading-relaxed select-all">
                      {selectedTransaction.message}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-20 text-white/30 border border-white/10 border-dashed rounded-none"
              >
                <Info size={28} className="opacity-30 mb-2" />
                <p className="text-xs max-w-[200px] font-sans">
                  Klik op een transactiepixel in het blok aan de linkerkant om details weer te geven.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedTransaction && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[9px] font-mono text-white/30 uppercase tracking-widest">
            <Clock size={12} />
            <span>Status: {selectedTransaction.status === 'mined' ? 'Bevestigd' : 'In mempool'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
