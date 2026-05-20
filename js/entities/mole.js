const gameBoard = document.querySelector(".game-board");
const holes = document.querySelectorAll(".hole");
const moles = document.querySelectorAll(".mole");

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