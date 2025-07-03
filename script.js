document.addEventListener('DOMContentLoaded', () => {
    // =================================================
    // BAGIAN UNTUK INSTALASI PROGRESSIVE WEB APP (PWA)
    // =================================================
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');

    console.log('Script PWA dimuat. Menunggu event beforeinstallprompt...');

    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('Event beforeinstallprompt berhasil dijalankan!');
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', () => {
        console.log('Tombol install diklik.');
        installBtn.classList.add('hidden');
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Pengguna menyetujui instalasi');
            } else {
                console.log('Pengguna menolak instalasi');
            }
            deferredPrompt = null;
        });
    });

    // =================================================
    // BAGIAN UTAMA LOGIKA PERMAINAN ULAR TANGGA
    // =================================================

    const modeSelection = document.getElementById('mode-selection');
    const pvcBtn = document.getElementById('pvc-btn');
    const pvpBtn = document.getElementById('pvp-btn');
    const gameContainer = document.getElementById('game-container');
    const board = document.getElementById('game-board');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const playerTurnDisplay = document.getElementById('player-turn');
    const diceResultDisplay = document.getElementById('dice-result');
    const winnerMessage = document.getElementById('winner-message');

    const boardSize = 100;
    let players = [];
    let currentPlayerIndex = 0;
    let gameMode = '';

    const snakesAndLadders = {
        4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91,
        17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78
    };

    modeSelection.classList.remove('hidden');
    gameContainer.classList.add('hidden');

    // === KOMPATIBILITAS MOBILE ===
    // Fungsi ini dipanggil saat mode dipilih untuk menghindari duplikasi kode.
    const handleModeSelection = (selectedMode) => {
        // Mencegah fungsi dipanggil dua kali jika 'click' dan 'touchstart' keduanya aktif
        if (gameMode) return;
        
        console.log(`Mode dipilih: ${selectedMode}`);
        gameMode = selectedMode;
        startGame();
    };

    // Tambahkan event listener untuk 'click' (desktop) dan 'touchstart' (mobile)
    pvpBtn.addEventListener('click', () => handleModeSelection('pvp'));
    pvpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Mencegah 'click' event palsu setelah sentuhan
        handleModeSelection('pvp');
    });

    pvcBtn.addEventListener('click', () => handleModeSelection('pvc'));
    pvcBtn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Mencegah 'click' event palsu setelah sentuhan
        handleModeSelection('pvc');
    });
    // ============================================

    function startGame() {
        modeSelection.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        setupPlayers();
        createBoard();
        updatePlayerTurnDisplay();
    }

    function setupPlayers() {
        players = [
            { id: 1, name: 'Pemain 1', position: 1, element: createPlayerElement(1), isAI: false },
            { id: 2, name: (gameMode === 'pvc' ? 'Komputer' : 'Pemain 2'), position: 1, element: createPlayerElement(2), isAI: (gameMode === 'pvc') }
        ];
    }

    function createBoard() {
        board.innerHTML = '';
        const cells = [];
        for (let i = boardSize; i >= 1; i--) cells.push(i);

        const finalCells = [];
        for (let i = 0; i < 10; i++) {
            const row = cells.slice(i * 10, (i + 1) * 10);
            if (i % 2 !== 0) row.reverse();
            finalCells.push(...row);
        }

        finalCells.forEach(num => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.cell = num;
            const cellNumber = document.createElement('span');
            cellNumber.textContent = num;
            cell.appendChild(cellNumber);
            if (snakesAndLadders[num]) {
                cell.classList.add(snakesAndLadders[num] > num ? 'ladder-start' : 'snake-head');
            }
            board.appendChild(cell);
        });

        players.forEach(player => board.appendChild(player.element));
        updatePlayerPositions();
    }

    function createPlayerElement(playerId) {
        const playerElement = document.createElement('div');
        playerElement.classList.add('player');
        playerElement.id = `player${playerId}`;
        return playerElement;
    }

    function updatePlayerPositions() {
        players.forEach(player => {
            const cell = document.querySelector(`.cell[data-cell='${player.position}']`);
            if (cell) cell.appendChild(player.element);
        });
    }
    
    function updatePlayerTurnDisplay() {
        const currentPlayer = players[currentPlayerIndex];
        playerTurnDisplay.textContent = `Giliran: ${currentPlayer.name}`;
    }

    function rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    function switchPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updatePlayerTurnDisplay();
        
        const nextPlayer = players[currentPlayerIndex];
        if (nextPlayer.isAI) {
            rollDiceBtn.disabled = true;
            setTimeout(aiTurn, 1200);
        } else {
            rollDiceBtn.disabled = false;
        }
    }

    function movePlayer(player, steps) {
        let newPosition = player.position + steps;
        if (newPosition > boardSize) {
            newPosition = player.position;
        } else {
            player.position = newPosition;
        }

        diceResultDisplay.textContent = `${player.name} maju ${steps} langkah ke petak ${player.position}`;
        updatePlayerPositions();

        setTimeout(() => {
            if (snakesAndLadders[player.position]) {
                const endPosition = snakesAndLadders[player.position];
                const type = endPosition > player.position ? 'tangga' : 'ular';
                alert(`${player.name} menemukan ${type}! Pindah ke petak ${endPosition}.`);
                player.position = endPosition;
                updatePlayerPositions();
            }

            if (player.position === boardSize) {
                showWinner(player);
                return;
            }

            switchPlayer();
        }, 800);
    }

    function aiTurn() {
        const steps = rollDice();
        movePlayer(players[currentPlayerIndex], steps);
    }

    function showWinner(player) {
        winnerMessage.querySelector('p').textContent = `${player.name} Menang! 🎉`;
        winnerMessage.classList.remove('hidden');
        document.querySelector('.controls').style.display = 'none';
    }

    rollDiceBtn.addEventListener('click', () => {
        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer.isAI) return;

        rollDiceBtn.disabled = true;
        const steps = rollDice();
        movePlayer(currentPlayer, steps);
    });
});
