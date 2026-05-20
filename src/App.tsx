import { useState } from 'react';
import { useSimulation } from './simulation/useSimulation';

// Geçici bileşenler - bunları daha sonra dolduracağız.
import SimulationMap from './components/SimulationMap';
import ControlPanel from './components/ControlPanel';
import LiveStats from './components/LiveStats';
import AlgorithmComparison from './components/AlgorithmComparison';
import ReportsAndCharts from './components/ReportsAndCharts';
import OrderDetails from './components/OrderDetails';

function App() {
  const simulation = useSimulation();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-900 text-slate-300 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-dark-800 border-b border-dark-700 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-neon-blue/10 flex items-center justify-center border border-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.5)]">
            <span className="text-neon-blue font-bold text-xl">🚀</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider">YEMEK TESLİMATI SİMÜLASYONU</h1>
            <p className="text-xs text-neon-blue uppercase tracking-widest opacity-80">Akıllı Lojistik Merkezi</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-dark-900 px-4 py-1.5 rounded border border-dark-700 text-sm flex gap-2 items-center">
            <span className="text-slate-400">Canlı Süre:</span>
            <span className="text-neon-green font-mono text-lg font-bold">{Math.floor(simulation.simulationTime / 60)}:{(Math.floor(simulation.simulationTime) % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      {/* Main Grid: Yüksekliği header çıktıktan sonra kalan alana sığdırıyoruz */}
      <main className="flex-1 grid grid-cols-12 grid-rows-[2fr_1fr] gap-4 p-4 overflow-hidden">
        
        {/* Üst Kısım */}
        {/* Sol Panel - Control Panel */}
        <div className="col-span-3 row-span-1 bg-dark-800 rounded-xl border border-dark-700 p-4 overflow-y-auto flex flex-col gap-4 shadow-lg">
          <ControlPanel simulation={simulation} />
        </div>

        {/* Orta - Map */}
        <div className="col-span-6 row-span-1 bg-dark-800 rounded-xl border border-dark-700 relative overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <SimulationMap simulation={simulation} />
        </div>

        {/* Sağ Panel - Live Stats */}
        <div className="col-span-3 row-span-1 bg-dark-800 rounded-xl border border-dark-700 p-4 overflow-y-auto shadow-lg">
          <LiveStats stats={simulation.stats} />
        </div>


        {/* Alt Kısım */}
        {/* Alt Sol - Algorithm Comparison */}
        <div className="col-span-4 row-span-1 bg-dark-800 rounded-xl border border-dark-700 p-4 overflow-y-auto shadow-lg">
          <AlgorithmComparison stats={simulation.stats} currentAlgorithm={simulation.settings.algorithm} />
        </div>

        {/* Alt Orta - Reports & Charts */}
        <div className="col-span-5 row-span-1 bg-dark-800 rounded-xl border border-dark-700 p-4 overflow-y-auto shadow-lg">
          <ReportsAndCharts stats={simulation.stats} drivers={simulation.drivers} orders={simulation.orders} simulationTime={simulation.simulationTime} />
        </div>

        {/* Alt Sağ - Order Details */}
        <div className="col-span-3 row-span-1 bg-dark-800 rounded-xl border border-dark-700 p-4 overflow-y-auto shadow-lg">
          <OrderDetails 
            orderId={selectedOrderId} 
            onSelectOrder={setSelectedOrderId}
            orders={simulation.orders} 
            drivers={simulation.drivers} 
            restaurants={simulation.restaurants}
            simulationTime={simulation.simulationTime}
          />
        </div>

      </main>

    </div>
  );
}

export default App;
