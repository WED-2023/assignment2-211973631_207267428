// Global user array for current session
const registeredUsers = [
    { username: "p", password: "testuser" }  // default account
  ];
  

function showSection(id) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  document.getElementById(id).classList.add('active');
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
      alert("אנא מלא את כל השדות.");
      return;
    }
  
    // Check password strength (letters + numbers + at least 8 characters)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("הסיסמה חייבת להכיל לפחות 8 תווים, כולל אותיות ומספרים.");
      return;
    }
  
    // Check that first and last name don't contain numbers
    const nameRegex = /^[A-Za-z\u0590-\u05FF\s'-]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      alert("שם פרטי ושם משפחה לא יכולים להכיל מספרים.");
      return;
    }
  
    // Check valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("כתובת המייל אינה חוקית.");
      return;
    }
  
    // Confirm password match
    if (password !== confirmPassword) {
      alert("הסיסמה ואימות הסיסמה אינם תואמים.");
      return;
    }
  
    // Store new user in session
    registeredUsers.push({ username, password });

    alert("ההרשמה הצליחה 🎉 עכשיו ניתן להתחבר.");
    showSection('login');
  }

  function validateLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
  
    const foundUser = registeredUsers.find(user => 
      user.username === username && user.password === password
    );
  
    if (foundUser) {
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
  
  // Optional: close modal if clicked outside
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
      fireKey
      // you can pass movement/fire keys too if your game uses them
    };
  
    // Go to game screen
    showSection("spaceship");
  
    // Start game only if setupGame is available
    if (typeof setupGame === "function") {
      setupGame();
    }

    // 💥 Start the game immediately
    if (typeof newGame === "function") {
    newGame();
    }
  }
  