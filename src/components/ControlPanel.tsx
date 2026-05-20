import React from 'react';
import { Play, Square, RotateCcw, Pause } from 'lucide-react';

export default function ControlPanel({ simulation }: { simulation: any }) {
  const { isRunning, setIsRunning, settings, setSettings, resetSimulation } = simulation;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-white mb-4 border-b border-dark-700 pb-2">KONTROL PANELİ</h2>
      
      {/* Simulation Controls */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {!isRunning ? (
          <button 
            onClick={() => setIsRunning(true)}
            className="flex items-center justify-center gap-2 bg-neon-green/20 text-neon-green border border-neon-green rounded py-2 hover:bg-neon-green/30 transition-colors"
          >
            <Play size={16} /> Başlat
          </button>
        ) : (
          <button 
            onClick={() => setIsRunning(false)}
            className="flex items-center justify-center gap-2 bg-neon-yellow/20 text-neon-yellow border border-neon-yellow rounded py-2 hover:bg-neon-yellow/30 transition-colors"
          >
            <Pause size={16} /> Duraklat
          </button>
        )}
        
        <button 
          onClick={resetSimulation}
          className="flex items-center justify-center gap-2 bg-neon-rose/20 text-neon-rose border border-neon-rose rounded py-2 hover:bg-neon-rose/30 transition-colors"
        >
          <RotateCcw size={16} /> Sıfırla
        </button>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-1 flex justify-between">
            <span>Kurye Sayısı: {settings.driverCount}</span>
          </label>
          <input 
            type="range" min="1" max="20" 
            value={settings.driverCount} 
            onChange={(e) => setSettings({...settings, driverCount: parseInt(e.target.value)})}
            className="w-full accent-neon-blue"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 flex justify-between">
            <span>Kurye Hızı: %{settings.driverSpeedPercent}</span>
          </label>
          <input 
            type="range" min="50" max="300" step="10"
            value={settings.driverSpeedPercent} 
            onChange={(e) => setSettings({...settings, driverSpeedPercent: parseInt(e.target.value)})}
            className="w-full accent-neon-blue"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 flex justify-between">
            <span>Maksimum Bekleyen Sipariş: {settings.maxOrders}</span>
          </label>
          <input 
            type="range" min="10" max="150" step="5"
            value={settings.maxOrders}
            onChange={(e) => setSettings({...settings, maxOrders: parseInt(e.target.value)})}
            className="w-full accent-neon-pink"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Sipariş Akış Hızı</label>
          <select 
            value={settings.orderFrequency}
            onChange={(e) => setSettings({...settings, orderFrequency: e.target.value as any})}
            className="w-full bg-dark-900 border border-dark-700 rounded p-1.5 text-sm outline-none focus:border-neon-pink"
          >
            <option value="slow">Yavaş (6 sn'de 1)</option>
            <option value="normal">Normal (3 sn'de 1)</option>
            <option value="fast">Yoğun (1 sn'de 1)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Trafik Yoğunluğu</label>
          <select 
            value={settings.trafficLevel}
            onChange={(e) => setSettings({...settings, trafficLevel: e.target.value})}
            className="w-full bg-dark-900 border border-dark-700 rounded p-1.5 text-sm outline-none focus:border-neon-blue"
          >
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Hava Durumu</label>
          <select 
            value={settings.weather}
            onChange={(e) => setSettings({...settings, weather: e.target.value})}
            className="w-full bg-dark-900 border border-dark-700 rounded p-1.5 text-sm outline-none focus:border-neon-green"
          >
            <option value="sunny">☀️ Güneşli</option>
            <option value="rainy">🌧️ Yağmurlu (-%20 Hız)</option>
            <option value="snowy">❄️ Karlı (-%40 Hız)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Dağıtım Algoritması</label>
          <select 
            value={settings.algorithm}
            onChange={(e) => setSettings({...settings, algorithm: e.target.value})}
            className="w-full bg-dark-900 border border-dark-700 rounded p-1.5 text-sm outline-none focus:border-neon-purple text-neon-purple"
          >
            <option value="random">Rastgele Dağıtım</option>
            <option value="nearest">En Yakın Kurye</option>
            <option value="smart">Akıllı Dağıtım (AI)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
