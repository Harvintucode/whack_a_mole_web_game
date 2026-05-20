const scoreText = document.getElementById("score");
const comboText = document.getElementById("combo");
const timeText = document.getElementById("time");
const livesText = document.getElementById("lives");
const finalScoreText = document.getElementById("final-score");


function updateHUD() {

    scoreText.textContent = score;

    comboText.textContent = combo;

    timeText.textContent = timeLeft;

    livesText.textContent = "❤️".repeat(lives);
}
