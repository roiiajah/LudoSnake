document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const turnInfo = document.getElementById('turn-info');
    const message = document.getElementById('message');
    const diceResult = document.getElementById('dice-result');
    const installIcon = document.getElementById('install-icon'); 

    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
       
        e.preventDefault();
       
        deferredPrompt = e;
     
        installIcon.style.display = 'block';
    });
    installIcon.addEventListener('click', (e) => {
     
        installIcon.style.display = 'none';
       
        deferredPrompt.prompt();
      
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Pengguna menyetujui instalasi aplikasi');
            } else {
                console.log('Pengguna menolak instalasi aplikasi');
            }
            deferredPrompt = null;
        });
    });


    const boardSize = 100;
    let player1Position = 0;
    // ... (sisa kode script.js Anda tidak perlu diubah) ...
    let player2Position = 0;
    let currentPlayer = 1; // 1 for user, 2 for AI
    let gameActive = true;

    // Definisikan posisi ular dan tangga
    // Format: { posisi_awal: posisi_akhir }
    const snakesAndLadders = {
        // Tangga (naik)
        4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91,
        // Ular (turun)
        17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 79
    };

    // Fungsi untuk membuat papan permainan
    function createBoard() {
        const cells = [];
        for (let i = 1; i <= boardSize; i++) {
            cells.push(i);
        }

        // Mengatur nomor papan agar zig-zag
        const rows = [];
        for (let i = 0; i < 10; i++) {
            const row = cells.splice(0, 10);
            if (i % 2 !== 0) { // Baris genap (dari atas, 0-indexed) dibalik
                rows.push(row.reverse());
            } else {
                rows.push(row);
            }
        }
        rows.reverse(); // Balik semua baris agar 1 dimulai dari kiri bawah

        const finalCellsOrder = rows.flat();

        finalCellsOrder.forEach(cellNum => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.cell = cellNum;
            cell.innerHTML = `<span>${cellNum}</span>`;

            if (snakesAndLadders[cellNum]) {
                if (snakesAndLadders[cellNum] < cellNum) {
                    cell.classList.add('snake-head');
                } else {
                    cell.classList.add('ladder-start');
                }
            }
            board.appendChild(cell);
        });

        // Membuat pion pemain
        const player1Pawn = document.createElement('div');
        player1Pawn.id = 'player1';
        player1Pawn.classList.add('player');
        player1Pawn.innerText = 'P1';

        const player2Pawn = document.createElement('div');
        player2Pawn.id = 'player2';
        player2Pawn.classList.add('player');
        player2Pawn.innerText = 'AI';

        // Menempatkan pion di luar papan pada awalnya
        document.body.appendChild(player1Pawn);
        document.body.appendChild(player2Pawn);
    }
    
    // Fungsi untuk menggerakkan pion pemain
    function movePlayer(player, position) {
        const pawn = document.getElementById(`player${player}`);
        if (position > 0) {
            const cell = document.querySelector(`[data-cell='${position}']`);
            cell.appendChild(pawn);
        }
    }

    // Fungsi untuk melempar dadu
    function rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    // Fungsi utama untuk menjalankan giliran
    async function playTurn() {
        if (!gameActive) return;
        
        rollDiceBtn.disabled = true;
        
        const roll = rollDice();
        const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        diceResult.innerText = diceSymbols[roll - 1];

        let currentPosition = (currentPlayer === 1) ? player1Position : player2Position;
        let newPosition = currentPosition + roll;

        if (newPosition > boardSize) {
            newPosition = currentPosition; // Tidak bergerak jika melebihi 100
            message.innerText = `Pemain ${currentPlayer} melempar ${roll}. Terlalu jauh! Tetap di posisi ${currentPosition}.`;
        } else {
            message.innerText = `Pemain ${currentPlayer} melempar ${roll} dan bergerak ke ${newPosition}.`;
            currentPosition = newPosition;
        }

        // Pindahkan pion secara visual
        if (currentPlayer === 1) {
            player1Position = currentPosition;
            movePlayer(1, player1Position);
        } else {
            player2Position = currentPosition;
            movePlayer(2, player2Position);
        }

        await new Promise(resolve => setTimeout(resolve, 800)); // Jeda untuk efek visual

        // Cek Ular atau Tangga
        if (snakesAndLadders[currentPosition]) {
            const finalPosition = snakesAndLadders[currentPosition];
            const isLadder = finalPosition > currentPosition;
            message.innerText = `Pemain ${currentPlayer} mendarat di ${isLadder ? 'tangga' : 'ular'}! Bergerak ke ${finalPosition}.`;
            
            currentPosition = finalPosition;

            await new Promise(resolve => setTimeout(resolve, 800)); // Jeda lagi
            
            if (currentPlayer === 1) {
                player1Position = currentPosition;
                movePlayer(1, player1Position);
            } else {
                player2Position = currentPosition;
                movePlayer(2, player2Position);
            }
        }
        
        // Cek Pemenang
        if (currentPosition === boardSize) {
            gameActive = false;
            message.innerText = `Pemain ${currentPlayer} menang! 🎉`;
            turnInfo.innerText = "Selesai!";
            rollDiceBtn.style.display = 'none'; // Sembunyikan tombol
            return;
        }

        // Ganti giliran
        switchPlayer();
    }

    // Fungsi untuk mengganti giliran pemain
    function switchPlayer() {
        currentPlayer = (currentPlayer === 1) ? 2 : 1;
        turnInfo.innerText = `Giliran ${currentPlayer === 1 ? 'Pemain 1 (Anda)' : 'Pemain 2 (AI)'}`;

        if (currentPlayer === 2 && gameActive) {
            rollDiceBtn.disabled = true;
            // AI akan bermain setelah jeda singkat
            setTimeout(() => {
                playTurn();
            }, 1500);
        } else {
            rollDiceBtn.disabled = false;
        }
    }
    
    // Event listener untuk tombol kocok dadu
    rollDiceBtn.addEventListener('click', playTurn);

    // Inisialisasi permainan
    createBoard();
});