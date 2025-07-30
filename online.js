
// mod 2nd, replace function handleBoardClick()
// mod 3rd, 1. add 1 variable at top line
//          2. add 2 lines at function addEventListeners()
//          3. add function setupCanvas() at bottom
//          4. add function eraseTacticalCanvas() at bottom
//          5. add function handleTacticalClick() at bottom
//          6. Find the document.addEventListener('DOMContentLoaded', ...) block and add the new function call:
// mod 4th, changed call line from document.addEventListener({}) to function createBoard()
// mod 5th, replace entire code.
// mod 6th, replace entire code.
// mod 7th, replace function updateDisplay() at very bottom part.
// mod 8th, replace entire code, deleted in function handleBoardClick(), line 'isGameactive ...'
// mod 9th, change in function handleBoardClick(), from 'isGameactive' to 'isGameActive'.
// mod 10th, replace entire code, deleted in function handleBoardClick(), line 'isGameactive ...'
// mod 11th, replace function handleTacticalClick()
// mod 12th, replace entire code.
// mod 14th, at function handleTacticalClick(event), first line 
//        if (currentGameState.phase !== `P${myPlayerNumber}_TURN` ) return; // deleted "|| selectedAction"
// mod 15th, same as mod 14th?
// mod 16th, replace function sendAction()
// mod 18th, replaced function handleTacticalClick() and erase Tactical Canvas() 2025-07-09
// mod 19th, (1) replace function handleTacticalClick() and (2) function sendAction()
// mod 20th, replace entire code.
// mod 22nd, replace entire code.
// mod 23rd, replace createBoard function
// mod 26th, replace entire code. 2025-07-10
// mod 27th, replace entire code.
// mod 28th(2)案, replace entire code.
// mod 29th, replace entire code.
// mod 30th, replace entire code.
// mod 31st, replace entire code.
// mod 32nd, replace entire code.
// mod 33rd, replace function handleTacticalClick()
// mod 34th, replace entire code. per report 1 2025-07-13
// mod 35th, replace entire code.
// mod 36th, replace entire code.
// mod 37th, replace entire code.
// mod 38th, replace entire code.
// mod 39th, replace entire code.
// mod 40th, replace entire code.
// mod 41st, replace function redrawTacticalCanvas()
// mod 42nd, replace function redrawTacticalCanvas()
// mod 43rd, replace function redrawTacticalCanvas()
// mod 44th, replace function redrawTacticalCanvas() 2025-07-14
// mod 45th, replace function redrawTacticalCanvas()
// mod 46th, replace function redrawTacticalCanvas()
// mod 47th, replace entire code.
// mod 48th, replace entire code.
// mod 49th, replace entire code.
// mod 51st, replace function redrawTacticalCanvas()
// mod 52nd, replace entire code.
// mod 53rd, replace function handleBoardClick(event)
// mod 54th, replace function handleBoardClick(event)
// mod 55th, replace entire code.
// mod 56th, replace entire code. 
// mod 66th, replace entire code. 2025-07-15
// mod 67th, replace entire code.
// mod 68th, replace entire code.
// mod 69th, replace entire code.
// mod 71st, replace entire code.
// mod 72nd, replace entire code.
// mod 73rd, replace entire code.
// mod 74th, replace entire code.
// mod 75th, replace entire code.
// mod 76th, replace entire code.
// mod 77th, replace entire code.
// mod 78th, replace entire code.
// mod 79th, replace function redrawTacticalCanvas() only
// mod 80th, replace entire code.
// mod 81st, replace entire code. mod 78thに戻った？ => mod 79thの function handleTacticalClick(e) を入れ替えた

// --- FINAL, POLISHED, AND VERIFIED SCRIPT V2.2 ---
console.log("Echo Hunt Online - The Final Version");

// --- Global Variables ---
let myPlayerNumber;
let currentGameState = {};
let selectedAction = null;
let drawnCircles = [];
let isActionInProgress = false;

// --- Connect to Server ---
const socket = io();

// --- SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    createBoards();
    addEventListeners();
});

// --- LISTEN FOR SERVER MESSAGES (with final pause logic) ---
socket.on('connect', () => console.log("Connected!", socket.id));
socket.on('message', (d) => document.getElementById('game-message').textContent = d.data);
socket.on('error_message', (d) => {
    alert(d.message);
    isActionInProgress = false; // Unlock controls on error
    updateDisplay();
});

socket.on('game_found', (d) => {
    document.getElementById('game-message').textContent = "Game Found! Getting ready...";
    socket.emit('player_ready', { game_id: d.game_id });
});

socket.on('game_update', (gs) => {
    const oldPhase = currentGameState.phase;
    currentGameState = gs;
    myPlayerNumber = gs.my_player_number;
    
    updateDisplay(); // Update the screen with the result of the action

    // --- YOUR TACTICAL PAUSE LOGIC ---
    const myTurn = `P${myPlayerNumber}_TURN`;
    // If it was my turn, and it is still my turn (meaning I just made a successful hit/move)...
    if (isActionInProgress && oldPhase === myTurn && currentGameState.phase === myTurn) {
        console.log("Action successful. Starting Tactical Pause.");
        // The buttons are already hidden, so the player can only draw.
        setTimeout(() => {
            console.log("Tactical Pause over. Requesting next turn.");
            sendAction('next_turn', { fromPause: true }); // Send the next_turn action
        }, 10000); // 10 second pause
    } else {
        // For all other updates (like the start of the next player's turn), unlock the controls.
        isActionInProgress = false;
        updateDisplay();
    }
});

// --- EVENT LISTENERS ---
function addEventListeners() {
    document.getElementById('primary-board').addEventListener('click', handleBoardClick);
    document.getElementById('tracking-board').addEventListener('mousedown', handleTacticalClick);
    document.getElementById('tracking-board').addEventListener('contextmenu', e => e.preventDefault());
    document.getElementById('btn-move').addEventListener('click', () => chooseAction('move'));
    document.getElementById('btn-hit').addEventListener('click', () => chooseAction('hit'));
    document.getElementById('btn-play-again').addEventListener('click', () => {
        drawnCircles = [];
        sendAction('new_game');
    });
    document.getElementById('btn-erase').addEventListener('click', handleEraseAllClick);
}

// --- SEND ACTIONS TO SERVER ---
function sendAction(type, data = {}) {
    // The 'fromPause' flag allows the next_turn action to bypass the lock
    if (isActionInProgress && !data.fromPause) return;
    
    // Lock the controls for major actions
    if (type === 'hit' || type === 'move') {
        isActionInProgress = true;
    }
    
    // We remove the 'fromPause' flag before sending to the server
    const { fromPause, ...actionData } = data;
    socket.emit('handle_action', { action_type: type, game_id: currentGameState.game_id, ...actionData });
}

function chooseAction(action) {
    if (currentGameState.phase !== `P${myPlayerNumber}_TURN` || isActionInProgress) return;
    selectedAction = action;
    updateDisplay();
}

function handleBoardClick(e) {
    if (!e.target.classList.contains('cell') || isActionInProgress) return;
    const r = Math.floor(e.target.dataset.index / 5), c = e.target.dataset.index % 5;
    const phase = currentGameState.phase, myTurn = `P${myPlayerNumber}_TURN`;
    const actionData = { row: r, col: c };

    if ((myPlayerNumber === 1 && phase === 'SETUP_P1') || (myPlayerNumber === 2 && phase === 'SETUP_P2')) {
        if (e.target.closest('.board').id === 'primary-board') sendAction('place-ship', actionData);
    } else if (phase === myTurn) {
        if (!selectedAction) { alert("Please choose an action first."); return; }
        if (e.target.closest('.board').id !== 'primary-board') { alert("Please click on the ACTION BOARD."); return; }
        if (selectedAction === 'hit') sendAction('hit', actionData);
        else if (selectedAction === 'move') sendAction('move', actionData);
    }
}

// --- YOUR FINAL CANVAS LOGIC ---
function handleEraseAllClick() {
    drawnCircles = [];
    sendAction('erase_tracking');
}

// mod 81st　入れ替え
// This is the final version of the function with your "Smart Pencil" logic
function handleTacticalClick(event) {
    // We only allow drawing during the player's own turn.
    if (currentGameState.phase !== `P${myPlayerNumber}_TURN` || !event.target.classList.contains('cell')) return;
    
    event.preventDefault(); // Prevent the default right-click menu
    const cellIndex = parseInt(event.target.dataset.index);

    // Your "Precision Eraser" (Right-Click)
    if (event.button === 2) {
        drawnCircles = drawnCircles.filter(c => c.index !== cellIndex);
    } 
    // Your "Smart Pencil" (Left-Click)
    else if (event.button === 0) {
        // Don't draw a circle if one is already there
        if (drawnCircles.some(c => c.index === cellIndex)) return;

        // --- YOUR BRILLIANT "SMART PENCIL" LOGIC ---
        // First, find out what kind of cell we are clicking on
        const trackingBoardData = currentGameState[`p${myPlayerNumber}_tracking_board`].flat();
        const cellValue = trackingBoardData[cellIndex];
        
        let drawColor;
        if (cellValue === 'M') {
            // If it's a Miss, draw with a semi-transparent Grey
            drawColor = 'rgba(128, 128, 128, 0.5)';
        } else if (cellValue === 'O' || cellValue === 'X') {
            // If it's an Echo or a Hit, draw with a semi-transparent Yellow
            drawColor = 'rgba(255, 223, 0, 0.5)';
        } else {
            // If it's an unknown square, use the player's tactical color
            drawColor = (myPlayerNumber === 1) ? 'rgba(102, 252, 241, 0.4)' : 'rgba(255, 77, 77, 0.4)';
        }
        // --- End of Smart Pencil Logic ---
        
        // Save the information about the circle
        drawnCircles.push({ index: cellIndex, color: drawColor });
    }
    
    // After any change, redraw the entire canvas
    redrawTacticalCanvas();
}

// mod 79th replaced
// This is the final version of the function with perfect centering
function redrawTacticalCanvas() {
    const canvas = document.getElementById('tactical-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const boardElement = document.getElementById('tracking-board');
    if (!boardElement) return;

    // We must check if the canvas has a size yet. If not, we can't draw.
    if (canvas.width === 0 || canvas.height === 0) return;

    // --- THE FINAL FIX IS HERE ---
    // Get a list of all the actual cell elements on the tracking board
    const allTrackingCells = document.querySelectorAll('#tracking-board .cell');
    if (allTrackingCells.length === 0) return; // Safety check

    // Clear the canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw every circle that is stored in our array
    drawnCircles.forEach(circle => {
        // Find the specific cell element for this circle
        const cellElement = allTrackingCells[circle.index];
        if (!cellElement) return;

        // Ask the browser for the exact position and size of the cell
        const x = cellElement.offsetLeft + (cellElement.offsetWidth / 2);
        const y = cellElement.offsetTop + (cellElement.offsetHeight / 2);

        ctx.fillStyle = circle.color;
        ctx.beginPath();
        // A slightly smaller radius looks better when centered
        ctx.arc(x, y, 14, 0, 2 * Math.PI);
        ctx.fill();
    });
}
// --- END OF CANVAS LOGIC ---

function createBoards() {
    const p = document.getElementById('primary-board'), t = document.getElementById('tracking-board');
    if (!p || !t) return;
    p.innerHTML = ''; t.innerHTML = '';
    t.innerHTML += `<canvas id="tactical-canvas"></canvas>`;
    for (let i = 0; i < 25; i++) {
        p.innerHTML += `<div class="cell" data-index="${i}"></div>`;
        t.innerHTML += `<div class="cell" data-index="${i}"></div>`;
    }
    setTimeout(() => {
        const c = document.getElementById('tactical-canvas'), b = document.getElementById('tracking-board');
        if (c && b) { c.width = b.offsetWidth; c.height = b.offsetHeight; }
    }, 100);
}

function updateDisplay() {
    if (!currentGameState || !currentGameState.phase) return;
    const phase = currentGameState.phase; document.getElementById('game-message').textContent = currentGameState.message;
    const myTurn = `P${myPlayerNumber}_TURN`, showTurn = phase === myTurn && !isActionInProgress, showAgain = phase === "GAME_OVER";
    
    document.getElementById('action-controls').style.display = (showTurn || showAgain) ? 'block' : 'none';
    document.getElementById('btn-move').style.display = showTurn ? 'inline-block' : 'none';
    document.getElementById('btn-hit').style.display = showTurn ? 'inline-block' : 'none';
    document.getElementById('btn-play-again').style.display = showAgain ? 'inline-block' : 'none';
    
    if (!showTurn) selectedAction = null;
    document.getElementById('btn-move').classList.toggle('selected', selectedAction === 'move');
    document.getElementById('btn-hit').classList.toggle('selected', selectedAction === 'hit');
    
    const p_board = currentGameState[`p${myPlayerNumber}_primary_board`].flat();
    document.querySelectorAll('#primary-board .cell').forEach((cell, i) => { cell.className = 'cell'; if (p_board[i].startsWith('S')) cell.classList.add(myPlayerNumber === 1 ? 'ship-1' : 'ship-2'); });
    const t_board = currentGameState[`p${myPlayerNumber}_tracking_board`].flat();
    document.querySelectorAll('#tracking-board .cell').forEach((cell, i) => { cell.className = 'cell'; if (t_board[i] === 'M') cell.classList.add('miss'); if (t_board[i] === 'O') cell.classList.add('echo'); if (t_board[i] === 'X') cell.classList.add('hit'); });
}