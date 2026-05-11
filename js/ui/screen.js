const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const debuffModal = document.getElementById("debuff-modal");

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
