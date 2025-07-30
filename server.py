# --- The Simplest Possible WebSocket Server --- NG
# --- The New Server with a Different Library ---Socket.IO library working, but too complicated, need to rebuild. 
# mod 13th, replace function async def handle_action(sid, data), 2026-07-06
# mod 14th, add new block to "No Collision" rule.
#         , add import game at fourth line
# mod 15th, replace elif action_type == "move": block
# mod 16th, replace @sio.on('handle_action') function with this final, verified version.
# mod 18th, replaced @sio.on('handle_action')
# mod 24th, replaced @sio.on('handle_action')
# mod 25th, replaced @sio.on('handle_action')
# mod 39th, replace entire code
# mod 48th, replace entire code 2025-07-14
# mod 49th, replace (1) async def broadcast_gamestate(game_id: str)
#                   (2) @aio.on async def handle_action() <= 変更不要 @sio.event
#                                                                    async def handle_action(sid, data): このままで OK

import socketio, aiohttp, uuid
from aiohttp import web
from game_engine import GameEngine

sio = socketio.AsyncServer(async_mode='aiohttp', cors_allowed_origins='*')
app = web.Application(); sio.attach(app); app.router.add_static('/', path='.', show_index=True)

games = {}; waiting_player_sid = None; players_ready = {}

# mod 49th
# This is the final, correct version of the function
async def broadcast_gamestate(game_id: str):
    if game_id in games:
        engine = games[game_id]
        
        # --- THE FIX IS HERE ---
        # We get the complete state from the engine first
        state_to_send = engine.get_state()
        
        # Then we send a custom version to each player
        p1_sid, p2_sid = engine.players["p1"], engine.players["p2"]
        await sio.emit('game_update', {**state_to_send, 'my_player_number': 1}, room=p1_sid)
        await sio.emit('game_update', {**state_to_send, 'my_player_number': 2}, room=p2_sid)

@sio.event
async def connect(sid, environ):
    global waiting_player_sid
    print(f"SERVER: Player connected: {sid}")
    if waiting_player_sid:
        p1_sid, p2_sid = waiting_player_sid, sid; waiting_player_sid = None; game_id = str(uuid.uuid4())
        await sio.emit('game_found', {'game_id': game_id}, room=p1_sid)
        await sio.emit('game_found', {'game_id': game_id}, room=p2_sid)
    else:
        waiting_player_sid = sid
        await sio.emit('message', {'data': 'Connected. Waiting for another player...'}, room=sid)

@sio.event
async def player_ready(sid, data):
    game_id = data.get("game_id")
    if not game_id: return
    if game_id not in players_ready: players_ready[game_id] = []
    if sid not in players_ready[game_id]: players_ready[game_id].append(sid)
    if len(players_ready[game_id]) == 2:
        p1_sid, p2_sid = players_ready[game_id]
        games[game_id] = GameEngine(game_id, p1_sid, p2_sid); del players_ready[game_id]
        print(f"SERVER: Both players ready for game {game_id}. Starting game.")
        await broadcast_gamestate(game_id)

@sio.event
async def handle_action(sid, data):
    game_id = data.get("game_id");
    if not game_id or game_id not in games: return
    engine = games[game_id]; player_num = 1 if sid == engine.players["p1"] else 2
    action_type = data.get("action_type"); row, col = data.get("row",0), data.get("col",0)
    
    result = None
    if action_type == "place-ship": result = engine.place_ship(player_num, row, col)
    elif action_type == "hit": result = engine.perform_hit(player_num, row, col)
    elif action_type == "move": result = engine.perform_move(player_num, row, col)
    elif action_type == "erase_tracking": result = engine.erase_tracking_board(player_num)
    elif action_type == "new_game": result = engine.new_game()
    elif action_type == "next_turn":
        if engine.phase == "P1_TURN": engine.phase = "P2_TURN"; engine.message = "Player 2's Turn. Choose an action."
        elif engine.phase == "P2_TURN": engine.phase = "P1_TURN"; engine.message = "Player 1's Turn. Choose an action."
        result = True
    
    if result is not True and result is not None:
        await sio.emit('error_message', {'message': str(result)}, room=sid)
    await broadcast_gamestate(game_id)

@sio.event
def disconnect(sid):
    print(f'SERVER: Player disconnected: {sid}')
    # Full disconnect logic can be added here later

if __name__ == '__main__':
    web.run_app(app, host='127.0.0.1', port=8002)