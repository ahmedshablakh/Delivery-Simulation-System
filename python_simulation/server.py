import asyncio
import json
import traceback
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from python_simulation.engine import SimulationEngine

from websockets.exceptions import ConnectionClosed

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = SimulationEngine()

@app.get("/health")
def health():
    return {"status": "ok"}

async def simulation_loop(websocket: WebSocket):
    # Send state updates at ~15 FPS (66ms intervals)
    tick_rate = 0.066
    last_time = asyncio.get_event_loop().time()
    try:
        while True:
            current_time = asyncio.get_event_loop().time()
            delta_time_ms = (current_time - last_time) * 1000.0
            last_time = current_time
            
            if engine.is_running:
                engine.tick(delta_time_ms)
                
            state = engine.get_state()
            await websocket.send_text(json.dumps(state))
            await asyncio.sleep(tick_rate)
    except ConnectionClosed:
        pass  # Normal disconnect
    except Exception as e:
        print(f"Error in simulation loop: {e}")
        
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("React client connected to simulation WebSocket")
    
    # Send initial state immediately
    await websocket.send_text(json.dumps(engine.get_state()))
    
    # Start loop task to broadcast state changes
    loop_task = asyncio.create_task(simulation_loop(websocket))
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            
            if msg_type == "start":
                engine.is_running = True
            elif msg_type == "stop":
                engine.is_running = False
            elif msg_type == "reset":
                engine.reset()
            elif msg_type == "updateSettings":
                settings = message.get("settings", {})
                engine.update_settings(settings)
                
            # Send state immediately as confirmation
            await websocket.send_text(json.dumps(engine.get_state()))
    except WebSocketDisconnect:
        print("React client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        traceback.print_exc()
    finally:
        loop_task.cancel()
