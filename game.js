const bgMusic = document.getElementById("bgMusic");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const bg = new Image();
bg.src = "img/background.png";

const birdImg = new Image();
birdImg.src = "img/bird.png";

const pipeImg = new Image();
pipeImg.src = "img/pipe.png";

const starImg = new Image();
starImg.src = "img/star.png";

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const recordText = document.getElementById("record");

const PIPE_WIDTH = 180;
const PIPE_HEIGHT = 900;
const GAP = 350;

let gameStarted = false;
let gameOver = false;
let score = 0;
let starsCollected = 0;

let bestScore =
    Number(localStorage.getItem("bestScore")) || 0;

recordText.textContent =
    "Рекорд: " + bestScore;

const bird = {
    x: 180,
    y: 300,
    width: 180,
    height: 180,
    velocity: 0,
    gravity: 0.28,
    jumpPower: -7
};

let pipes = [];
let stars = [];

startBtn.addEventListener("click", () => {

    menu.style.display = "none";
    canvas.style.display = "block";

    gameStarted = true;
});

function flap() {

    if (gameOver) {

    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const centerX = canvas.width / 2;

    ctx.textAlign = "center";

    ctx.shadowColor = "red";
    ctx.shadowBlur = 40;

    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 120px Cinzel";

    ctx.fillText(
        "GAME OVER",
        centerX,
        canvas.height / 2 - 180
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle = "white";
    ctx.font = "bold 55px Cinzel";

    ctx.fillText(
        "Score: " + score,
        centerX,
        canvas.height / 2 - 40
    );

    ctx.fillStyle = "#ffd700";

    ctx.fillText(
        "Stars: " + starsCollected,
        centerX,
        canvas.height / 2 + 40
    );

    ctx.fillStyle = "#00ff88";

    ctx.fillText(
        "Best Score: " + bestScore,
        centerX,
        canvas.height / 2 + 120
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "40px Cinzel";

    ctx.fillText(
        "Press R to Restart",
        centerX,
        canvas.height / 2 + 220
    );

    ctx.textAlign = "left";
}

    bird.velocity = bird.jumpPower;
}

document.addEventListener("click", () => {
    if (gameStarted) flap();
});

document.addEventListener("keydown", (e) => {

    if (e.code === "Space") {
        if (gameStarted) flap();
    }

    if (e.code === "KeyR" && gameOver) {
        location.reload();
    }
});

function createPipe() {

    if (!gameStarted || gameOver) return;

    const topHeight =
        Math.random() *
        (canvas.height - GAP - 400) + 150;

    pipes.push({
        x: canvas.width,
        topHeight,
        passed: false
    });
}

function createStar() {

    if (!gameStarted || gameOver) return;

    stars.push({
        x: canvas.width,
        y: Math.random() *
            (canvas.height - 250) + 100,
        size: 60
    });
}

setInterval(createPipe, 1800);
setInterval(createStar, 2500);

function update() {

    if (!gameStarted || gameOver) return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y < 0) {
        bird.y = 0;
    }

    if (bird.y + bird.height >= canvas.height) {
        endGame();
    }

    for (let star of stars) {
        star.x -= 5;
    }

    stars.forEach((star, index) => {

        if (
            bird.x < star.x + star.size &&
            bird.x + bird.width > star.x &&
            bird.y < star.y + star.size &&
            bird.y + bird.height > star.y
        ) {
            starsCollected++;
            stars.splice(index, 1);
        }
    });

    for (let pipe of pipes) {

        pipe.x -= 5;

        if (
            !pipe.passed &&
            pipe.x + PIPE_WIDTH < bird.x
        ) {
            pipe.passed = true;
            score++;
        }

        const birdLeft = bird.x + 25;
        const birdRight = bird.x + bird.width - 25;
        const birdTop = bird.y + 25;
        const birdBottom =
            bird.y + bird.height - 25;

        const insidePipeX =
            birdRight > pipe.x + 10 &&
            birdLeft < pipe.x + PIPE_WIDTH - 10;

        if (insidePipeX) {

            if (
                birdTop < pipe.topHeight ||
                birdBottom >
                pipe.topHeight + GAP
            ) {
                endGame();
            }
        }
    }

    pipes = pipes.filter(
        pipe => pipe.x > -PIPE_WIDTH
    );

    stars = stars.filter(
        star => star.x > -100
    );
}

function endGame() {

    if (gameOver) return;

    gameOver = true;

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "bestScore",
            bestScore
        );
    }
}

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.drawImage(
        bg,
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (let pipe of pipes) {

        ctx.save();

        ctx.translate(
            pipe.x + PIPE_WIDTH,
            pipe.topHeight
        );

        ctx.rotate(Math.PI);

        ctx.drawImage(
            pipeImg,
            0,
            0,
            PIPE_WIDTH,
            PIPE_HEIGHT
        );

        ctx.restore();

        ctx.drawImage(
            pipeImg,
            pipe.x,
            pipe.topHeight + GAP,
            PIPE_WIDTH,
            PIPE_HEIGHT
        );
    }

    for (let star of stars) {

        ctx.drawImage(
            starImg,
            star.x,
            star.y,
            star.size,
            star.size
        );
    }

    ctx.drawImage(
        birdImg,
        bird.x,
        bird.y,
        bird.width,
        bird.height
    );

    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.fillText(score, 25, 70);

    ctx.fillStyle = "yellow";
    ctx.font = "bold 40px Arial";
    ctx.fillText(
        "⭐ " + starsCollected,
        25,
        130
    );

    if (gameOver) {

        ctx.fillStyle =
            "rgba(0,0,0,0.65)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "red";
        ctx.font = "bold 100px Arial";

        ctx.fillText(
            "GAME OVER",
            canvas.width / 2 - 320,
            canvas.height / 2 - 80
        );

        ctx.fillStyle = "white";
        ctx.font = "50px Arial";

        ctx.fillText(
            "Point: " + score,
            canvas.width / 2 - 100,
            canvas.height / 2 + 10
        );

        ctx.fillText(
            "Stars: " + starsCollected,
            canvas.width / 2 - 120,
            canvas.height / 2 + 80
        );

        ctx.fillText(
            "A record: " + bestScore,
            canvas.width / 2 - 130,
            canvas.height / 2 + 150
        );

        ctx.font = "40px Arial";

        ctx.fillText(
            "Press R to restar",
            canvas.width / 2 - 190,
            canvas.height / 2 + 230
        );
    }
}

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(
        gameLoop
    );
}

gameLoop();