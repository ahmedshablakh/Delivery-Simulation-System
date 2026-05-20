import type { Coordinate } from './types';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  neighbors: { nodeId: string; cost: number }[];
}

export const createCityMap = (): Map<string, GraphNode> => {
  const map = new Map<string, GraphNode>();
  
  // Denser Grid for organic city look
  const X_BASE = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const Y_BASE = [100, 175, 250, 325, 400, 475, 550];

  // 1. Create nodes with random offsets (Organic look)
  for (let i = 0; i < X_BASE.length; i++) {
    for (let j = 0; j < Y_BASE.length; j++) {
      const id = `${i}_${j}`;
      // Random offset to make roads slightly "wiggly" and natural
      // Keep river area mostly straight to align with bridges
      const isRiverArea = (X_BASE[i] >= 400 && X_BASE[i] <= 500);
      const offsetX = isRiverArea ? 0 : (Math.random() * 24 - 12);
      const offsetY = isRiverArea ? 0 : (Math.random() * 24 - 12);
      
      map.set(id, { 
         id, 
         x: X_BASE[i] + offsetX, 
         y: Y_BASE[j] + offsetY, 
         neighbors: [] 
      });
    }
  }

  // 2. Create edges
  for (let i = 0; i < X_BASE.length; i++) {
    for (let j = 0; j < Y_BASE.length; j++) {
      const current = map.get(`${i}_${j}`);
      if (!current) continue;

      // Connect to Right
      if (i < X_BASE.length - 1) {
        const isRiverCrossing = X_BASE[i] === 400 && X_BASE[i + 1] === 500;
        // Bridges only at specific Y indices (j=2 is y=250, j=4 is y=400)
        if (!isRiverCrossing || j === 2 || j === 4) {
           const right = map.get(`${i + 1}_${j}`);
           if (right) {
             const dist = Math.sqrt(Math.pow(current.x - right.x, 2) + Math.pow(current.y - right.y, 2));
             current.neighbors.push({ nodeId: right.id, cost: dist });
             right.neighbors.push({ nodeId: current.id, cost: dist });
           }
        }
      }

      // Connect to Bottom
      if (j < Y_BASE.length - 1) {
        const bottom = map.get(`${i}_${j + 1}`);
        if (bottom) {
          const dist = Math.sqrt(Math.pow(current.x - bottom.x, 2) + Math.pow(current.y - bottom.y, 2));
          current.neighbors.push({ nodeId: bottom.id, cost: dist });
          bottom.neighbors.push({ nodeId: current.id, cost: dist });
        }
      }
    }
  }

  return map;
};

export const cityGraph = createCityMap();
export const graphNodes = Array.from(cityGraph.values());

// Dijkstra's Algorithm
export const findShortestPath = (startId: string, endId: string): Coordinate[] => {
  if (startId === endId) {
    const node = cityGraph.get(startId);
    return node ? [{ x: node.x, y: node.y }] : [];
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const unvisited = new Set<string>();

  for (const nodeId of cityGraph.keys()) {
    distances.set(nodeId, Infinity);
    unvisited.add(nodeId);
  }
  distances.set(startId, 0);

  while (unvisited.size > 0) {
    let currentId = '';
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < minDistance) {
        minDistance = dist;
        currentId = nodeId;
      }
    }

    if (currentId === '' || currentId === endId) break;

    unvisited.delete(currentId);
    const node = cityGraph.get(currentId)!;

    for (const neighbor of node.neighbors) {
      if (!unvisited.has(neighbor.nodeId)) continue;
      
      const alt = distances.get(currentId)! + neighbor.cost;
      if (alt < distances.get(neighbor.nodeId)!) {
        distances.set(neighbor.nodeId, alt);
        previous.set(neighbor.nodeId, currentId);
      }
    }
  }

  const path: Coordinate[] = [];
  let curr: string | undefined = endId;
  while (curr) {
    const node = cityGraph.get(curr);
    if (node) {
      path.unshift({ x: node.x, y: node.y });
    }
    curr = previous.get(curr);
  }
  return path;
};
