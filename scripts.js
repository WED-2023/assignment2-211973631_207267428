// Global user array for current session
const registeredUsers = [
    { username: "p", password: "testuser" }  // default account
  ];
  

function showSection(id) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const chicken = document.getElementById("walking-chicken");
  if (chicken) {
    chicken.style.display = (id === "welcome") ? "block" : "none";
  }
  // If we're leaving the game, stop the background music
  if (id !== "spaceship" && typeof bgMusic !== "undefined") {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
}

function validateRegistration() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const firstName = document.getElementById('register-first-name').value.trim();
    const lastName = document.getElementById('register-last-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const birthdate = document.getElementById('register-birthdate').value;
  
    // Check if any field is empty
    if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !birthdate) {
      alert("Please fill all the fields.");
      return;
    }
  
    // Check password strength 
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("The password must contain at least 8 letters including letters and numbers.");
      return;
    }
  
    // Check that first and last name don't contain numbers
    const nameRegex = /^[A-Za-z\u0590-\u05FF\s'-]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      alert("First name and last name can't contain numbers.");
      return;
    }
  
    // Check valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("invalid email address.");
      return;
    }
  
    // Confirm password match
    if (password !== confirmPassword) {
      alert("The passwords are not matching.")
      return;
    }
  
    // Store new user in session
    registeredUsers.push({ username, password });

    alert("Registration complete!")
    showSection('login');
  }

  function validateLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
  
    const foundUser = registeredUsers.find(user => 
      user.username === username && user.password === password
    );
  
    if (foundUser) {
        // Clear scoreboard on successful login
        sessionScores.length = 0;
        showSection('game-config');
    } else {
      alert("שם המשתמש או הסיסמה שגויים.");
    }
  }

  function openAbout() {
    document.getElementById('about-modal').style.display = 'block';
  }
  
  function closeAbout() {
    document.getElementById('about-modal').style.display = 'none';
  }
  
  
  window.onclick = function(event) {
    const modal = document.getElementById('about-modal');
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };


  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      const modal = document.getElementById('about-modal');
      const isVisible = modal.style.display === 'block';
      
      if (isVisible) {
        closeAbout(); // Close modal if already open
      }
    }
  });


  function startGame() {
    const soundEnabled = document.getElementById("sound").checked;
    const beamColor = document.getElementById("beam-color").value;
    const gameLength = parseInt(document.getElementById("game-length").value || "2") * 60000;
    const moveLeft = document.getElementById("move-left").value;
    const moveRight = document.getElementById("move-right").value;
    const moveUp = document.getElementById("move-up").value;
    const moveDown = document.getElementById("move-down").value;
    let fireKey = document.getElementById("fire-key").value;
    
    if (fireKey === "Space") fireKey = " ";
    // Save game config for spaceship-battle.js
    window.gameSettings = {
      beamColor,
      gameLength,
      moveLeft,
      moveRight,
      moveUp,
      moveDown,
      fireKey,
      soundEnabled,
      selectedShip
      
    };
  
    
    showSection("spaceship");
  
    
    if (typeof setupGame === "function") {
      setupGame();
    }

    
    if (typeof newGame === "function") {
    newGame();
    }
  }


const shipThumbnails = document.querySelectorAll('.ship-thumbnail');
let selectedShip = "goodShip.png"; // default

shipThumbnails.forEach(img => {
  img.addEventListener('click', () => {
    shipThumbnails.forEach(i => i.classList.remove('selected'));
    img.classList.add('selected');
    selectedShip = img.dataset.ship;
  });
});


window.onload = function () {
  const chicken = document.getElementById("walking-chicken");
  let direction = 1; // 1 for right, -1 for left
  let pos = 0;

  function moveChicken() {
    const screenWidth = window.innerWidth;
    const chickenWidth = chicken.offsetWidth;

    pos += direction * 1.5;
    chicken.style.left = `${pos}px`;

    if (pos + chickenWidth >= screenWidth || pos <= 0) {
      direction *= -1;
      chicken.style.transform = `scaleX(${direction})`;
    }

    requestAnimationFrame(moveChicken);
  }

  moveChicken();
};


  