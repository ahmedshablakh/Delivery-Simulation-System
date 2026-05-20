import time
import random
import math
from python_simulation.city_graph import city_graph, graph_nodes, find_shortest_path

class SimulationEngine:
    def __init__(self):
        self.is_running = False
        self.simulation_time = 0.0  # in seconds
        self.settings = {
            "driverCount": 5,
            "maxOrders": 50,
            "driverSpeedPercent": 100,
            "trafficLevel": "low",
            "algorithm": "smart",
            "weather": "sunny",
            "orderPriority": "normal",
            "orderFrequency": "normal"
        }
        self.restaurants = self._generate_restaurants()
        self.drivers = self._generate_drivers(self.settings["driverCount"])
        self.orders = []
        self.traffic_zones = [
            {"id": "tz1", "x": 300.0, "y": 250.0, "radius": 80.0, "intensity": 0.7}
        ]
        self.stats = self._generate_default_stats()
        self.order_timer = 0.0  # in ms

    def reset(self):
        self.is_running = False
        self.simulation_time = 0.0
        self.orders = []
        self.drivers = self._generate_drivers(self.settings["driverCount"])
        self.stats = self._generate_default_stats()
        self.order_timer = 0.0

    def update_settings(self, new_settings):
        old_count = self.settings.get("driverCount", 5)
        self.settings.update(new_settings)
        new_count = self.settings.get("driverCount", 5)
        if new_count != old_count and not self.is_running:
            self.drivers = self._generate_drivers(new_count)
            self.stats["driverStatuses"]["idle"] = new_count
            self.stats["driverStatuses"]["busy"] = 0
            self.stats["driverStatuses"]["returning"] = 0

    def _generate_restaurants(self):
        r_nodes = ['1_1', '3_2', '7_5', '6_1', '2_4']
        names = ['🍔 Burger Hub', '🍕 Pizza Room', '🥙 Kebap Dünyası', '☕ Kahve Evi', '🍣 Sushi Bar']
        restaurants = []
        for idx, nid in enumerate(r_nodes):
            node = city_graph.get(nid)
            restaurants.append({
                "id": f"r{idx+1}",
                "name": names[idx],
                "cuisine": "Food",
                "nodeId": nid,
                "x": node.x,
                "y": node.y
            })
        return restaurants

    def _generate_drivers(self, count):
        drivers = []
        start_node = city_graph.get('4_3') or graph_nodes[0]
        for i in range(count):
            drivers.append({
                "id": f"d{i+1}",
                "name": f"Kurye {i+1}",
                "status": "idle",
                "x": start_node.x,
                "y": start_node.y,
                "speed": 1.0,
                "assignedOrderId": None,
                "route": [],
                "pathIndex": 0,
                "stats": {"deliveredCount": 0, "totalDeliveryTime": 0.0, "activeTime": 0.0}
            })
        return drivers

    def _generate_default_stats(self):
        return {
            "totalOrders": 0,
            "completedOrders": 0,
            "delayedOrders": 0,
            "canceledOrders": 0,
            "pendingOrders": 0,
            "avgDeliveryTime": 0.0,
            "fastestDelivery": 0.0,
            "slowestDelivery": 0.0,
            "driverStatuses": {"idle": self.settings["driverCount"], "busy": 0, "returning": 0},
            "algorithmComparison": {
                "random": {"avgDeliveryTime": 0.0, "completedCount": 0, "delayedCount": 0, "utilizationRate": 0.0, "totalDeliveryTimeSum": 0.0},
                "nearest": {"avgDeliveryTime": 0.0, "completedCount": 0, "delayedCount": 0, "utilizationRate": 0.0, "totalDeliveryTimeSum": 0.0},
                "smart": {"avgDeliveryTime": 0.0, "completedCount": 0, "delayedCount": 0, "utilizationRate": 0.0, "totalDeliveryTimeSum": 0.0}
            }
        }

    def tick(self, delta_time_ms):
        if not self.is_running:
            return

        self.simulation_time += delta_time_ms / 1000.0
        self.order_timer += delta_time_ms

        order_delay = 3000.0  # Normal
        if self.settings["orderFrequency"] == 'slow':
            order_delay = 6000.0
        elif self.settings["orderFrequency"] == 'fast':
            order_delay = 1000.0

        # 1. Generate Orders
        if self.order_timer > order_delay:
            self.order_timer = 0.0
            pending_count = sum(1 for o in self.orders if o["status"] == "pending")
            if pending_count < self.settings["maxOrders"]:
                r = random.choice(self.restaurants)
                
                occupied_nodes = set(res["nodeId"] for res in self.restaurants)
                for o in self.orders:
                    if o["status"] not in ["delivered", "canceled"] and o.get("customer"):
                        occupied_nodes.add(o["customer"]["nodeId"])
                        
                free_nodes = [n for n in graph_nodes if n.id not in occupied_nodes]
                random_node = random.choice(free_nodes) if free_nodes else random.choice(graph_nodes)
                
                offset_x = (1 if random.random() > 0.5 else -1) * (12 + random.random() * 8)
                offset_y = (1 if random.random() > 0.5 else -1) * (12 + random.random() * 8)
                
                new_customer = {
                    "id": f"CST-{str(random.random())[2:7]}",
                    "name": f"Müşteri {random.randint(100, 999)}",
                    "nodeId": random_node.id,
                    "x": random_node.x + offset_x,
                    "y": random_node.y + offset_y
                }
                
                new_order = {
                    "id": f"ORD-{str(int(time.time() * 1000))[-4:]}",
                    "restaurantId": r["id"],
                    "customerId": new_customer["id"],
                    "customer": new_customer,
                    "status": "pending",
                    "priority": "normal",
                    "createdTime": self.simulation_time,
                    "preparedTime": None,
                    "assignedTime": None,
                    "pickedUpTime": None,
                    "deliveredTime": None,
                    "estimatedDeliveryTime": 30.0,
                    "type": "Food",
                    "assignedDriverId": None
                }
                
                self.orders.append(new_order)
                self.stats["totalOrders"] += 1
                self.stats["pendingOrders"] += 1

        # 1.5 Cancel orders waiting too long (> 45s)
        canceled_count_this_tick = 0
        for o in self.orders:
            if o["status"] == "pending" and (self.simulation_time - o["createdTime"] > 45.0):
                o["status"] = "canceled"
                canceled_count_this_tick += 1
                
        if canceled_count_this_tick > 0:
            self.stats["canceledOrders"] = self.stats.get("canceledOrders", 0) + canceled_count_this_tick
            self.stats["pendingOrders"] = max(0, self.stats["pendingOrders"] - canceled_count_this_tick)

        # 2. Assign Orders
        assignments = []
        pending_orders = [o for o in self.orders if o["status"] == "pending"]
        available_drivers = [d for d in self.drivers if d["status"] == "idle"]
        
        if pending_orders and available_drivers:
            for po in pending_orders:
                if not available_drivers:
                    break
                    
                selected_idx = -1
                rest = next(r for r in self.restaurants if r["id"] == po["restaurantId"])
                cust = po["customer"]
                
                if self.settings["algorithm"] == "random":
                    selected_idx = random.randint(0, len(available_drivers) - 1)
                elif self.settings["algorithm"] == "nearest":
                    min_dist = float('inf')
                    for idx, d in enumerate(available_drivers):
                        dist = math.hypot(d["x"] - rest["x"], d["y"] - rest["y"])
                        if dist < min_dist:
                            min_dist = dist
                            selected_idx = idx
                elif self.settings["algorithm"] == "smart":
                    best_score = -float('inf')
                    for idx, d in enumerate(available_drivers):
                        dist = math.hypot(d["x"] - rest["x"], d["y"] - rest["y"])
                        util_penalty = d["stats"]["activeTime"] * 1.5
                        score = -dist - util_penalty
                        if score > best_score:
                            best_score = score
                            selected_idx = idx
                            
                if selected_idx != -1:
                    dr = available_drivers[selected_idx]
                    
                    dr_node_id = '4_3'
                    min_node_dist = float('inf')
                    for n in graph_nodes:
                        d_dist = math.hypot(n.x - dr["x"], n.y - dr["y"])
                        if d_dist < min_node_dist:
                            min_node_dist = d_dist
                            if d_dist < 30.0:
                                dr_node_id = n.id
                                
                    r_path = find_shortest_path(dr_node_id, rest["nodeId"])
                    c_path = find_shortest_path(rest["nodeId"], cust["nodeId"])
                    
                    assignments.append({
                        "orderId": po["id"],
                        "driverId": dr["id"],
                        "route": r_path + c_path
                    })
                    
                    available_drivers.pop(selected_idx)

        # Commit assignments
        if assignments:
            for o in self.orders:
                assignment = next((a for a in assignments if a["orderId"] == o["id"]), None)
                if assignment:
                    o["status"] = "assigned"
                    o["assignedDriverId"] = assignment["driverId"]
                    
            for d in self.drivers:
                assignment = next((a for a in assignments if a["driverId"] == d["id"]), None)
                if assignment:
                    d["status"] = "busy"
                    d["assignedOrderId"] = assignment["orderId"]
                    d["route"] = assignment["route"]
                    d["pathIndex"] = 0
                    d["speed"] = self.settings["driverSpeedPercent"] / 100.0

        # 3. Move Drivers & Process Deliveries
        newly_delivered_ids = []
        for d in self.drivers:
            if d["status"] == "idle" or not d["route"] or d["pathIndex"] >= len(d["route"]):
                continue
                
            target = d["route"][d["pathIndex"]]
            dx = target["x"] - d["x"]
            dy = target["y"] - d["y"]
            dist = math.hypot(dx, dy)
            
            weather_mult = 1.0
            if self.settings["weather"] == "rainy":
                weather_mult = 0.8
            elif self.settings["weather"] == "snowy":
                weather_mult = 0.6
                
            step = d["speed"] * 100.0 * (delta_time_ms / 1000.0) * weather_mult
            
            if dist <= step:
                d["x"] = target["x"]
                d["y"] = target["y"]
                d["pathIndex"] += 1
                d["stats"]["activeTime"] += delta_time_ms / 1000.0
            else:
                ratio = step / dist
                d["x"] += dx * ratio
                d["y"] += dy * ratio
                d["stats"]["activeTime"] += delta_time_ms / 1000.0
                
            # Check if arrived at end of route
            if d["status"] == "busy" and d["pathIndex"] >= len(d["route"]):
                if d["assignedOrderId"]:
                    newly_delivered_ids.append(d["assignedOrderId"])
                    
                ord_obj = next((o for o in self.orders if o["id"] == d["assignedOrderId"]), None)
                order_duration = self.simulation_time - ord_obj["createdTime"] if ord_obj else 0.0
                
                d["status"] = "idle"
                d["route"] = []
                d["pathIndex"] = 0
                d["assignedOrderId"] = None
                d["stats"]["deliveredCount"] += 1
                d["stats"]["totalDeliveryTime"] += order_duration

        if newly_delivered_ids:
            delivered_count = 0
            time_sum = 0.0
            
            for o in self.orders:
                if o["id"] in newly_delivered_ids:
                    time_diff = self.simulation_time - o["createdTime"]
                    time_sum += time_diff
                    delivered_count += 1
                    o["status"] = "delivered"
                    o["deliveredTime"] = self.simulation_time
                    
            if delivered_count > 0:
                algo = self.settings["algorithm"]
                comp = self.stats["algorithmComparison"][algo]
                new_sum = comp["totalDeliveryTimeSum"] + time_sum
                new_comp = comp["completedCount"] + delivered_count
                
                self.stats["completedOrders"] += delivered_count
                self.stats["pendingOrders"] = max(0, self.stats["pendingOrders"] - delivered_count)
                
                total_delivered = self.stats["completedOrders"]
                prev_avg = self.stats["avgDeliveryTime"]
                self.stats["avgDeliveryTime"] = ((prev_avg * (total_delivered - delivered_count)) + time_sum) / total_delivered
                
                comp["completedCount"] = new_comp
                comp["totalDeliveryTimeSum"] = new_sum
                comp["avgDeliveryTime"] = new_sum / new_comp

        # 4. Update Driver statuses
        idle_count = sum(1 for d in self.drivers if d["status"] == "idle")
        busy_count = sum(1 for d in self.drivers if d["status"] == "busy")
        self.stats["driverStatuses"] = {"idle": idle_count, "busy": busy_count, "returning": 0}

    def get_state(self):
        customers = []
        for o in self.orders:
            if o["status"] not in ["delivered", "canceled"] and o.get("customer"):
                customers.append(o["customer"])
                
        return {
            "simulationTime": self.simulation_time,
            "isRunning": self.is_running,
            "drivers": self.drivers,
            "orders": self.orders,
            "restaurants": self.restaurants,
            "customers": customers,
            "trafficZones": self.traffic_zones,
            "stats": self.stats,
            "settings": self.settings
        }
