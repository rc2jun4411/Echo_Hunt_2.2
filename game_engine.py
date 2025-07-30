# mod 18th, replace entire code 2025-06-29
# mod 39th, reconfirm entire code as is.
# 40th, replace entire code, corrected typo, 2025-06-30
# Echo Hunt 2.0, mod 13th, at bottom line, add new function "def erase_tracking_board(self, player_num):" 2025-07-06
# Echo Hunt 2.1, mod 16th, replace function perform_hit, perform_move, 2025-07-07
# mod 17th, replace entire code
# mod 21st, replaced at def perform_hit, and def perform_move 
# mod 48th, replace entire code 2025-07-14
# mod 50th, replace entire code
# mod 56th, replace entire code
# mod 57th, replace entire code
# mod 58th, replace entire code
# mod 59th, replace entire code
# mod 60th, replace entire code
# mod 61st, replace entire code
# mod 62nd, replace entire code
# mod 63rd, replace entire code
# mod 64th, replace entire code
# mod 65th, replace entire code
# mod 70th, replace entire code

import game

class GameEngine:
    def __init__(self, game_id, p1_sid, p2_sid):
        self.game_id = game_id
        self.players = {"p1": p1_sid, "p2": p2_sid}
        self.boards = {} # Start with empty boards
        self.new_game() # Call new_game to initialize everything

    def place_ship(self, player_num, row, col):
        # --- KEY NAME FIX ---
        board = self.boards[f"p{player_num}_primary_board"]
        for r in range(len(board)):
            for c in range(len(board[r])):
                if board[r][c] == f'S{player_num}':
                    board[r][c] = '~'
        board[row][col] = f'S{player_num}'
        if player_num == 1:
            self.phase = "SETUP_P2"
            self.message = "Player 2, place your ship."
        else:
            self.phase = "P1_TURN"
            self.message = "Player 1's Turn. Choose an action."
        return True

    def perform_hit(self, player_num, row, col):
        # --- KEY NAME FIX ---
        own_board = self.boards[f"p{player_num}_primary_board"]
        defender_board = self.boards[f"p{3-player_num}_primary_board"]
        tracking_board = self.boards[f"p{player_num}_tracking_board"]
        
        attacker_pos = game.find_ship(own_board, f"S{player_num}")
        if not attacker_pos or not (abs(row - attacker_pos[0]) <= 1 and abs(col - attacker_pos[1]) <= 1) or (row, col) == attacker_pos:
            return "Invalid target. You can only hit adjacent squares."
        result = game.check_hit((row, col), defender_board, f"S{3-player_num}")
        if result == "HIT":
            tracking_board[row][col] = 'X'; self.phase = "GAME_OVER"; self.message = f"Player {player_num} wins! Direct Hit!"
        else:
            if result == "ECHO": tracking_board[row][col] = 'O'
            else: tracking_board[row][col] = 'M'
            self.message = f"Player {player_num} scores an {result}!"
        return True

    def perform_move(self, player_num, row, col):
        # --- KEY NAME FIX ---
        board = self.boards[f"p{player_num}_primary_board"]
        defender_board = self.boards[f"p{3-player_num}_primary_board"]
        
        current_pos = game.find_ship(board, f"S{player_num}")
        if not current_pos or not (abs(row - current_pos[0]) <= 1 and abs(col - current_pos[1]) <= 1) or (row,col) == current_pos:
            return "Invalid move. You can only move to an adjacent square."
        defender_pos = game.find_ship(defender_board, f"S{3-player_num}")
        if defender_pos and (row, col) == defender_pos:
            return "Invalid move. Cannot move to a square occupied by the opponent."
        board[current_pos[0]][current_pos[1]] = '~'; board[row][col] = f"S{player_num}"
        self.message = f"Player {player_num} has moved."
        return True
    
    def new_game(self):
        """Resets the game to its starting state."""
        self.phase = "SETUP_P1"
        self.message = "New Game! Player 1, place your ship."
        # --- KEY NAME FIX ---
        self.boards = {
            "p1_primary_board": game.create_board(),
            "p2_primary_board": game.create_board(),
            "p1_tracking_board": game.create_board(),
            "p2_tracking_board": game.create_board(),
        }
        return True

    def erase_tracking_board(self, player_num):
        """Resets the tracking board for the given player."""
        # --- KEY NAME FIX ---
        self.boards[f"p{player_num}_tracking_board"] = game.create_board()
        return True

    def get_state(self):
        """Returns the complete game state with the correct keys for JavaScript."""
        return {
            "game_id": self.game_id,
            "phase": self.phase,
            "message": self.message,
            "p1_primary_board": self.boards.get("p1_primary_board", []),
            "p2_primary_board": self.boards.get("p2_primary_board", []),
            "p1_tracking_board": self.boards.get("p1_tracking_board", []),
            "p2_tracking_board": self.boards.get("p2_tracking_board", []),
        }