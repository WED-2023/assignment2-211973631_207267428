// spaceship-battle.js

let canvas, context;
let intervalTimer;
const TIME_INTERVAL = 25;
const GAME_DURATION = 60000; // 60 seconds limit
const bgImage = new Image();
bgImage.src = "images/background.jpg"; // adjust path/filename if needed
const bgMusic = new Audio("sounds/euphoria.mp3");
bgMusic.loop = true;
let canvasWidth, canvasHeight;
let playerShip;
let cannonballs = [];
let cannonballRadius, cannonballSpeed;
let beamColor = "#00bfff";

const enemyRows = 4;
const enemyCols = 5;
const enemySpacing = 10;
const enemyShipWidth = 30;
const enemyShipHeight = 30;
const enemyShips = [];
let enemyVelocityX = 2;
let speedIncreaseTimer = 0;
let speedMultiplier = 1;

let keysPressed = {};
let fireCooldown = 0;
const FIRE_DELAY = 200;

let enemyBolts = [];
let canEnemyFire = true;

const goodShipStartY = () => canvasHeight - 60;

const goodShipImg = new Image();
goodShipImg.src = 'images/goodShip.png';

const enemyShipImg = new Image();
enemyShipImg.src = 'images/enemyShip.png';

let score = 0;
let lives = 3;
let timeElapsed = 0;
let gameEnded = false;
let gameStarted = false;
const sessionScores = [];
let movementKeys = {
  left: "ArrowLeft",
  right: "ArrowRight",
  up: "ArrowUp",
  down: "ArrowDown",
  fire: " "
};
function handleKeydown(event) {
  const activeGame = document.getElementById("spaceship").classList.contains("active");

  if (activeGame && [" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }

  keysPressed[event.key] = true;
}



function handleKeyup(event) {
  keysPressed[event.key] = false;
}
function setupGame() {
  
  canvas = document.getElementById("theCanvas");
  context = canvas.getContext("2d");
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;

  const button = document.getElementById("startButton");
  button.value = "Start New Game";
  button.addEventListener("click", () => {
    newGame();
  });

  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyup);
  

  const colorInput = document.getElementById("beam-color");
  if (colorInput) beamColor = colorInput.value || beamColor;

  movementKeys.left = window.gameSettings.moveLeft || "ArrowLeft";
  movementKeys.right = window.gameSettings.moveRight || "ArrowRight";
  movementKeys.up = window.gameSettings.moveUp || "ArrowUp";
  movementKeys.down = window.gameSettings.moveDown || "ArrowDown";
  movementKeys.fire = window.gameSettings.fireKey || " ";
}

function newGame() {
  playerShip = {
    x: canvasWidth / 2 - 20,
    y: goodShipStartY(),
    width: 40,
    height: 40,
    speed: 10
  };

  cannonballs = [];
  cannonballRadius = 5;
  cannonballSpeed = 6;
  createEnemyFleet();
  enemyVelocityX = 2;
  speedMultiplier = 1;
  speedIncreaseTimer = 0;
  enemyBolts = [];
  canEnemyFire = true;

  score = 0;
  lives = 3;
  timeElapsed = 0;
  gameEnded = false;
  gameStarted = true;

  bgMusic.currentTime = 0;
  bgMusic.play();
  clearInterval(intervalTimer);
  intervalTimer = setInterval(gameLoop, TIME_INTERVAL);
  document.getElementById("game-end-message")?.remove();
}

function createEnemyFleet() {
  enemyShips.length = 0;
  for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemyCols; col++) {
      enemyShips.push({
        x: col * (enemyShipWidth + enemySpacing),
        y: row * (enemyShipHeight + enemySpacing),
        width: enemyShipWidth,
        height: enemyShipHeight,
        alive: true
      });
    }
  }
}

function handleMovement() {
  if (keysPressed[movementKeys.left]) playerShip.x -= playerShip.speed;
  if (keysPressed[movementKeys.right]) playerShip.x += playerShip.speed;
  if (keysPressed[movementKeys.up]) playerShip.y -= playerShip.speed;
  if (keysPressed[movementKeys.down]) playerShip.y += playerShip.speed;
  const minY = canvasHeight * 0.6;
  const maxY = canvasHeight - playerShip.height;
  playerShip.y = Math.max(minY, Math.min(maxY, playerShip.y));
  playerShip.x = Math.max(0, Math.min(canvasWidth - playerShip.width, playerShip.x));
}

function handleFiring() {
  if (keysPressed[movementKeys.fire] && fireCooldown <= 0) {
    cannonballs.push({
      x: playerShip.x + playerShip.width / 2,
      y: playerShip.y,
      radius: cannonballRadius
    });
    fireCooldown = FIRE_DELAY;
  }
  if (fireCooldown > 0) fireCooldown -= TIME_INTERVAL;
}

function maybeFireEnemyBolt() {
  if (!canEnemyFire) return;
  const aliveEnemies = enemyShips.filter(s => s.alive);
  if (aliveEnemies.length === 0) return;
  const randomIndex = Math.floor(Math.random() * aliveEnemies.length);
  const shooter = aliveEnemies[randomIndex];
  enemyBolts.push({ x: shooter.x + shooter.width / 2, y: shooter.y + shooter.height, radius: 4, speed: 4 });
  canEnemyFire = false;
}

function gameLoop() {
  if (gameEnded) return;

  handleMovement();
  handleFiring();
  updatePositions();
  draw();
  timeElapsed += TIME_INTERVAL;

  if (timeElapsed >= GAME_DURATION) {
    gameEnded = true;
    clearInterval(intervalTimer);
    const message = score >= 100 ? "Winner!" : "You can do better!";
    addToScoreboard(message);
    displayEndMessage(`${message}<br>Score: ${score}`);
  }
}

function updatePositions() {
  let reachedEdge = false;
  enemyShips.forEach(ship => {
    if (!ship.alive) return;
    ship.x += enemyVelocityX * speedMultiplier;
    if (ship.x + ship.width >= canvasWidth || ship.x <= 0) reachedEdge = true;
  });
  if (reachedEdge) enemyVelocityX *= -1;

  cannonballs.forEach(ball => ball.y -= cannonballSpeed);
  enemyBolts.forEach(bolt => bolt.y += bolt.speed);

  cannonballs.forEach(ball => {
    enemyShips.forEach(ship => {
      if (!ship.alive) return;
      if (ball.x > ship.x && ball.x < ship.x + ship.width && ball.y > ship.y && ball.y < ship.y + ship.height) {
        ship.alive = false;
        ball.hit = true;
        const rowHit = Math.floor(ship.y / (enemyShipHeight + enemySpacing));
        let bonus = 0;
        if (rowHit === 3) bonus = 5;
        else if (rowHit === 2) bonus = 10;
        else if (rowHit === 1) bonus = 15;
        else if (rowHit === 0) bonus = 20;
        score += bonus;
      }
    });
  });
  cannonballs = cannonballs.filter(ball => ball.y > 0 && !ball.hit);

  if (enemyBolts.length === 0 || enemyBolts[enemyBolts.length - 1].y > canvasHeight * 0.75) {
    canEnemyFire = true;
    maybeFireEnemyBolt();
  }

  enemyBolts.forEach(bolt => {
    if (bolt.x > playerShip.x && bolt.x < playerShip.x + playerShip.width && bolt.y > playerShip.y && bolt.y < playerShip.y + playerShip.height) {
      bolt.hit = true;
      lives--;
      if (lives <= 0) {
        gameEnded = true;
        clearInterval(intervalTimer);
        addToScoreboard("You Lost!");
        displayEndMessage("You Lost!<br>Score: " + score);
        return;
      } else {
        playerShip.x = canvasWidth / 2 - 20;
        playerShip.y = goodShipStartY();
      }
    }
  });
  enemyBolts = enemyBolts.filter(bolt => bolt.y < canvasHeight && !bolt.hit);

  speedIncreaseTimer += TIME_INTERVAL;
  if (speedIncreaseTimer >= 5000 && speedMultiplier < 4) {
    speedMultiplier = Math.min(4, speedMultiplier * 1.5);
    speedIncreaseTimer = 0;
  }

  const aliveEnemies = enemyShips.filter(s => s.alive);
  if (aliveEnemies.length === 0) {
    gameEnded = true;
    clearInterval(intervalTimer);
    addToScoreboard("Champion!");
    displayEndMessage("Champion!<br>Score: " + score);
  }
}

function draw() {
  
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw background image
  if (bgImage.complete) {
    context.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
  }
    // Draw movement boundary line at 60% height
  context.strokeStyle = "#ffffff88"; // semi-transparent white
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, canvasHeight * 0.6);
  context.lineTo(canvasWidth, canvasHeight * 0.6);
  context.stroke();

  context.drawImage(goodShipImg, playerShip.x, playerShip.y, playerShip.width, playerShip.height);
  context.fillStyle = beamColor;
  cannonballs.forEach(ball => {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
  });
  enemyShips.forEach(ship => {
    if (!ship.alive) return;
    context.drawImage(enemyShipImg, ship.x, ship.y, ship.width, ship.height);
  });
  context.fillStyle = "red";
  enemyBolts.forEach(bolt => {
    context.beginPath();
    context.arc(bolt.x, bolt.y, bolt.radius, 0, Math.PI * 2);
    context.fill();
  });
  document.getElementById("hud-score").textContent = "Score: " + score;
  document.getElementById("hud-lives").textContent = "Lives: " + lives;
  document.getElementById("hud-time").textContent = "Time: " + Math.floor(timeElapsed / 1000) + "s";
}

function displayEndMessage(message) {
  // Remove existing message if there is one
  const oldMsg = document.getElementById("game-end-message");
  if (oldMsg) oldMsg.remove();

  const msgDiv = document.createElement("div");
  msgDiv.id = "game-end-message";

  // Set message content, including the close button
  msgDiv.innerHTML = `
    <div style="margin-bottom: 15px;">${message}</div>
    <div id="scoreboard" style="text-align: left; font-size: 18px;"></div>
    <button id="close-end-message" class="close-end-button">✖ Close</button>
  `;

  // Style the popup
  Object.assign(msgDiv.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#fff",
    fontSize: "32px",
    background: "rgba(0,0,0,0.7)",
    padding: "20px 40px",
    borderRadius: "10px",
    textAlign: "center",
    zIndex: 999
  });

  document.body.appendChild(msgDiv);

  // Now attach the close event listener AFTER appending
  const closeBtn = document.getElementById("close-end-message");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      msgDiv.remove();
    });
  }

  updateScoreboard();
}


function updateScoreboard() {
   const board = document.getElementById("scoreboard");
   if (!board) return;
   board.innerHTML = "<h3 style='margin-bottom: 10px;'>📋 Session Scoreboard</h3>" +
     sessionScores.map((s, i) =>
       `<div>Game ${i + 1}: ${s.status} — Score: ${s.score} — Time: ${s.time}s</div>`
     ).join("");
}

function addToScoreboard(status) {
   const timeSec = Math.floor(timeElapsed / 1000);
   const emoji = status.includes("Champion") ? "🏆" :
                 status.includes("Winner") ? "🎉" :
                 status.includes("Lost") ? "💀" : "😐";
   sessionScores.push({ score, status: `${emoji} ${status}`, time: timeSec });
}

