import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Block, ChainStats, NetworkType } from './types';
import { NetworkOverview } from './components/NetworkOverview';
import { MempoolVisualizer } from './components/MempoolVisualizer';
import { BlockGrid } from './components/BlockGrid';
import { TransactionList } from './components/TransactionList';
import { NoyeschainConsole } from './components/NoyeschainConsole';
import { MempoolCharts } from './components/MempoolCharts';
import { MempoolStats } from './components/MempoolStats';
import { TransactionFilter } from './components/TransactionFilter';
import { SovereignRules } from './components/SovereignRules';
import { createMockTransaction, assembleBlock, generateHash, getFeeColor } from './utils';
import { Coins, HardDrive, Cpu, Terminal, Search, Globe, Github, Info, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Recommended default states if APIs fail
const INITIAL_BTC_STATS: ChainStats = {
  height: 850431,
  unconfirmedCount: 382901,
  mempoolSize: 114200000, // 114.2 MB
  averageFeeRate: 24,
  hashRate: '710000000000000000000', // 710 EH/s
  difficulty: '83.15 T',
  blockTime: '10 min',
  nativeAsset: 'BTC'
};

const INITIAL_NYS_STATS: ChainStats = {
  height: 420888,
  unconfirmedCount: 22,
  mempoolSize: 450000, // 450 KB
  averageFeeRate: 15,
  hashRate: '4200000000', // 4.2 GH/s
  difficulty: '312.4 KH',
  blockTime: '30 sec',
  nativeAsset: 'NYS'
};

export default function App() {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>('noyeschain');
  const [bitcoinStats, setBitcoinStats] = useState<ChainStats>(INITIAL_BTC_STATS);
  const [noyeschainStats, setNoyeschainStats] = useState<ChainStats>(INITIAL_NYS_STATS);

  // Lists of blocks & transactions
  const [btcMinedBlocks, setBtcMinedBlocks] = useState<Block[]>([]);
  const [btcPendingBlocks, setBtcPendingBlocks] = useState<Block[]>([]);
  const [btcPendingTxs, setBtcPendingTxs] = useState<Transaction[]>([]);

  const [nysMinedBlocks, setNysMinedBlocks] = useState<Block[]>([]);
  const [nysPendingBlocks, setNysPendingBlocks] = useState<Block[]>([]);
  const [nysPendingTxs, setNysPendingTxs] = useState<Transaction[]>([]);

  // Session stats for "trades today" and "all other trades" metadata tracking
  const [btcSessionTxs, setBtcSessionTxs] = useState<Transaction[]>([]);
  const [nysSessionTxs, setNysSessionTxs] = useState<Transaction[]>([]);

  // Selection states
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [miningCelebration, setMiningCelebration] = useState(false);
  const [minedBlockDetails, setMinedBlockDetails] = useState<Block | null>(null);

  // Setup initial mock blocks for offline reliability and initial high fidelity look
  useEffect(() => {
    // 1. Generate BTC Mock Data
    const btcTxs: Transaction[] = [];
    for (let i = 0; i < 180; i++) {
      btcTxs.push(createMockTransaction(false));
    }
    
    const btcMined: Block[] = [
      assembleBlock(850430, btcTxs.slice(0, 50), 'mined', false),
      assembleBlock(850429, btcTxs.slice(50, 95), 'mined', false),
      assembleBlock(850428, btcTxs.slice(95, 135), 'mined', false),
    ];
    setBtcMinedBlocks(btcMined);

    const btcPending: Block[] = [
      assembleBlock(850431, btcTxs.slice(135, 150), 'pending', false),
      assembleBlock(850432, btcTxs.slice(150, 165), 'pending', false),
      assembleBlock(850433, btcTxs.slice(165, 180), 'pending', false),
    ];
    setBtcPendingBlocks(btcPending);
    setBtcPendingTxs(btcTxs.slice(135));
    setBtcSessionTxs(btcTxs.slice(135)); // Seed with active pending transactions

    // 2. Generate Noyeschain Mock Data (starts beautifully pre-filled)
    const nysTxs: Transaction[] = [];
    for (let i = 0; i < 40; i++) {
      nysTxs.push(createMockTransaction(true));
    }

    const nysMined: Block[] = [
      assembleBlock(420887, nysTxs.slice(0, 12), 'mined', true),
      assembleBlock(420886, nysTxs.slice(12, 22), 'mined', true),
      assembleBlock(420885, nysTxs.slice(22, 30), 'mined', true),
    ];
    setNysMinedBlocks(nysMined);

    const activeNysPending = nysTxs.slice(30);
    setNysPendingTxs(activeNysPending);
    setNysSessionTxs(activeNysPending); // Seed with active pending transactions
    
    const nysPending: Block[] = [
      assembleBlock(420888, activeNysPending, 'pending', true)
    ];
    setNysPendingBlocks(nysPending);

    // Set initial selected block as the Noyeschain pending block for maximum interactivity on load
    setSelectedBlock(nysPending[0]);
  }, []);

  // Set the selected block to the appropriate first pending block when network changes
  useEffect(() => {
    if (currentNetwork === 'bitcoin') {
      if (btcPendingBlocks.length > 0) {
        setSelectedBlock(btcPendingBlocks[0]);
      }
      setSelectedTransaction(null);
    } else {
      if (nysPendingBlocks.length > 0) {
        setSelectedBlock(nysPendingBlocks[0]);
      }
      setSelectedTransaction(null);
    }
  }, [currentNetwork, btcPendingBlocks, nysPendingBlocks]);

  // Noyeschain Live Transaction Generator Loop
  useEffect(() => {
    const txTimer = setInterval(() => {
      // Create new Noyeschain transaction
      const newTx = createMockTransaction(true);
      
      setNysPendingTxs(prev => {
        const updated = [newTx, ...prev];
        
        // Dynamically update pending blocks based on new incoming transaction
        setNysPendingBlocks(blocks => {
          const blockHeight = noyeschainStats.height;
          const assembled = assembleBlock(blockHeight, updated, 'pending', true);
          return [assembled];
        });

        // If the selected block is the active pending block, update it live!
        setSelectedBlock(curr => {
          if (curr && curr.status === 'pending' && curr.height === noyeschainStats.height) {
            return assembleBlock(noyeschainStats.height, updated, 'pending', true);
          }
          return curr;
        });

        return updated;
      });

      // Update session transaction list for metadata calculations
      setNysSessionTxs(prev => [newTx, ...prev]);

      // Increment stats slightly
      setNoyeschainStats(prev => ({
        ...prev,
        unconfirmedCount: prev.unconfirmedCount + 1,
        mempoolSize: prev.mempoolSize + newTx.size,
      }));

    }, 2500); // New tx every 2.5 seconds!

    return () => clearInterval(txTimer);
  }, [noyeschainStats.height]);

  // Noyeschain Auto-Miner Loop (Mines every 40 seconds)
  useEffect(() => {
    const miningTimer = setInterval(() => {
      mineNoyeschainBlock();
    }, 40000);

    return () => clearInterval(miningTimer);
  }, [nysPendingTxs, noyeschainStats.height]);

  // Mine Noyeschain Block Logic
  const mineNoyeschainBlock = () => {
    if (nysPendingTxs.length === 0) return;

    // Package all pending transactions into the block
    const blockHeight = noyeschainStats.height;
    const minedBlock = assembleBlock(blockHeight, nysPendingTxs, 'mined', true);

    // Flash celebration overlay
    setMinedBlockDetails(minedBlock);
    setMiningCelebration(true);
    setTimeout(() => {
      setMiningCelebration(false);
    }, 4500);

    // Update block lists
    setNysMinedBlocks(prev => [minedBlock, ...prev].slice(0, 10)); // Keep last 10
    
    // Clear the pending queue
    const nextHeight = blockHeight + 1;
    setNysPendingTxs([]);
    setNysPendingBlocks([assembleBlock(nextHeight, [], 'pending', true)]);

    // Update stats
    setNoyeschainStats(prev => ({
      ...prev,
      height: nextHeight,
      unconfirmedCount: 0,
      mempoolSize: 0,
    }));

    // If currently selected block was the mined one, point to the new pending one
    setSelectedBlock(assembleBlock(nextHeight, [], 'pending', true));
    setSelectedTransaction(null);
  };

  // Broadcast user-created transaction on Noyeschain
  const handleBroadcastNysTransaction = (tx: Transaction) => {
    setNysPendingTxs(prev => {
      const updated = [tx, ...prev];
      
      // Update pending blocks
      setNysPendingBlocks(blocks => {
        const assembled = assembleBlock(noyeschainStats.height, updated, 'pending', true);
        return [assembled];
      });

      // Update selected block if currently inspecting pending block
      setSelectedBlock(curr => {
        if (curr && curr.status === 'pending' && curr.height === noyeschainStats.height) {
          return assembleBlock(noyeschainStats.height, updated, 'pending', true);
        }
        return curr;
      });

      return updated;
    });

    // Add manually broadcasted transaction to the session tracker
    setNysSessionTxs(prev => [tx, ...prev]);

    setNoyeschainStats(prev => ({
      ...prev,
      unconfirmedCount: prev.unconfirmedCount + 1,
      mempoolSize: prev.mempoolSize + tx.size,
    }));
  };

  // Live Bitcoin mempool API fetcher
  const fetchBitcoinData = async () => {
    try {
      // Fetch current block height
      const heightRes = await fetch('https://mempool.space/api/blocks/tip/height');
      const height = await heightRes.json();

      // Fetch recommended fees
      const feesRes = await fetch('https://mempool.space/api/v1/fees/recommended');
      const fees = await feesRes.json();

      // Fetch unconfirmed mempool depth
      const mempoolRes = await fetch('https://mempool.space/api/mempool');
      const mempoolData = await mempoolRes.json();

      setBitcoinStats(prev => ({
        ...prev,
        height: height,
        unconfirmedCount: mempoolData.count,
        mempoolSize: mempoolData.vsize,
        averageFeeRate: fees.halfHourFee
      }));

      // Generate realistic pipeline from these live statistics
      const liveTxs: Transaction[] = [];
      for (let i = 0; i < 150; i++) {
        liveTxs.push(createMockTransaction(false, Math.floor(fees.hourFee + Math.random() * 50)));
      }

      setBtcMinedBlocks([
        assembleBlock(height, liveTxs.slice(0, 45), 'mined', false),
        assembleBlock(height - 1, liveTxs.slice(45, 85), 'mined', false),
        assembleBlock(height - 2, liveTxs.slice(85, 120), 'mined', false),
      ]);

      setBtcPendingBlocks([
        assembleBlock(height + 1, liveTxs.slice(120, 135), 'pending', false),
        assembleBlock(height + 2, liveTxs.slice(135, 145), 'pending', false),
        assembleBlock(height + 3, liveTxs.slice(145, 150), 'pending', false),
      ]);

      setBtcPendingTxs(liveTxs.slice(120));
      setBtcSessionTxs(liveTxs.slice(120)); // Seed with active pending transactions

    } catch (err) {
      console.warn('Could not fetch real-time Bitcoin mempool data. Falling back to active client-side simulation.', err);
    }
  };

  // Load and poll Bitcoin API data in real-time when user views Bitcoin network
  useEffect(() => {
    if (currentNetwork === 'bitcoin') {
      fetchBitcoinData();
      const interval = setInterval(() => {
        fetchBitcoinData();
      }, 15000); // Poll every 15 seconds for fresh on-chain data
      return () => clearInterval(interval);
    }
  }, [currentNetwork]);

  // Bitcoin High-Frequency Live Transaction Generator Loop
  useEffect(() => {
    if (currentNetwork !== 'bitcoin') return;

    const txTimer = setInterval(() => {
      // Create new Bitcoin transaction
      const newTx = createMockTransaction(false);
      
      setBtcPendingTxs(prev => {
        const updated = [newTx, ...prev];
        
        // Dynamically update pending blocks based on new incoming transaction
        setBtcPendingBlocks(blocks => {
          if (blocks.length === 0) return blocks;
          const height = bitcoinStats.height;
          return [
            assembleBlock(height + 1, updated.slice(0, 15), 'pending', false),
            assembleBlock(height + 2, updated.slice(15, 30), 'pending', false),
            assembleBlock(height + 3, updated.slice(30), 'pending', false),
          ];
        });

        // If the selected block is the active pending block, update it live!
        setSelectedBlock(curr => {
          if (curr && curr.status === 'pending' && curr.height === bitcoinStats.height + 1) {
            return assembleBlock(bitcoinStats.height + 1, updated.slice(0, 15), 'pending', false);
          }
          return curr;
        });

        return updated;
      });

      // Update session list
      setBtcSessionTxs(prev => [newTx, ...prev]);

      // Increment stats slightly
      setBitcoinStats(prev => ({
        ...prev,
        unconfirmedCount: prev.unconfirmedCount + 1,
        mempoolSize: prev.mempoolSize + newTx.size,
      }));

    }, 2500); // New tx every 2.5 seconds for instant feedback!

    return () => clearInterval(txTimer);
  }, [currentNetwork, bitcoinStats.height]);

  // Master Search Bar Handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');

    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();

    // 1. Search block height
    const blockNum = parseInt(query);
    if (!isNaN(blockNum)) {
      const activeMined = currentNetwork === 'bitcoin' ? btcMinedBlocks : nysMinedBlocks;
      const activePending = currentNetwork === 'bitcoin' ? btcPendingBlocks : nysPendingBlocks;

      const foundBlock = [...activeMined, ...activePending].find(b => b.height === blockNum);
      if (foundBlock) {
        setSelectedBlock(foundBlock);
        setSelectedTransaction(null);
        return;
      } else {
        setSearchError(`Blok #${blockNum} niet geladen of bevindt zich buiten de actuele mempool-pipeline.`);
        return;
      }
    }

    // 2. Search transaction hash
    const activeMined = currentNetwork === 'bitcoin' ? btcMinedBlocks : nysMinedBlocks;
    const activePending = currentNetwork === 'bitcoin' ? btcPendingBlocks : nysPendingBlocks;

    for (const b of [...activeMined, ...activePending]) {
      const foundTx = b.transactions.find(t => t.txid.toLowerCase() === query || t.txid.toLowerCase().startsWith(query));
      if (foundTx) {
        setSelectedBlock(b);
        setSelectedTransaction(foundTx);
        return;
      }
    }

    setSearchError('Transactiehash of blockhoogte niet gevonden in de momenteel geladen blockchain-segmenten.');
  };

  const activeMinedBlocks = currentNetwork === 'bitcoin' ? btcMinedBlocks : nysMinedBlocks;
  const activePendingBlocks = currentNetwork === 'bitcoin' ? btcPendingBlocks : nysPendingBlocks;
  const activePendingTxs = currentNetwork === 'bitcoin' ? btcPendingTxs : nysPendingTxs;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-purple-500/30 selection:text-white">
      {/* Dynamic Mining Celebration Banner */}
      <AnimatePresence>
        {miningCelebration && minedBlockDetails && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white font-mono rounded-2xl p-5 shadow-2xl max-w-md w-[90%] border border-emerald-400/30 flex flex-col items-center justify-center text-center backdrop-blur-md"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 text-2xl animate-bounce">
              🎉
            </div>
            <h3 className="text-md font-black tracking-tight uppercase">
              Nieuw Blok Gemined op Noyeschain!
            </h3>
            <p className="text-xs text-emerald-100 mt-1">
              Blokhoogte <span className="font-bold">#{minedBlockDetails.height}</span> is succesvol toegevoegd aan de blockchain door de Dylan Noyes Pixel Pool.
            </p>
            <div className="mt-3.5 pt-3 border-t border-white/10 w-full grid grid-cols-2 text-[10px] font-mono text-emerald-100">
              <div>
                <span>Reward:</span> <span className="font-bold text-white">50.0 NYS</span>
              </div>
              <div>
                <span>Txs Bevestigd:</span> <span className="font-bold text-white">{minedBlockDetails.txCount}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Top Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Coins className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                NOYESCHAIN <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/25 px-1.5 py-0.5 rounded-full font-mono font-bold">MEMPOOL v2</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                Dual Explorer & Visual ledger
              </p>
            </div>
          </div>

          {/* Core Master Search Bar */}
          <div className="w-full sm:w-96 flex flex-col items-stretch">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Zoek op blockhoogte of txid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-20 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[10px] font-mono border border-slate-700 transition cursor-pointer"
              >
                Zoek
              </button>
            </form>
            {searchError && (
              <span className="text-[10px] text-red-400 font-mono mt-1 pl-1">
                ⚠️ {searchError}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* Network Selector Cards */}
        <NetworkOverview
          bitcoinStats={bitcoinStats}
          noyeschainStats={noyeschainStats}
          currentNetwork={currentNetwork}
          onNetworkChange={setCurrentNetwork}
        />

        {/* Sovereign Reserve & Netwerk Beleidskader */}
        <SovereignRules currentNetwork={currentNetwork} />

        {/* Live Mempool Stats & Daily Metadata */}
        <MempoolStats
          currentNetwork={currentNetwork}
          minedBlocks={activeMinedBlocks}
          pendingBlocks={activePendingBlocks}
          pendingTxs={activePendingTxs}
          stats={currentNetwork === 'bitcoin' ? bitcoinStats : noyeschainStats}
          sessionTxs={currentNetwork === 'bitcoin' ? btcSessionTxs : nysSessionTxs}
        />

        {/* Live Mempool blocks conveyor belt */}
        <MempoolVisualizer
          minedBlocks={activeMinedBlocks}
          pendingBlocks={activePendingBlocks}
          currentNetwork={currentNetwork}
          selectedBlock={selectedBlock}
          onSelectBlock={setSelectedBlock}
        />

        {/* Live Advanced Filters & Search */}
        <TransactionFilter
          currentNetwork={currentNetwork}
          minedBlocks={activeMinedBlocks}
          pendingBlocks={activePendingBlocks}
          onSelectTransaction={setSelectedTransaction}
          onSelectBlock={setSelectedBlock}
        />

        {/* Block details section if a block is selected */}
        {selectedBlock && (
          <div id="block-grid-details">
            <BlockGrid
              block={selectedBlock}
              currentNetwork={currentNetwork}
              selectedTransaction={selectedTransaction}
              onSelectTransaction={setSelectedTransaction}
            />
          </div>
        )}

        {/* Charts & Graphs Panel */}
        <MempoolCharts
          transactions={activePendingTxs}
          currentNetwork={currentNetwork}
        />

        {/* Two-Column Interactivity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Noyeschain custom node panel & controls */}
          <div className="lg:col-span-2">
            <NoyeschainConsole
              currentNetwork={currentNetwork}
              onBroadcastTransaction={handleBroadcastNysTransaction}
              onMineBlockManually={mineNoyeschainBlock}
              pendingTxCount={nysPendingTxs.length}
            />
          </div>

          {/* Scrolling live transaction feed ticker */}
          <div>
            <TransactionList
              transactions={activePendingTxs}
              currentNetwork={currentNetwork}
              onSelectTransaction={setSelectedTransaction}
              selectedTransaction={selectedTransaction}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 mt-16 text-slate-500 font-mono text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <span className="text-slate-300 font-bold font-sans">
              Noyeschain & Bitcoin Mempool Visualizer
            </span>
            <span>
              Real-time block pipeline visualization, block pixel-mapping, and custom ledger verification.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Globe size={13} />
              <span>Noyeschain Mainnet 1.0</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span>Developer:</span>
              <span className="font-semibold text-purple-400">dylannoyespixel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
