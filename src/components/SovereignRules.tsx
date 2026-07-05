import React from 'react';
import { NetworkType } from '../types';
import { ShieldCheck, AlertTriangle, Coins, TrendingUp, Landmark, Calendar, Sparkles } from 'lucide-react';

interface SovereignRulesProps {
  currentNetwork: NetworkType;
}

export const SovereignRules: React.FC<SovereignRulesProps> = ({ currentNetwork }) => {
  const isNoyes = currentNetwork === 'noyeschain';

  return (
    <div className="bg-[#0c0c0c] border border-white/10 p-6 mb-8 relative overflow-hidden">
      {/* Top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-cyan-500" />

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-md font-bold font-sans tracking-tight text-white flex items-center gap-2 uppercase">
            <Landmark size={18} className="text-cyan-400" />
            Sovereign Reserve & Netwerk Beleidskader
          </h3>
          <p className="text-xs text-white/50 mt-1 font-sans">
            Systeemparameters, institutionele reserves en operationele richtlijnen van het Noyeschain-netwerk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 font-mono font-bold uppercase tracking-wider">
            Sovereign Focus: Beveiligd
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: De Primaire Settlement Unit */}
        <div className="bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Coins size={14} />
              <span>1. Primaire Settlement Unit</span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-mono font-black text-white">NOYES (NYS)</span>
              <span className="text-[9px] font-mono font-bold bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 border border-cyan-400/20">NATIVE COIN</span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Dit is de primaire, native eenheid van het netwerk. Conform de vaste systeemparameters fungeert deze coin als de basis voor alle on-chain afwikkelingen, transactieverificaties en de verankering van contracten binnen de architectuur.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>Systeemcontrole: Gecertificeerd</span>
          </div>
        </div>

        {/* Column 2: Gekoppelde Institutionele Waarden */}
        <div className="bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <TrendingUp size={14} />
              <span>2. Gekoppelde Institutionele Waarden</span>
            </div>

            <div className="space-y-3.5">
              <div className="border-l-2 border-orange-500 pl-3">
                <div className="text-xs font-mono font-bold text-white uppercase">BTC (Bitcoin)</div>
                <p className="text-[11px] text-white/60 leading-relaxed mt-0.5 font-sans">
                  Volledig cross-chain ondersteund via de gepatenteerde Core Matrix. Bitcoin fungeert binnen het netwerk als de primaire asset voor high-yield handelssessies en strategische reserve-opbouw.
                </p>
              </div>

              <div className="border-l-2 border-emerald-500 pl-3">
                <div className="text-xs font-mono font-bold text-white uppercase">EUR (Euro)</div>
                <p className="text-[11px] text-white/60 leading-relaxed mt-0.5 font-sans">
                  De wettelijke fiat-valuta-eenheid die binnen het netwerk (conform de vaste voorschriften strikt aangeduid als <strong className="text-white font-semibold">'Euro'</strong> of <strong className="text-white font-semibold">'EUR'</strong>) wordt gebruikt voor het waarderen van institutionele tranches, volumes en reële betalingstransacties.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase">
            <Sparkles size={12} className="text-orange-400 animate-spin" />
            <span>Core Matrix: Gekoppeld</span>
          </div>
        </div>

        {/* Column 3: Netwerk-beperking */}
        <div className="bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <AlertTriangle size={14} />
              <span>3. Netwerk-beperking (Februari 2026)</span>
            </div>

            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-none mb-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-red-400 uppercase tracking-wider mb-1">
                <Calendar size={12} />
                <span>Permanent stopgezet</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-sans">
                Sinds begin februari 2026 is de uitrol van externe tokens of memecoins op het netwerk permanent stopgezet om de focus volledig te leggen op de stabiliteit van de hoofdreserves van de Sovereign Reserve.
              </p>
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed font-sans">
              Geen nieuwe token-aanvragen of meme-contracten worden gevalideerd door Dylan Noyes Pixel Miner Pool of gecertificeerde validators.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-red-400 uppercase font-bold">
            <AlertTriangle size={12} />
            <span>Niet-Overschrijdbaar Voorschrift</span>
          </div>
        </div>

      </div>

      {/* Decorative Matrix Grid Stats */}
      <div className="mt-5 pt-3.5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] font-mono text-white/40 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-cyan-400" />
          <span>Sovereign Reserve Status: <strong className="text-white font-bold">OPTIMAAL</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-orange-400" />
          <span>Cross-Chain Matrix: <strong className="text-white font-bold">100% OPERATIONEEL</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-400" />
          <span>Wettelijke Valuta: <strong className="text-emerald-400 font-bold">EUR (EURO) VALUATIE</strong></span>
        </div>
      </div>
    </div>
  );
};
