// Screens
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const debuffModal = document.getElementById("debuff-modal");

// Buttons
const btnNormal = document.getElementById("btn-normal");
const btnEndless = document.getElementById("btn-endless");
const btnRestart = document.getElementById("btn-restart");

// HUD
const scoreText = document.getElementById("score");
const comboText = document.getElementById("combo");
const timeText = document.getElementById("time");
const livesText = document.getElementById("lives");
const finalScoreText = document.getElementById("final-score");

// Game board
const gameBoard = document.querySelector(".game-board");
const holes = document.querySelectorAll(".hole");
const moles = document.querySelectorAll(".mole");


// ===============================
// GAME STATE
// ===============================

let gameMode = "normal";

let score = 0;
let combo = 0;
let timeLeft = 60;
let lives = 3;

let gameRunning = false;

let gameTimer = null;
let moleTimer = null;


// ===============================
// START GAME
// ===============================

function startGame(mode) {

    gameMode = mode;

    resetGameData();

    showGameScreen();

    gameRunning = true;

    updateHUD();

    startTimer();

    startMoleLoop();

    console.log("Game Started:", mode);
}


// ===============================
// RESET DATA
// ===============================

function resetGameData() {

    score = 0;
    combo = 0;

    lives = 3;

    if (gameMode === "normal") {
        timeLeft = 60;
    }
    else {
        timeLeft = 9999;
    }
}


// ===============================
// SCREEN CONTROL
// ===============================

function showGameScreen() {

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");
}

function showGameOverScreen() {

    gameScreen.classList.add("hidden");

    gameOverScreen.classList.remove("hidden");

    finalScoreText.textContent = score;
}


// ===============================
// HUD UPDATE
// ===============================

function updateHUD() {

    scoreText.textContent = score;

    comboText.textContent = combo;

    timeText.textContent = timeLeft;

    livesText.textContent = "❤️".repeat(lives);
}


// ===============================
// TIMER
// ===============================

function startTimer() {

    if (gameMode !== "normal") return;

    gameTimer = setInterval(() => {

        timeLeft--;

        updateHUD();

        if (timeLeft <= 0) {
            endGame();
        }

    }, 1000);
}


// ===============================
// MOLE LOOP
// ===============================

function startMoleLoop() {

    moleTimer = setInterval(() => {

        spawnRandomMole();

    }, 1000);
}


// ===============================
// RANDOM MOLE
// ===============================

function spawnRandomMole() {

    const randomIndex = Math.floor(Math.random() * holes.length);

    const hole = holes[randomIndex];

    const mole = hole.querySelector(".mole");

    // mole up
    hole.classList.add("up");

    // reset trạng thái
    hole.classList.remove("warning");
    hole.classList.remove("hit");

    // image
    mole.src = "assets/hamster_normal.png";

    // warning effect
    setTimeout(() => {

        if (hole.classList.contains("up")) {
            hole.classList.add("warning");
        }

    }, 1500);

    // hide mole
    setTimeout(() => {

        hole.classList.remove("up");
        hole.classList.remove("warning");

    }, 2000);
}


// ===============================
// HIT MOLE
// ===============================

function hitMole(hole, mole) {

    if (!hole.classList.contains("up")) return;

    if (hole.classList.contains("hit")) return;

    hole.classList.add("hit");

    score += 10;

    combo++;

    updateHUD();

    // change image
    mole.src = "assets/hamster_normal_hit.png";

    // hide after hit
    setTimeout(() => {

        hole.classList.remove("up");
        hole.classList.remove("warning");

    }, 300);
}


// ===============================
// END GAME
// ===============================

function endGame() {

    gameRunning = false;

    clearInterval(gameTimer);
    clearInterval(moleTimer);

    showGameOverScreen();

    console.log("Game Over");
}


// ===============================
// RESTART
// ===============================

function restartGame() {

    clearInterval(gameTimer);
    clearInterval(moleTimer);

    startGame(gameMode);
}


// ===============================
// EVENT LISTENERS
// ===============================

// Start buttons
btnNormal.addEventListener("click", () => {

    startGame("normal");

});

btnEndless.addEventListener("click", () => {

    startGame("endless");

});


// Restart
btnRestart.addEventListener("click", () => {

    restartGame();

});


// Mole click
holes.forEach((hole) => {

    const mole = hole.querySelector(".mole");

    mole.addEventListener("click", () => {

        hitMole(hole, mole);

    });

});


// ===============================
// INIT
// ===============================

console.log("Main.js Loaded");