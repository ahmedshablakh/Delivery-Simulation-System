import math
import random

# Fixed seed for repeatable map generation matching frontend
random.seed(42)

X_BASE = [100, 200, 300, 400, 500, 600, 700, 800, 900]
Y_BASE = [100, 175, 250, 325, 400, 475, 550]

class GraphNode:
    def __init__(self, node_id: str, x: float, y: float):
        self.id = node_id
        self.x = x
        self.y = y
        self.neighbors = []  # List of dict: {"nodeId": str, "cost": float}

def create_city_map():
    nodes_map = {}
    
    # 1. Create nodes with random offsets (exact replicate of typescript logic)
    for i in range(len(X_BASE)):
        for j in range(len(Y_BASE)):
            node_id = f"{i}_{j}"
            is_river_area = (400 <= X_BASE[i] <= 500)
            offset_x = 0 if is_river_area else (random.random() * 24 - 12)
            offset_y = 0 if is_river_area else (random.random() * 24 - 12)
            
            nodes_map[node_id] = GraphNode(
                node_id,
                X_BASE[i] + offset_x,
                Y_BASE[j] + offset_y
            )
            
    # 2. Create edges
    for i in range(len(X_BASE)):
        for j in range(len(Y_BASE)):
            node_id = f"{i}_{j}"
            current = nodes_map.get(node_id)
            if not current:
                continue
                
            # Connect to Right
            if i < len(X_BASE) - 1:
                is_river_crossing = (X_BASE[i] == 400 and X_BASE[i+1] == 500)
                if not is_river_crossing or j == 2 or j == 4:
                    right_id = f"{i+1}_{j}"
                    right = nodes_map.get(right_id)
                    if right:
                        dist = math.hypot(current.x - right.x, current.y - right.y)
                        current.neighbors.append({"nodeId": right.id, "cost": dist})
                        right.neighbors.append({"nodeId": current.id, "cost": dist})
                        
            # Connect to Bottom
            if j < len(Y_BASE) - 1:
                bottom_id = f"{i}_{j+1}"
                bottom = nodes_map.get(bottom_id)
                if bottom:
                    dist = math.hypot(current.x - bottom.x, current.y - bottom.y)
                    current.neighbors.append({"nodeId": bottom.id, "cost": dist})
                    bottom.neighbors.append({"nodeId": current.id, "cost": dist})
                    
    return nodes_map

city_graph = create_city_map()
graph_nodes = list(city_graph.values())

def find_shortest_path(start_id: str, end_id: str):
    if start_id == end_id:
        node = city_graph.get(start_id)
        return [{"x": node.x, "y": node.y}] if node else []
        
    distances = {node_id: float('inf') for node_id in city_graph.keys()}
    previous = {}
    unvisited = set(city_graph.keys())
    
    distances[start_id] = 0.0
    
    while unvisited:
        # Get unvisited node with min distance
        current_id = min(unvisited, key=lambda n: distances[n])
        if distances[current_id] == float('inf') or current_id == end_id:
            break
            
        unvisited.remove(current_id)
        node = city_graph[current_id]
        
        for neighbor in node.neighbors:
            neighbor_id = neighbor["nodeId"]
            if neighbor_id not in unvisited:
                continue
                
            alt = distances[current_id] + neighbor["cost"]
            if alt < distances[neighbor_id]:
                distances[neighbor_id] = alt
                previous[neighbor_id] = current_id
                
    path = []
    curr = end_id
    while curr in previous or curr == start_id:
        node = city_graph.get(curr)
        if node:
            path.insert(0, {"x": node.x, "y": node.y})
        if curr == start_id:
            break
        curr = previous.get(curr)
        
    return path
