import React from 'react';
import { Transaction, NetworkType } from '../types';
import { BarChart, AreaChart, TrendingUp, Info } from 'lucide-react';

interface MempoolChartsProps {
  transactions: Transaction[];
  currentNetwork: NetworkType;
}

export const MempoolCharts: React.FC<MempoolChartsProps> = ({
  transactions,
  currentNetwork,
}) => {
  const isNoyes = currentNetwork === 'noyeschain';

  // Group transactions by fee ranges
  const feeRanges = [
    { label: '1-2 sat', min: 1, max: 2, count: 0, color: '#22c55e' },
    { label: '3-8 sat', min: 3, max: 8, count: 0, color: '#10b981' },
    { label: '9-15 sat', min: 9, max: 15, count: 0, color: '#3b82f6' },
    { label: '16-30 sat', min: 16, max: 30, count: 0, color: '#eab308' },
    { label: '31-60 sat', min: 31, max: 60, count: 0, color: '#f97316' },
    { label: '61-120 sat', min: 61, max: 120, count: 0, color: '#ef4444' },
    { label: '121+ sat', min: 121, max: Infinity, count: 0, color: '#a855f7' },
  ];

  transactions.forEach((tx) => {
    for (const range of feeRanges) {
      if (tx.feeRate >= range.min && tx.feeRate <= range.max) {
        range.count++;
        break;
      }
    }
  });

  const maxCount = Math.max(...feeRanges.map(r => r.count), 1);

  // Generate mock mempool depth over last 7 periods for visual sparkle
  const depthHistory = isNoyes 
    ? [20, 35, 45, 30, 52, 68, transactions.length]
    : [340, 410, 390, 480, 520, 490, transactions.length];

  const maxHistory = Math.max(...depthHistory, 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Fee Distribution Chart */}
      <div className="bg-[#0c0c0c] rounded-none border border-white/10 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-md font-bold font-sans tracking-tight text-white flex items-center gap-2 mb-1">
            <BarChart size={16} className={isNoyes ? 'text-cyan-400' : 'text-orange-500'} />
            FEE TARIEVEN VERDELING (sat/vB)
          </h3>
          <p className="text-xs text-white/50 mb-5 font-sans">
            Verdeling van onbevestigde transactievolumes over verschillende tariefniveaus.
          </p>
        </div>

        {/* Custom Pure SVG/HTML Bar Chart */}
        <div className="bg-black rounded-none border border-white/15 p-4 h-48 flex items-end gap-3 justify-between relative">
          {feeRanges.map((range, idx) => {
            const heightPct = (range.count / maxCount) * 80; // keep max at 80% to leave room for counts

            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {/* Hover count badge */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#0d0d0d] border border-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-none font-mono z-10 whitespace-nowrap">
                  {range.count} txs
                </div>

                {/* The Bar */}
                <div 
                  className="w-full rounded-none transition-all duration-300 ease-out hover:brightness-115 cursor-pointer"
                  style={{ 
                    height: `${Math.max(2, heightPct)}%`, 
                    backgroundColor: range.color
                  }}
                />

                {/* X Axis Label */}
                <span className="text-[9px] text-white/40 font-mono mt-2 text-center w-full truncate font-bold uppercase">
                  {range.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mempool Depth Timeline Chart */}
      <div className="bg-[#0c0c0c] rounded-none border border-white/10 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-md font-bold font-sans tracking-tight text-white flex items-center gap-2 mb-1">
            <AreaChart size={16} className={isNoyes ? 'text-cyan-400' : 'text-orange-500'} />
            MEMPOOL DIEPTE VERLOOP
          </h3>
          <p className="text-xs text-white/50 mb-5 font-sans">
            Ontwikkeling van de onbevestigde wachtrijgrootte over de afgelopen 12 uur.
          </p>
        </div>

        {/* Custom Pure SVG Line/Area Chart */}
        <div className="bg-black rounded-none border border-white/15 p-4 h-48 relative overflow-hidden flex flex-col justify-between">
          <svg className="w-full h-[85%] absolute bottom-4 left-0 right-0 px-2" viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isNoyes ? '#22d3ee' : '#f97316'} stopOpacity="0.15" />
                <stop offset="100%" stopColor={isNoyes ? '#22d3ee' : '#f97316'} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2" />
            <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2" />
            <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2" />

            {/* Area under line */}
            <path
              d={`M 0 100 
                  L 0 ${100 - (depthHistory[0] / maxHistory) * 80} 
                  L 50 ${100 - (depthHistory[1] / maxHistory) * 80} 
                  L 100 ${100 - (depthHistory[2] / maxHistory) * 80} 
                  L 150 ${100 - (depthHistory[3] / maxHistory) * 80} 
                  L 200 ${100 - (depthHistory[4] / maxHistory) * 80} 
                  L 250 ${100 - (depthHistory[5] / maxHistory) * 80} 
                  L 300 ${100 - (depthHistory[6] / maxHistory) * 80} 
                  L 300 100 Z`}
              fill="url(#chartGlow)"
            />

            {/* Line plot */}
            <path
              d={`M 0 ${100 - (depthHistory[0] / maxHistory) * 80} 
                  L 50 ${100 - (depthHistory[1] / maxHistory) * 80} 
                  L 100 ${100 - (depthHistory[2] / maxHistory) * 80} 
                  L 150 ${100 - (depthHistory[3] / maxHistory) * 80} 
                  L 200 ${100 - (depthHistory[4] / maxHistory) * 80} 
                  L 250 ${100 - (depthHistory[5] / maxHistory) * 80} 
                  L 300 ${100 - (depthHistory[6] / maxHistory) * 80}`}
              fill="none"
              stroke={isNoyes ? '#22d3ee' : '#f97316'}
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Glowing dots */}
            {depthHistory.map((val, idx) => (
              <circle
                key={idx}
                cx={idx * 50}
                cy={100 - (val / maxHistory) * 80}
                r="3"
                fill="#ffffff"
                stroke={isNoyes ? '#22d3ee' : '#f97316'}
                strokeWidth="1.5"
              />
            ))}
          </svg>

          {/* X Axis Time Labels */}
          <div className="absolute bottom-1 left-0 right-0 px-4 flex justify-between text-[8px] font-mono font-bold text-white/30 uppercase tracking-widest">
            <span>-12u</span>
            <span>-10u</span>
            <span>-8u</span>
            <span>-6u</span>
            <span>-4u</span>
            <span>-2u</span>
            <span>NU</span>
          </div>
        </div>
      </div>
    </div>
  );
};
