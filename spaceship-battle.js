// spaceship-battle.js

let canvas, context;
let intervalTimer;
const TIME_INTERVAL = 25;
let GAME_DURATION = 120000; 
const bgImage = new Image();
bgImage.src = "images/background.jpg"; 
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

const enemyShipImages = [
  new Image(),
  new Image(),
  new Image(),
  new Image()
];

enemyShipImages[0].src = 'images/enemyShip4.png';
enemyShipImages[1].src = 'images/enemyShip2.png';
enemyShipImages[2].src = 'images/enemyShip.png';
enemyShipImages[3].src = 'images/enemyShip3.png';

const explosionSound = new Audio("sounds/explosion3.mp3");
const blastSound = new Audio("sounds/laser.mp3");
const playerHitSound = new Audio("sounds/respawn.mp3");
playerHitSound.volume = 0.8; 


explosionSound.volume = 0.3;
blastSound.volume = 0.7;
bgMusic.volume = 0.3

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
  let soundEnabled = true; 

  const button = document.getElementById("startButton");
  button.value = "Start New Game";
  button.addEventListener("click", () => {
    newGame();
  });

  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyup);
  

  const colorInput = document.getElementById("beam-color");
  if (window.gameSettings) {
    beamColor = window.gameSettings.beamColor || beamColor;
    GAME_DURATION = window.gameSettings.gameLength || GAME_DURATION;
    soundEnabled = window.gameSettings.soundEnabled !== false; 
  }
  
  if (colorInput) beamColor = colorInput.value || beamColor;
  if (window.gameSettings) {
    beamColor = window.gameSettings.beamColor || beamColor;
    GAME_DURATION = window.gameSettings.gameLength || GAME_DURATION;
  }
  movementKeys.left = window.gameSettings.moveLeft || "ArrowLeft";
  movementKeys.right = window.gameSettings.moveRight || "ArrowRight";
  movementKeys.up = window.gameSettings.moveUp || "ArrowUp";
  movementKeys.down = window.gameSettings.moveDown || "ArrowDown";
  movementKeys.fire = window.gameSettings.fireKey || " ";
  if (soundEnabled) {
    bgMusic.currentTime = 0;
    bgMusic.play();
  }
  if (window.gameSettings?.selectedShip) {
    goodShipImg.src = `images/${window.gameSettings.selectedShip}`;
  }
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
        alive: true,
        image: enemyShipImages[row] 
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

      
    blastSound.currentTime = 0;
    blastSound.play();
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

        
        explosionSound.currentTime = 0;
        explosionSound.play();
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
      
      
      playerHitSound.currentTime = 0;
      playerHitSound.play();
      
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
    
  context.strokeStyle = "#ffffff88"; 
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, canvasHeight * 0.6);
  context.lineTo(canvasWidth, canvasHeight * 0.6);
  context.stroke();

  context.drawImage(goodShipImg, playerShip.x, playerShip.y, playerShip.width, playerShip.height);
  context.fillStyle = beamColor;
  cannonballs.forEach(ball => {
    const gradient = context.createRadialGradient(
      ball.x, ball.y, 0,
      ball.x, ball.y, ball.radius * 2
    );
  
    gradient.addColorStop(0, beamColor); 
    gradient.addColorStop(0.5, beamColor + "99"); 
    gradient.addColorStop(1, "transparent"); 
  
    context.fillStyle = gradient;
    context.shadowColor = beamColor;
    context.shadowBlur = 15;
  
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius * 1.5, 0, Math.PI * 2);
    context.fill();
  
   
    context.shadowBlur = 0;
  });
  
  enemyShips.forEach(ship => {
    if (!ship.alive) return;
    context.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
  });
  
  enemyBolts.forEach(bolt => {
    const gradient = context.createRadialGradient(
      bolt.x, bolt.y, 0,
      bolt.x, bolt.y, bolt.radius * 3 
    );
    gradient.addColorStop(0, "#ff3c3c");
    gradient.addColorStop(0.5, "#ff3c3ccc");
    gradient.addColorStop(1, "transparent");
  
    context.fillStyle = gradient;
    context.shadowColor = "#ff3c3c";
    context.shadowBlur = 25; 
  
    context.beginPath();
    context.arc(bolt.x, bolt.y, bolt.radius * 2, 0, Math.PI * 2);
    context.fill();
  
    context.shadowBlur = 0;
  });
  
  document.getElementById("hud-score").textContent = "Score: " + score;
  document.getElementById("hud-lives").textContent = "Lives: " + lives;
  const timeLeft = Math.max(0, Math.floor((GAME_DURATION - timeElapsed) / 1000));
  document.getElementById("hud-time").textContent = "Time Left: " + timeLeft + "s";

}

function displayEndMessage(message) {
  
  const spaceshipSection = document.getElementById("spaceship");
  if (!spaceshipSection.classList.contains("active")) {
    return;
  }
  
  const oldMsg = document.getElementById("game-end-message");
  if (oldMsg) oldMsg.remove();

  const msgDiv = document.createElement("div");
  msgDiv.id = "game-end-message";

  
  msgDiv.innerHTML = `
  <div style="margin-bottom: 20px;">${message}</div>
  <div id="scoreboard-container">
    <h3 style="margin-bottom: 10px; font-size: 20px; color: #8acaf0;">📋 Session Scoreboard</h3>
    <table class="scoreboard-table" id="scoreboard"></table>
  </div>
  <button id="close-end-message" class="close-end-button">✖ Close</button>
`;

  
  Object.assign(msgDiv.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "linear-gradient(145deg, #1b2735, #141e2a)",
    color: "#00ffe1",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "28px",
    padding: "30px 50px",
    borderRadius: "16px",
    border: "1px solid #00d9ff",
    textAlign: "center",
    zIndex: 999,
    boxShadow: "0 0 20px #00ffe180",
    backdropFilter: "blur(8px)"
  });

  document.body.appendChild(msgDiv);

  
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

  
  const sortedScores = [...sessionScores].sort((a, b) => b.score - a.score);

  const latest = sessionScores[sessionScores.length - 1];

  board.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th>Status</th>
        <th>Score</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      ${sortedScores.map((entry, index) => {
        const isLatest = entry === latest;
        return `
          <tr style="${isLatest ? 'background-color:#00ffe130;font-weight:bold;color:#fff;' : ''}">
            <td>${index + 1}</td>
            <td>${entry.status}</td>
            <td>${entry.score}</td>
            <td>${entry.time}s</td>
          </tr>`;
      }).join("")}
    </tbody>
  `;
}



function addToScoreboard(status) {
   const timeSec = Math.floor(timeElapsed / 1000);
   const emoji = status.includes("Champion") ? "🏆" :
                 status.includes("Winner") ? "🎉" :
                 status.includes("Lost") ? "💀" : "😐";
   sessionScores.push({ score, status: `${emoji} ${status}`, time: timeSec });
}

