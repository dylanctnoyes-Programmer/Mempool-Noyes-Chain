import React, { useState, useMemo } from 'react';
import { Transaction, Block, NetworkType } from '../types';
import { formatSats } from '../utils';
import { Search, Filter, ArrowRight, CornerDownRight, CheckCircle2, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionFilterProps {
  currentNetwork: NetworkType;
  minedBlocks: Block[];
  pendingBlocks: Block[];
  onSelectTransaction: (tx: Transaction) => void;
  onSelectBlock: (block: Block) => void;
}

export const TransactionFilter: React.FC<TransactionFilterProps> = ({
  currentNetwork,
  minedBlocks,
  pendingBlocks,
  onSelectTransaction,
  onSelectBlock,
}) => {
  const isNoyes = currentNetwork === 'noyeschain';
  const asset = isNoyes ? 'NYS' : 'BTC';
  const accentColor = isNoyes ? 'text-cyan-400' : 'text-orange-500';
  const accentBg = isNoyes ? 'bg-cyan-400' : 'bg-orange-500';
  const accentBorder = isNoyes ? 'border-cyan-400/30' : 'border-orange-500/30';
  const focusBorder = isNoyes ? 'focus:border-cyan-400/50' : 'focus:border-orange-500/50';

  // State fields
  const [addressInput, setAddressInput] = useState('');
  const [minAmountInput, setMinAmountInput] = useState('');
  const [maxAmountInput, setMaxAmountInput] = useState('');
  const [txidInput, setTxidInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'mined'>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  // Clear all filters
  const handleClearFilters = () => {
    setAddressInput('');
    setMinAmountInput('');
    setMaxAmountInput('');
    setTxidInput('');
    setStatusFilter('all');
  };

  // Compile all transactions and map them back to their parent blocks
  const searchableTransactions = useMemo(() => {
    const list: { tx: Transaction; block: Block }[] = [];
    
    // Add pending transactions
    pendingBlocks.forEach(block => {
      block.transactions.forEach(tx => {
        list.push({ tx, block });
      });
    });

    // Add mined transactions
    minedBlocks.forEach(block => {
      block.transactions.forEach(tx => {
        list.push({ tx, block });
      });
    });

    return list;
  }, [minedBlocks, pendingBlocks]);

  // Execute actual filtering logic
  const filteredTransactions = useMemo(() => {
    return searchableTransactions.filter(({ tx, block }) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && tx.status !== statusFilter) {
        return false;
      }

      // 2. TxID Filter
      if (txidInput.trim()) {
        const query = txidInput.trim().toLowerCase();
        if (!tx.txid.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 3. Address Filter (Input or Output address matching)
      if (addressInput.trim()) {
        const query = addressInput.trim().toLowerCase();
        const inputMatches = tx.inputs.some(inp => inp.address.toLowerCase().includes(query));
        const outputMatches = tx.outputs.some(out => out.address.toLowerCase().includes(query));
        if (!inputMatches && !outputMatches) {
          return false;
        }
      }

      // 4. Amount Filter
      const txValueInCoins = tx.value / 1e8; // Convert satoshis to BTC/NYS coins
      if (minAmountInput.trim()) {
        const minVal = parseFloat(minAmountInput);
        if (!isNaN(minVal) && txValueInCoins < minVal) {
          return false;
        }
      }
      if (maxAmountInput.trim()) {
        const maxVal = parseFloat(maxAmountInput);
        if (!isNaN(maxVal) && txValueInCoins > maxVal) {
          return false;
        }
      }

      return true;
    });
  }, [searchableTransactions, addressInput, minAmountInput, maxAmountInput, txidInput, statusFilter]);

  // Handle transaction inspection click
  const handleInspectTransaction = (tx: Transaction, block: Block) => {
    onSelectBlock(block);
    onSelectTransaction(tx);

    // Scroll smoothly to the BlockGrid details component
    const blockGridElement = document.getElementById('block-grid-details');
    if (blockGridElement) {
      blockGridElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#0c0c0c] border border-white/10 p-6 mb-8 relative">
      {/* Title section with collapse state toggle */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-md font-bold font-sans tracking-tight text-white flex items-center gap-2 uppercase">
            <Filter size={16} className={accentColor} />
            GEAVANCEERD TRANSACTIES FILTEREN & ZOEKEN
          </h3>
          <p className="text-xs text-white/50 mt-1 font-sans">
            Filter alle live en historische transacties op adres, bedrag, ID en mempool status.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition cursor-pointer"
          >
            <RefreshCcw size={10} />
            WISSEN
          </button>
          
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`px-3 py-1 text-[10px] font-mono font-bold border transition cursor-pointer ${
              isFilterPanelOpen ? 'bg-white/5 border-white/20 text-white' : 'border-white/10 text-white/50'
            }`}
          >
            {isFilterPanelOpen ? 'VOUW IN' : 'KLAP UIT'}
          </button>
        </div>
      </div>

      <AnimatePresence initial={true}>
        {isFilterPanelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Filter controls grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-3 pb-5 border-b border-white/5">
              
              {/* Address filter input */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-white/40 font-mono font-bold uppercase tracking-widest block">
                  Adres (Zender/Ontvanger)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isNoyes ? "nys1q..." : "bc1q..."}
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className={`w-full bg-black border border-white/10 text-xs font-mono text-white px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-white/10 ${focusBorder}`}
                  />
                  {addressInput && (
                    <button 
                      onClick={() => setAddressInput('')} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-mono"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Min amount input */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-white/40 font-mono font-bold uppercase tracking-widest block">
                  Min Bedrag ({asset})
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Bv. 0.05"
                  value={minAmountInput}
                  onChange={(e) => setMinAmountInput(e.target.value)}
                  className={`w-full bg-black border border-white/10 text-xs font-mono text-white px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-white/10 ${focusBorder}`}
                />
              </div>

              {/* Max amount input */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-white/40 font-mono font-bold uppercase tracking-widest block">
                  Max Bedrag ({asset})
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Bv. 2.50"
                  value={maxAmountInput}
                  onChange={(e) => setMaxAmountInput(e.target.value)}
                  className={`w-full bg-black border border-white/10 text-xs font-mono text-white px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-white/10 ${focusBorder}`}
                />
              </div>

              {/* Transaction Hash query */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-white/40 font-mono font-bold uppercase tracking-widest block">
                  Transactie ID (TXID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Zoek transactie hash..."
                    value={txidInput}
                    onChange={(e) => setTxidInput(e.target.value)}
                    className={`w-full bg-black border border-white/10 text-xs font-mono text-white px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-white/10 ${focusBorder}`}
                  />
                  {txidInput && (
                    <button 
                      onClick={() => setTxidInput('')} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-mono"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-white/40 font-mono font-bold uppercase tracking-widest block">
                  Mempool Status
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['all', 'pending', 'mined'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`text-[9px] font-mono py-2 border transition cursor-pointer ${
                        statusFilter === status 
                          ? `${accentBg} text-black border-transparent font-black` 
                          : 'bg-black border-white/10 text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <div className="mt-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
            Gevonden resultaten:{' '}
            <strong className="text-white font-bold font-mono">
              {filteredTransactions.length} transactie{filteredTransactions.length === 1 ? '' : 's'}
            </strong>
          </span>
          {(addressInput || minAmountInput || maxAmountInput || txidInput || statusFilter !== 'all') && (
            <span className={`text-[9px] px-2 py-0.5 font-mono font-bold border uppercase tracking-wider bg-white/5 ${accentColor} ${accentBorder}`}>
              Filters actief
            </span>
          )}
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="max-h-60 overflow-y-auto pr-1.5 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {filteredTransactions.slice(0, 50).map(({ tx, block }) => {
              const isTxMined = tx.status === 'mined';
              return (
                <div
                  key={tx.txid}
                  onClick={() => handleInspectTransaction(tx, block)}
                  className="bg-black/40 border border-white/5 hover:border-white/20 p-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition duration-150 cursor-pointer text-xs group"
                >
                  <div className="flex items-center gap-2 font-mono">
                    <CornerDownRight size={12} className="text-white/30 group-hover:text-white transition" />
                    
                    {/* Status indicator */}
                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded-none font-mono ${
                      isTxMined 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>

                    {/* Block Height Tag */}
                    <span className="text-[10px] text-white/40 font-mono">
                      #{block.height}
                    </span>

                    {/* TXID snippet */}
                    <span className="text-white font-bold hover:underline">
                      {tx.txid.slice(0, 10)}...{tx.txid.slice(-10)}
                    </span>
                  </div>

                  {/* Right side data details */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end font-mono">
                    <span className="text-white/40 text-[10px]">
                      {tx.feeRate} sat/vB
                    </span>
                    
                    <span className="text-white font-black">
                      {formatSats(tx.value, asset)}
                    </span>

                    <button
                      type="button"
                      className={`text-[9px] font-mono font-bold px-2.5 py-1 ${accentBg} text-black border border-transparent transition opacity-80 group-hover:opacity-100 flex items-center gap-1`}
                    >
                      INSPECTEREN <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredTransactions.length > 50 && (
              <div className="text-center text-[10px] font-mono text-white/30 py-2 uppercase">
                En nog {filteredTransactions.length - 50} andere resultaten... verfijn uw filters om resultaten te verminderen.
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-white/10 p-8 text-center text-xs font-mono text-white/40 uppercase">
            Geen transacties gevonden die voldoen aan de geselecteerde filters.
          </div>
        )}
      </div>
    </div>
  );
};
