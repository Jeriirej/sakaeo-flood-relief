import React, { useState } from 'react';
import { CloudRain, Waves, AlertTriangle, ChevronDown, ChevronUp, Bell, Info } from 'lucide-react';

export default function WeatherAlertBanner({ weatherAlert }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weatherAlert) return null;

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border-b border-red-700/40 text-slate-100 shadow-md w-full max-w-full overflow-hidden shrink-0 select-none">
      <div className="w-full px-2.5 sm:px-4 lg:px-6 py-1 sm:py-1.5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Main Ticker / Headline */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-red-600/30 border border-red-500/50 flex items-center justify-center shrink-0 text-red-400">
              <CloudRain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
            </div>
            <div className="text-[11px] sm:text-xs min-w-0 flex-1 flex items-center gap-1.5 overflow-hidden">
              <span className="font-bold text-red-300 shrink-0 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-none">{weatherAlert.headline}</span>
              </span>
              <span className="hidden sm:inline text-slate-300 truncate text-[11px]">
                • {weatherAlert.rainfallForecast}
              </span>
              <span className="text-[9px] sm:text-[10px] bg-red-900/60 text-red-200 px-1.5 py-0.2 rounded border border-red-700/50 font-mono shrink-0">
                {weatherAlert.forecastPeriod}
              </span>
            </div>
          </div>

          {/* Quick River Status Pills (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {weatherAlert.riverStations?.map((station, idx) => (
              <div 
                key={idx}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 border ${
                  station.color === 'red' 
                    ? 'bg-rose-950/70 border-rose-600/50 text-rose-300' 
                    : 'bg-amber-950/70 border-amber-600/50 text-amber-300'
                }`}
              >
                <Waves className="w-2.5 h-2.5" />
                <span className="font-semibold">{station.name}:</span>
                <span>{station.status}</span>
              </div>
            ))}
          </div>

          {/* Toggle Expand */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-red-300 hover:text-white px-2 py-0.5 rounded-lg bg-red-900/40 hover:bg-red-900/70 border border-red-700/50 transition-colors"
            >
              <span>{isExpanded ? 'ย่อ' : 'ระดับน้ำ 3 คลอง'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Panel: Detailed River Station Watch */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
            {weatherAlert.riverStations?.map((station, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-200">
                    <Waves className="w-4 h-4 text-cyan-400" />
                    <span>{station.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    station.color === 'red' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {station.color === 'red' ? 'วิกฤต' : 'เฝ้าระวัง'}
                  </span>
                </div>
                <div className="mt-2 text-xs">
                  <div className="text-slate-300 font-medium">ระดับน้ำ: <span className="text-white font-bold">{station.status}</span></div>
                  <div className="text-[11px] text-slate-400 mt-0.5">แนวโน้ม: {station.trend}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
