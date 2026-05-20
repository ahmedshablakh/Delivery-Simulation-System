import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip } from 'recharts';
import type { Driver, Order } from '../simulation/types';

const DRIVER_COLORS = [
  '#FFDE00', '#FF0055', '#00FF66', '#B5179E', '#F72585', '#4CC9F0', 
  '#FF9F1C', '#C1FF00', '#9D4EDD', '#FF4365', '#00F5D4', '#F9C80E'
];

export default function ReportsAndCharts({ stats, drivers, orders, simulationTime }: { stats: any, drivers: Driver[], orders: Order[], simulationTime: number }) {
  
  // Canlı Sipariş Süre Dağılımı Analizi
  const deliveredOrders = orders.filter(o => o.status === 'delivered' && o.deliveredTime);
  let under15 = 0; let between15and30 = 0; let between30and45 = 0; let over45 = 0;

  deliveredOrders.forEach(o => {
     const time = o.deliveredTime! - o.createdTime;
     if (time < 15) under15++;
     else if (time < 30) between15and30++;
     else if (time < 45) between30and45++;
     else over45++;
  });

  const pieData = deliveredOrders.length > 0 ? [
    { name: '< 15sn', value: under15 },
    { name: '15-30sn', value: between15and30 },
    { name: '30-45sn', value: between30and45 },
    { name: '> 45sn', value: over45 },
  ] : [
    { name: 'Henüz Veri Yok', value: 1 }
  ];

  const COLORS = ['#00FF66', '#00F0FF', '#FFDE00', '#FF0055'];
  const NO_DATA_COLOR = ['#334155'];

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-bold text-white mb-2 border-b border-dark-700 pb-1 flex justify-between items-center">
         <span>PERFORMANS RAPORLARI</span>
         <span className="text-[10px] bg-dark-700 px-2 py-0.5 rounded text-slate-300">Canlı Analiz</span>
      </h2>
      
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-1/3 flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Teslimat Süresi Dağılımı</span>
          <div className="flex-1 w-full relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value" stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={deliveredOrders.length > 0 ? COLORS[index % COLORS.length] : NO_DATA_COLOR[0]} />
                  ))}
                </Pie>
                {deliveredOrders.length > 0 && <PieTooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', color: '#fff', fontSize: '10px' }} />}
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500">{deliveredOrders.length} Teslimat Baz Alındı</div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[10px] uppercase bg-dark-900 text-slate-400 sticky top-0">
              <tr>
                <th className="py-1.5 px-2">KURYE</th>
                <th className="py-1.5 px-2 text-center">Sipariş</th>
                <th className="py-1.5 px-2 text-center">Ort. Süre</th>
                <th className="py-1.5 px-2 text-right">Kullanım (Efor)</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d, index) => {
                const utilNum = simulationTime > 0 ? ((d.stats.activeTime / simulationTime) * 100) : 0;
                const util = Math.min(100, utilNum).toFixed(0);
                const uniqueColor = DRIVER_COLORS[index % DRIVER_COLORS.length];
                
                return (
                  <tr key={d.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                    <td className="py-2 px-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ color: uniqueColor, backgroundColor: uniqueColor }}></span>
                      <span className="font-semibold text-white">{d.name}</span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono">{d.stats.deliveredCount}</td>
                    <td className="py-2 px-2 text-center font-mono">{(d.stats.totalDeliveryTime / Math.max(1, d.stats.deliveredCount)).toFixed(1)}s</td>
                    <td className="py-2 px-2">
                       <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-[10px]" style={{ color: uniqueColor }}>%{util}</span>
                          <div className="w-full bg-dark-900 rounded-full h-1 border border-dark-700">
                             <div className="h-full rounded-full transition-all duration-300" style={{ width: `${util}%`, backgroundColor: uniqueColor }}></div>
                          </div>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
