const score = function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

const win = score(50, 100)


let gameState = {
    players: [
        { total: 0, current: 0, name: 'רון' },
        { total: 0, current: 0, name: 'דני' }
    ],
    currentPlayer: 0,
    gameActive: true,
    gameMode: 'pvp',
    rolling: false
};

const diceFaces = {
    1: [{ x: 50, y: 50 }],
    2: [{ x: 25, y: 25 }, { x: 75, y: 75 }],
    3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }],
    4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
    5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
    6: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }]
};

function updateDisplay() {
    document.getElementById('player1Total').textContent = gameState.players[0].total;
    document.getElementById('player1Current').textContent = gameState.players[0].current;
    document.getElementById('player2Total').textContent = gameState.players[1].total;
    document.getElementById('player2Current').textContent = gameState.players[1].current;


    const player1Card = document.getElementById('player1Card');
    const player2Card = document.getElementById('player2Card');
    const players = [player1Card,player2Card]

    if (gameState.currentPlayer === 0) {
        const player = Math.floor(Math.random() * 2)
        players[player].classList.add('active');
        if (player === 1) {
            players[player - 1].classList.remove('active');
        } else {

            players[player + 1].classList.remove('active');
        }
        player1Card.querySelector('.current-turn').textContent = 'תורך!';
        player2Card.querySelector('.current-turn').textContent = 'המתן...';
    } else {
        player1Card.classList.remove('active');
        player2Card.classList.add('active');
        player1Card.querySelector('.current-turn').textContent = 'המתן...';
        player2Card.querySelector('.current-turn').textContent = 'תורך!';
    }
}

function drawDice(number) {
    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');
    const face1 = dice1.querySelector('.dice-face');
    const face2 = dice2.querySelector('.dice-face');

    face1.innerHTML = '';
    face2.innerHTML = '';

    const dots1 = diceFaces[number];
    dots1.forEach(dot => {
        const dotEl1 = document.createElement('span');
        dotEl1.className = 'dot';
        dotEl1.style.left = `${dot.x}%`;
        dotEl1.style.top = `${dot.y}%`;
        const dotEl2 = document.createElement('span');
        dotEl2.className = 'dot';
        dotEl2.style.left = `${dot.x}%`;
        dotEl2.style.top = `${dot.y}%`;
        face1.appendChild(dotEl1);
        face2.appendChild(dotEl2);
    });
}

async function rollDice() {
    if (!gameState.gameActive || gameState.rolling) return;

    gameState.rolling = true;
    const dice = document.querySelectorAll('.dice');
    dice.classList += 'rolling';

    for (let i = 0; i < 10; i++) {
        drawDice(Math.floor(Math.random() * 6) + 1);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const number1 = Math.floor(Math.random() * 6) + 1;
    const number2 = Math.floor(Math.random() * 6) + 1;
    const result = [number1, number2]
    drawDice(number1);
    drawDice(number2);
    dice.classList -= 'rolling';
    gameState.rolling = false;

    return result;
}

document.getElementById('rollBtn').addEventListener('click', async () => {
    if (!gameState.gameActive || gameState.rolling) return;

    document.getElementById('resultMessage').textContent = '';

    const roll = await rollDice();

    if (roll[0] === roll[1]) {

        gameState.players[gameState.currentPlayer].current = 0;
        gameState.players[gameState.currentPlayer].total = 0;
        showMessage(`הטלת דאבל! איבדת את כל הנקודות! `, 'error');

        await new Promise(resolve => setTimeout(resolve, 1500));
        switchPlayer();
    } else {
        function calculator(someArray) {
            let result = 0
            for (let i = 0; i < someArray.length; i++) {
                result = result + someArray[i]
            }
            return result
        }
        gameState.players[gameState.currentPlayer].current = calculator(roll);
        gameState.players[gameState.currentPlayer].total = gameState.players[gameState.currentPlayer].total + calculator(roll)
        updateDisplay();
        showMessage(`🎲 הטלת ${roll}!`, 'info');
    }
});


document.getElementById('holdBtn').addEventListener('click', () => {
    if (!gameState.gameActive || gameState.rolling) return;

    const player = gameState.players[gameState.currentPlayer];

    if (player.current === 0) {
        showMessage('אין מה לשמור! הטל קובייה תחילה.', 'error');
        return;
    }

    player.total += player.current;
    player.current = 0;

    updateDisplay();

    if (player.total >= win) {
        endGame();
    } else {
        showMessage(`✅ נשמר! ${player.total} נקודות סה"כ.`, 'success');
        setTimeout(() => {
            switchPlayer();
        }, 1000);
    }
});

async function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 0 ? 1 : 0;
    updateDisplay();
    document.getElementById('resultMessage').textContent = '';
}

function endGame() {
    gameState.gameActive = false;

    const winner = gameState.players[gameState.currentPlayer];
    const winnerName = gameState.currentPlayer === 0 ? 'שחקן 1' : 'שחקן 2'
    showMessage(`🎉 ${winnerName} ניצח עם ${winner.total} נקודות!`, 'success');
    celebrate();
}

document.getElementById('newGameBtn').addEventListener('click', newGame);

function newGame() {
    gameState.players = [
        { total: 0, current: 0, name: 'שחקן 1' },
        { total: 0, current: 0, name: 'שחקן 2' }
    ];
    gameState.currentPlayer = 0;
    gameState.gameActive = true;
    gameState.rolling = false;

    updateDisplay();
    drawDice(1);
    document.getElementById('resultMessage').textContent = '';
}

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (gameState.rolling) return;

        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        gameState.gameMode = btn.dataset.mode;

        document.querySelector('#player2Card h3').textContent = '👤 שחקן 2';
        newGame();
    });
});

function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('resultMessage');
    messageEl.textContent = text;
    messageEl.className = `result-message ${type}`;
    messageEl.style.display = 'block';
}

function celebrate() {
    const card = document.getElementById(`player${gameState.currentPlayer + 1}Card`);
    card.classList.add('winner');

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 30);
    }
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
    confetti.style.background = ['#FFD700', '#FF6347', '#4169E1', '#32CD32', '#FF69B4'][Math.floor(Math.random() * 5)];

    document.body.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 3000);
}
updateDisplay();

