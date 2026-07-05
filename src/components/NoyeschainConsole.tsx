import React, { useState } from 'react';
import { Transaction, NetworkType } from '../types';
import { generateNoyeschainAddress, createMockTransaction, formatSats } from '../utils';
import { Send, Terminal, Zap, ShieldCheck, Play, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NoyeschainConsoleProps {
  currentNetwork: NetworkType;
  onBroadcastTransaction: (tx: Transaction) => void;
  onMineBlockManually: () => void;
  pendingTxCount: number;
}

const POPULAR_DESTINATIONS = [
  { name: 'Dylan Noyes (Pixel Artist)', address: 'nys1q_dylan_noyes_pixel_creator_address_99' },
  { name: 'Satoshi Nakamoto', address: 'nys1q_satoshi_nakamoto_genesis_funder_88' },
  { name: 'Noyeschain DEX Liquidity', address: 'nys1q_dex_liquidity_pool_automated_market' },
  { name: 'Noyeschain NFT Marketplace', address: 'nys1q_nft_digital_pixels_curator_contract' }
];

export const NoyeschainConsole: React.FC<NoyeschainConsoleProps> = ({
  currentNetwork,
  onBroadcastTransaction,
  onMineBlockManually,
  pendingTxCount,
}) => {
  const isNoyes = currentNetwork === 'noyeschain';

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('10.5');
  const [feeRate, setFeeRate] = useState(25);
  const [memo, setMemo] = useState('Hello Noyeschain! Pixel Power 🚀');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'SYSTEM: Noyeschain node client initialized successfully.',
    'PEER: Connected to 12 mainnet validator nodes.',
    'MEMPOOL: Listening to unconfirmed transactions on NYS...'
  ]);
  const [showBroadcastSuccess, setShowBroadcastSuccess] = useState(false);

  // Add new console message
  const addLog = (msg: string) => {
    setConsoleLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress) {
      alert('Voer een geldig bestemmingsadres in.');
      return;
    }

    const nysAmountSats = Math.floor(parseFloat(amount) * 100000000) || 100000000;
    
    // Create actual custom transaction on Noyeschain
    const newTx = createMockTransaction(true, feeRate, memo, nysAmountSats);
    newTx.outputs[0].address = toAddress; // overwrite with user input address

    onBroadcastTransaction(newTx);
    addLog(`BROADCAST: Transactie ${newTx.txid.substring(0, 16)}... verzonden naar mempool.`);
    addLog(`PENDING: ${amount} NYS transfer naar ${toAddress.substring(0, 12)}...`);
    
    setShowBroadcastSuccess(true);
    setTimeout(() => {
      setShowBroadcastSuccess(false);
    }, 3000);

    // Clear form slightly
    setMemo('');
  };

  const handleQuickAddress = (addr: string) => {
    setToAddress(addr);
    addLog(`UI: Bestemmingsadres ingesteld op: ${addr.substring(0, 16)}...`);
  };

  const handleMineClick = () => {
    if (pendingTxCount === 0) {
      addLog('MINER: Kan geen leeg blok minen. Voeg eerst transacties toe!');
      return;
    }
    onMineBlockManually();
    addLog('MINER: Bezig met oplossen van cryptografische puzzel...');
    addLog('MINER: Succesvol nieuw blok gemined door Dylan Noyes Pixel Pool!');
    addLog(`LEDGER: ${pendingTxCount} transacties bevestigd op Noyeschain Mainnet.`);
  };

  if (!isNoyes) {
    return (
      <div className="bg-[#0c0c0c] rounded-none border border-white/10 p-6 flex flex-col justify-center items-center text-center py-16 h-full min-h-[400px]">
        <div className="bg-orange-500/10 text-orange-500 p-4 rounded-none mb-4 border border-orange-500/20">
          <Terminal size={32} />
        </div>
        <h3 className="text-lg font-bold font-sans text-white mb-2 uppercase tracking-tight">
          Bitcoin Node Console is Alleen Lezen
        </h3>
        <p className="text-xs text-white/50 max-w-sm leading-relaxed font-sans">
          Bitcoin Mainnet transacties worden live geladen van echte mempool.space databronnen. Je kunt hier geen directe transacties broadcasten naar het echte Bitcoin-netwerk.
        </p>
        <button
          onClick={() => {}}
          className="mt-6 px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-xs font-mono rounded-none uppercase tracking-wider cursor-not-allowed"
          disabled
        >
          Node Verbinding Beveiligd (RO)
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      {/* Noyeschain Broadcast Form */}
      <div className="bg-[#0c0c0c] rounded-none border border-white/10 p-6 relative overflow-hidden flex flex-col justify-between">
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-bold font-sans tracking-tight text-white flex items-center gap-2">
              <Send size={16} className="text-cyan-400" />
              NOYESCHAIN TRANSACTIE BROADCASTEN
            </h3>
            <span className="text-[9px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-bold px-2 py-0.5 rounded-none font-mono flex items-center gap-1 uppercase tracking-wider">
              <Sparkles size={10} className="animate-spin" /> NYS MAINNET
            </span>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            {/* Quick Addresses */}
            <div>
              <label className="text-[10px] text-white/40 font-bold uppercase font-mono block mb-1.5 tracking-widest">
                Snelle Bestemmingen
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_DESTINATIONS.map((dest, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickAddress(dest.address)}
                    className="px-2 py-1 bg-black hover:bg-white/5 text-[10px] font-mono text-cyan-400 border border-cyan-400/15 rounded-none hover:border-cyan-400/40 transition cursor-pointer"
                  >
                    {dest.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <label className="text-[10px] text-white/40 font-bold uppercase font-mono block mb-1 tracking-widest">
                Ontvanger Adres (NYS Bech32)
              </label>
              <input
                type="text"
                placeholder="nys1q..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-none px-3 py-2 text-xs font-mono text-cyan-400 placeholder-white/25 focus:outline-none focus:border-cyan-400/50"
                required
              />
            </div>

            {/* Amount and Fee Rate Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase font-mono block mb-1 tracking-widest">
                  Bedrag (NYS)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-none px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase font-mono block mb-1 tracking-widest">
                  Fee Rate ({feeRate} sat/vB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={feeRate}
                    onChange={(e) => setFeeRate(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-black rounded-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Custom Memo/OP_RETURN message */}
            <div>
              <label className="text-[10px] text-white/40 font-bold uppercase font-mono block mb-1 flex justify-between tracking-widest">
                <span>Transactie Memo / OP_RETURN</span>
                <span className="text-white/20">Max 80 chars</span>
              </label>
              <input
                type="text"
                placeholder="Voeg een boodschap toe aan de blockchain..."
                value={memo}
                onChange={(e) => setMemo(e.target.value.slice(0, 80))}
                className="w-full bg-black border border-white/10 rounded-none px-3 py-2 text-xs font-mono text-cyan-300 placeholder-white/20 focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            {/* Broadcast action button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-sans font-black uppercase tracking-widest rounded-none transition flex items-center justify-center gap-2 cursor-pointer border border-cyan-500"
            >
              <Send size={13} />
              Broadcaste naar Noyeschain Mempool
            </button>
          </form>
        </div>

        {/* Floating Broadcast Success Popover */}
        <AnimatePresence>
          {showBroadcastSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-[#070707] flex flex-col items-center justify-center text-center p-6 z-15 border border-emerald-500/20"
            >
              <div className="w-12 h-12 rounded-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
                <ShieldCheck size={28} />
              </div>
              <h4 className="text-sm font-bold font-sans text-white uppercase tracking-wider">Transactie Succesvol Uitgezonden</h4>
              <p className="text-xs font-mono text-white/50 mt-1 max-w-xs leading-relaxed">
                Je transactie is geaccepteerd door de mempool en is toegevoegd aan het volgende pending block!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Noyeschain Node Node Console Logs & Manual Miner */}
      <div className="bg-[#0c0c0c] rounded-none border border-white/10 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-bold font-sans tracking-tight text-white flex items-center gap-2">
              <Terminal size={16} className="text-cyan-400" />
              NOYESCHAIN NODE TERMINAL & MINER
            </h3>
            <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider">
              ROLE: VALIDATOR / POOL
            </span>
          </div>

          {/* Simulated node log terminal */}
          <div className="bg-black rounded-none border border-white/10 p-4 font-mono text-xs text-white/60 h-52 overflow-y-auto space-y-1.5 flex flex-col-reverse justify-end pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {consoleLogs.map((log, idx) => {
              let colorClass = 'text-white/60';
              if (log.includes('SYSTEM')) colorClass = 'text-blue-400 font-semibold';
              if (log.includes('BROADCAST')) colorClass = 'text-cyan-400';
              if (log.includes('MINER')) colorClass = 'text-orange-400 font-black';
              if (log.includes('LEDGER')) colorClass = 'text-emerald-400 font-bold';
              if (log.includes('PEER')) colorClass = 'text-sky-400';

              return (
                <div key={idx} className={`${colorClass} leading-relaxed break-all`}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mine block action card */}
        <div className="bg-black rounded-none border border-white/10 p-3.5 flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="text-center sm:text-left">
            <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Dylan Noyes Pixel Miner Pool
            </div>
            <div className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-wide">
              Pending in Mempool: <span className="text-cyan-400 font-bold">{pendingTxCount}</span> unconfirmed txs
            </div>
          </div>

          <button
            onClick={handleMineClick}
            disabled={pendingTxCount === 0}
            className={`px-4 py-2 text-xs font-sans font-black uppercase tracking-widest rounded-none flex items-center gap-1.5 transition select-none cursor-pointer border ${
              pendingTxCount > 0
                ? 'bg-orange-500 hover:bg-orange-400 text-black border-orange-600 shadow-md'
                : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Play size={12} fill="currentColor" />
            Mijn Blok Handmatig
          </button>
        </div>
      </div>
    </div>
  );
};
