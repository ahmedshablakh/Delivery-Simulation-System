import React, { useEffect, useRef } from 'react';
import { graphNodes } from '../simulation/pathfinding';

export default function SimulationMap({ simulation }: { simulation: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const DRIVER_COLORS = [
      '#FFDE00', // Neon Yellow
      '#FF0055', // Neon Pink
      '#00FF66', // Neon Green
      '#B5179E', // Purple
      '#F72585', // Magenta
      '#4CC9F0', // Sky Blue
      '#FF9F1C', // Orange
      '#C1FF00', // Lime
      '#9D4EDD', // Deep Purple
      '#FF4365', // Coral
      '#00F5D4', // Mint
      '#F9C80E'  // Gold
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // --- BACKGROUND CITY BLOCKS ---
      ctx.fillStyle = '#0B0F19'; // Deep background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Subtle background grid pattern
      ctx.strokeStyle = '#151C2C';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // --- ROADS (ORGANIC NETWORK) ---
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const drawRoadPaths = () => {
         const drawnEdges = new Set<string>();
         graphNodes.forEach(node => {
            node.neighbors.forEach(nb => {
               const edgeId = [node.id, nb.nodeId].sort().join('-');
               if (!drawnEdges.has(edgeId)) {
                  drawnEdges.add(edgeId);
                  const nNode = graphNodes.find(n => n.id === nb.nodeId);
                  if (nNode) {
                     ctx.moveTo(node.x, node.y);
                     ctx.lineTo(nNode.x, nNode.y);
                  }
               }
            });
         });
      };

      ctx.beginPath();
      drawRoadPaths();
      ctx.stroke();

      // Dashed lines
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      drawRoadPaths();
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Draw Intersections
      ctx.fillStyle = '#0B0F19';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      graphNodes.forEach(node => {
         ctx.beginPath(); ctx.arc(node.x, node.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });

      // --- RIVER & BRIDGES ---
      const riverGradient = ctx.createLinearGradient(375, 0, 425, 0);
      riverGradient.addColorStop(0, 'rgba(0, 240, 255, 0.05)');
      riverGradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.25)');
      riverGradient.addColorStop(1, 'rgba(0, 240, 255, 0.05)');
      ctx.fillStyle = riverGradient;
      ctx.fillRect(375, 0, 50, 650);

      // Bridges
      const drawBridge = (y: number) => {
        // Bridge surface
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(375, y - 20, 50, 40);
        // Bridge glowing borders
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00F0FF';
        ctx.beginPath(); ctx.moveTo(375, y - 20); ctx.lineTo(425, y - 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(375, y + 20); ctx.lineTo(425, y + 20); ctx.stroke();
        ctx.shadowBlur = 0;
      };
      drawBridge(250);
      drawBridge(400);

      // --- TRAFFIC ZONES ---
      simulation.trafficZones.forEach((tz: any) => {
        // Add a slight pulse effect
        const pulse = 1 + Math.sin(Date.now() / 300) * 0.05; 
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(tz.x, tz.y, 0, tz.x, tz.y, tz.radius * pulse);
        gradient.addColorStop(0, `rgba(255, 0, 85, ${tz.intensity * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 0, 85, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(tz.x, tz.y, tz.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- ROUTES (DASHED GLOW LINES) ---
      simulation.drivers.forEach((d: any, index: number) => {
        if (d.status !== 'idle' && d.route.length > 0 && d.pathIndex < d.route.length) {
          const uniqueColor = DRIVER_COLORS[index % DRIVER_COLORS.length];
          ctx.beginPath();
          ctx.strokeStyle = uniqueColor; 
          ctx.globalAlpha = 0.6; // transparency
          ctx.lineWidth = 3;
          ctx.shadowBlur = 8;
          ctx.shadowColor = uniqueColor;
          // Flowing dash effect using time
          const dashOffset = -Date.now() / 50;
          ctx.setLineDash([8, 8]);
          ctx.lineDashOffset = dashOffset;
          
          ctx.moveTo(d.x, d.y);
          for (let i = d.pathIndex; i < d.route.length; i++) {
             ctx.lineTo(d.route[i].x, d.route[i].y);
          }
          ctx.stroke();
          ctx.setLineDash([]); // reset
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
        }
      });

      // --- CUSTOMERS (NEON HOUSES) ---
      simulation.customers.forEach((c: any) => {
        ctx.save();
        ctx.translate(c.x, c.y);
        
        ctx.fillStyle = '#00FF66';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00FF66';
        ctx.beginPath();
        ctx.moveTo(0, -8); // Roof top
        ctx.lineTo(8, -1); // Right roof
        ctx.lineTo(6, -1);
        ctx.lineTo(6, 8);  // Right wall
        ctx.lineTo(-6, 8); // Floor
        ctx.lineTo(-6, -1); // Left wall
        ctx.lineTo(-8, -1); // Left roof
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Label
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(c.name, c.x, c.y + 20);

        // Waiting signal
        const isWaiting = simulation.orders.some((o: any) => o.customerId === c.id && o.status !== 'delivered');
        if (isWaiting) {
          ctx.fillStyle = `rgba(255, 170, 0, ${0.4 + Math.sin(Date.now() / 150) * 0.6})`; // Pulsing orange
          ctx.beginPath(); ctx.arc(c.x, c.y - 16, 4, 0, Math.PI * 2); ctx.fill();
        }
      });

      // --- RESTAURANTS (STOREFRONTS) ---
      simulation.restaurants.forEach((r: any) => {
        ctx.save();
        ctx.translate(r.x, r.y);

        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FFDE00';
        
        // Base building
        ctx.fillStyle = '#B45309'; // dark orange body
        ctx.fillRect(-12, -4, 24, 16);
        
        // Awning / Roof (Yellow glowing)
        ctx.fillStyle = '#FFDE00';
        ctx.beginPath();
        ctx.moveTo(-14, -4);
        ctx.lineTo(-10, -12);
        ctx.lineTo(10, -12);
        ctx.lineTo(14, -4);
        ctx.closePath();
        ctx.fill();

        // Door
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(-4, 4, 8, 8);

        ctx.restore();

        // Label
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(r.name, r.x, r.y - 18);

        // Pending Orders Badge
        const pendingCount = simulation.orders.filter((o: any) => o.restaurantId === r.id && o.status === 'pending').length;
        if (pendingCount > 0) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FF0055';
          ctx.fillStyle = '#FF0055';
          ctx.beginPath(); ctx.arc(r.x + 16, r.y - 16, 9, 0, Math.PI * 2); ctx.fill();
          
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 10px Inter';
          ctx.fillText(pendingCount.toString(), r.x + 16, r.y - 13);
        }
      });

      // --- DRIVERS (DIRECTIONAL VEHICLES) ---
      simulation.drivers.forEach((d: any, index: number) => {
        ctx.save();
        ctx.translate(d.x, d.y);

        const uniqueColor = DRIVER_COLORS[index % DRIVER_COLORS.length];
        // Idle is generic blue, Busy takes the unique color
        const color = d.status === 'idle' ? '#00F0FF' : uniqueColor;
        
        // Calculate rotation
        let angle = -Math.PI / 2; // Default facing up
        if (d.status !== 'idle' && d.route.length > 0 && d.pathIndex < d.route.length) {
            const target = d.route[d.pathIndex];
            if (target.x !== d.x || target.y !== d.y) {
              angle = Math.atan2(target.y - d.y, target.x - d.x);
            }
        }
        ctx.rotate(angle);

        // Draw futuristic arrowhead/scooter
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        
        ctx.beginPath();
        ctx.moveTo(10, 0); // Nose
        ctx.lineTo(-8, -7); // Left wing
        ctx.lineTo(-4, 0);  // Back center engine
        ctx.lineTo(-8, 7);  // Right wing
        ctx.closePath();
        ctx.fill();

        // Engine glow if moving
        if (d.status !== 'idle') {
          ctx.fillStyle = '#FFF';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FFF';
          ctx.beginPath();
          ctx.arc(-6, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        
        // Label
        ctx.fillStyle = '#FFF'; 
        ctx.font = 'bold 9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(d.name, d.x, d.y + 18);
      });

      // --- WEATHER OVERLAY ---
      if (simulation.settings.weather === 'rainy') {
        ctx.fillStyle = 'rgba(0, 150, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Simple rain drops moving
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.4)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 40; i++) {
           const dropX = ((Date.now() / 20 + i * 50) % canvas.width);
           const dropY = ((Date.now() / 5 + i * 70) % canvas.height);
           ctx.beginPath();
           ctx.moveTo(dropX, dropY);
           ctx.lineTo(dropX - 5, dropY + 20);
           ctx.stroke();
        }

        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('🌧️ HAVA YAĞMURLU (Kuryeler %20 yavaş)', 20, 30);
      } else if (simulation.settings.weather === 'snowy') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Simple snow flakes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 40; i++) {
           const flakeX = ((Math.sin(Date.now() / 1000 + i) * 20 + i * 50) % canvas.width);
           // Prevent negative modulo bug by adding width:
           const safeX = (flakeX + canvas.width) % canvas.width;
           const safeY = ((Date.now() / 10 + i * 40) % canvas.height);
           ctx.beginPath();
           ctx.arc(safeX, safeY, 2, 0, Math.PI * 2);
           ctx.fill();
        }

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('❄️ HAVA KARLI (Kuryeler %40 yavaş)', 20, 30);
      }
    };

    const renderLoop = () => {
      draw();
      animationFrame = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => cancelAnimationFrame(animationFrame);
  }, [simulation.drivers, simulation.restaurants, simulation.customers, simulation.trafficZones, simulation.settings.weather]);

  return (
    <canvas 
      ref={canvasRef} 
      width={1000} 
      height={650} 
      className="w-full h-full object-contain"
    />
  );
}
