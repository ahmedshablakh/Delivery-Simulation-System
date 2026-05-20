import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AlgorithmComparison({ stats, currentAlgorithm }: { stats: any, currentAlgorithm: string }) {
  const data = [
    { name: 'Rastgele', sure: parseFloat(stats.algorithmComparison.random.avgDeliveryTime.toFixed(1)) || 0, tamamlanan: stats.algorithmComparison.random.completedCount || 0 },
    { name: 'En Yakın', sure: parseFloat(stats.algorithmComparison.nearest.avgDeliveryTime.toFixed(1)) || 0, tamamlanan: stats.algorithmComparison.nearest.completedCount || 0 },
    { name: 'Akıllı (AI)', sure: parseFloat(stats.algorithmComparison.smart.avgDeliveryTime.toFixed(1)) || 0, tamamlanan: stats.algorithmComparison.smart.completedCount || 0 },
  ];

  const algoNames = {
    random: 'Rastgele Dağıtım',
    nearest: 'En Yakın Kurye',
    smart: 'Akıllı Dağıtım (AI)'
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 border-b border-dark-700 pb-1">
        <h2 className="text-sm font-bold text-white uppercase">ALGORİTMA KARŞILAŞTIRMASI</h2>
        <span className="text-[10px] font-semibold text-neon-purple border border-neon-purple/50 bg-neon-purple/10 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(181,23,158,0.4)]">
          Aktif: {algoNames[currentAlgorithm as keyof typeof algoNames]}
        </span>
      </div>
      <div className="flex-1 w-full mt-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis type="number" stroke="#64748b" fontSize={10} />
            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={70} />
            <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', color: '#fff' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Bar dataKey="sure" name="Ort. Süre (sn)" fill="#00F0FF" radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="tamamlanan" name="Tamamlanan Sipariş" fill="#00FF66" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
