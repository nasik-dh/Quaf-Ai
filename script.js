let audioContext;
let matrixMode = "green";
let alertSound = null;
let gameStarted = false;
let commandHistory = [];

// User session variables
let userSession = {
  firstCommand: false,
  nameAsked: false,
  emailAsked: false,
  userName: '',
  userEmail: '',
  dataSubmitted: false,
  messages: [] // Store all user messages
};

// Initialize Audio Context
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Generate alert sound
function playAlertSound(duration = 1000) {
  if (!audioContext) initAudio();

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    400,
    audioContext.currentTime + 0.1
  );

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration / 1000
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Send data to Google Sheets (initial registration)
async function sendToGoogleSheets(name, email) {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbz9gsDyeOIWw78qyqoi1iWkT1EWJobgJuPkSFqPihJuF_didy49Zy7f5kwTokhyvZ9aLg/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&action=register`
    });
    
    return true; // Since it's no-cors, we assume success
  } catch (error) {
    console.error('Error sending data:', error);
    return false;
  }
}

// Send message log to Google Sheets
async function sendMessageToSheet(message) {
  if (userSession.dataSubmitted && userSession.userName && userSession.userEmail) {
    try {
      await fetch('https://script.google.com/macros/s/AKfycbz9gsDyeOIWw78qyqoi1iWkT1EWJobgJuPkSFqPihJuF_didy49Zy7f5kwTokhyvZ9aLg/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `name=${encodeURIComponent(userSession.userName)}&email=${encodeURIComponent(userSession.userEmail)}&message=${encodeURIComponent(message)}&timestamp=${encodeURIComponent(new Date().toLocaleString())}&action=message`
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

// Matrix Rain Effect
class MatrixRain {
  constructor() {
    this.canvas = document.getElementById("matrixCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.characters =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    this.drops = [];
    this.fontSize = 16;
    this.mode = "green";

    this.resize();
    this.init();
    this.animate();

    window.addEventListener("resize", () => this.resize());
    // Also listen for orientation changes to handle iOS viewport height changes
    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.resize(), 300);
    });
  }

  resize() {
    // Handle high DPI screens for crisp text
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + "px";
    this.canvas.style.height = window.innerHeight + "px";
    this.ctx.scale(dpr, dpr);

    this.columns = Math.floor(window.innerWidth / this.fontSize);
    this.drops = Array(this.columns)
      .fill(0)
      .map(() => Math.random() * -100);
  }

  init() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate() {
    this.ctx.fillStyle =
      this.mode === "green"
        ? "rgba(0, 0, 0, 0.05)"
        : "rgba(0, 0, 0, 0.05)";
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    const color = this.mode === "green" ? "#00ff00" : "#ff0000";
    this.ctx.fillStyle = color;
    this.ctx.font = `${this.fontSize}px 'Orbitron', monospace`;

    for (let i = 0; i < this.drops.length; i++) {
      const char = this.characters[Math.floor(Math.random() * this.characters.length)];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      this.ctx.fillText(char, x, y);

      if (y > window.innerHeight && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }

    requestAnimationFrame(() => this.animate());
  }

  setMode(mode) {
    this.mode = mode;
  }
}

// Initialize Matrix Rain
const matrix = new MatrixRain();

// Hacker Responses
const hackerResponses = {
  greetings: [
    "Hello, fellow hacker. Welcome to the matrix.",
    "Greetings, cyber warrior. Ready to hack the system?",
    "Hey there, digital ghost. What's your mission today?",
    "Welcome to the underground, hacker. What brings you here?",
    "Salutations, code breaker. The system awaits your command.",
  ],
  help: `
AVAILABLE COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• help / ? - Show this help menu
• hi / hello - Greet the system
• status - Check system status
• scan - Perform network scan
• hack - Initiate hacking sequence
• info - System information
• time - Current system time
• joke - Get a hacker joke
• quote - Random hacker quote
• clear - Clear terminal
• exit - Exit command interface
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  status: [
    "SYSTEM STATUS: ONLINE\nFIREWALL: BYPASSED\nSECURITY: COMPROMISED\nACCESS LEVEL: ROOT",
    "NETWORK STATUS: CONNECTED\nENCRYPTION: CRACKED\nSURVEILLANCE: DISABLED\nSTEALTH MODE: ACTIVE",
    "SYSTEM ANALYSIS: COMPLETE\nVULNERABILITIES: 47 FOUND\nBACKDOORS: 12 INSTALLED\nMISSION: IN PROGRESS",
  ],
  scan: [
    "SCANNING NETWORK...\n192.168.1.1 - ROUTER [VULNERABLE]\n192.168.1.100 - TARGET [SECURED]\n192.168.1.250 - HONEYPOT [DETECTED]\nSCAN COMPLETE: 3 DEVICES FOUND",
    "PORT SCANNING INITIATED...\nPORT 22: SSH [OPEN]\nPORT 80: HTTP [OPEN]\nPORT 443: HTTPS [FILTERED]\nPORT 3389: RDP [CLOSED]\nSCAN RESULTS: 2 VULNERABLE PORTS",
    "VULNERABILITY SCAN RUNNING...\nSQL INJECTION: POSSIBLE\nXSS DETECTED: HIGH RISK\nBUFFER OVERFLOW: CRITICAL\nRECOMMENDED ACTION: EXPLOIT IMMEDIATELY",
  ],
  hack: [
    "INITIATING HACK SEQUENCE...\n[██████████] 100%\nACCESS GRANTED: SYSTEM COMPROMISED\nROOT PRIVILEGES: OBTAINED\nHACK SUCCESSFUL!",
    "LAUNCHING CYBER ATTACK...\n[████████░░] 80%\nBYPASSING SECURITY...\n[██████████] 100%\nTARGET BREACHED: MISSION ACCOMPLISHED",
    "EXECUTING EXPLOIT...\n[███░░░░░░░] 30%\nCRACKING PASSWORDS...\n[████████░░] 80%\nSYSTEM HACKED: FULL CONTROL ACHIEVED",
  ],
  info: `
SYSTEM INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OS: LINUX KALI 2024.1 (HACKER EDITION)
KERNEL: 6.8.11-amd64
CPU: INTEL i9-14900K @ 5.8GHz
RAM: 64GB DDR5-6000
GPU: NVIDIA RTX 4090 (CRYPTO MINING DISABLED)
TOOLS: METASPLOIT, NMAP, WIRESHARK, BURP SUITE
STATUS: FULLY OPERATIONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  jokes: [
    "Why do hackers prefer dark mode?\nBecause light attracts bugs!",
    "How many hackers does it take to change a light bulb?\nNone, they just exploit the darkness.",
    "What's a hacker's favorite type of music?\nRAP... (Remote Access Protocol)",
    "Why don't hackers ever get lost?\nBecause they always find the backdoor!",
    "What do you call a hacker who's also a musician?\nA bandwidth!",
  ],
  quotes: [
    '"The best way to get information is to not ask for it." - Anonymous',
    '"Security is not a product, but a process." - Bruce Schneier',
    "\"In the world of hacking, today's security is tomorrow's vulnerability.\" - Unknown",
    '"Privacy is not about hiding something. It\'s about protecting everything." - Anonymous',
    '"The only truly secure system is one that is powered off." - Gene Spafford',
  ],
  unknown: [
    "TYPE 'help' FOR AVAILABLE COMMANDS.",
    "QUAF ADMIN WILL CONTACT YOU WHEN ONLINE",
    "QUAF ADMIN WILL CONTACT YOU TO YOUR GMAIL",
    "TYPE YOUR ALL DOUBTS NOW. ADMIN WILL REPLAY TO YOU LATER",
    "CONTINUE. TYPE YOUR ALL NEEDS",
  ],
};

// Process Command
async function processCommand(command) {
  const cmd = command.toLowerCase().trim();
  const output = document.getElementById("commandOutput");
  const timestamp = new Date().toLocaleTimeString();

  let response = "";

  // Add command to history
  commandHistory.push(command);
  
  // Store message in session
  userSession.messages.push({
    message: command,
    timestamp: new Date().toLocaleString()
  });

  // Add command to output
  output.innerHTML += `\n[${timestamp}] HACKER@TERMINAL:~$ ${command}\n`;

  // Handle first command flow
  if (!userSession.firstCommand) {
    userSession.firstCommand = true;
    response = "WHAT IS YOUR NAME?";
    userSession.nameAsked = true;
  } 
  // Handle name input
  else if (userSession.nameAsked && !userSession.userName) {
    userSession.userName = command.trim();
    userSession.nameAsked = false;
    userSession.emailAsked = true;
    response = "TYPE YOUR GMAIL...";
  }
  // Handle email input
  else if (userSession.emailAsked && !userSession.userEmail) {
    const email = command.trim();
    if (isValidEmail(email) && email.toLowerCase().includes('gmail')) {
      userSession.userEmail = email;
      userSession.emailAsked = false;
      
      // Send data to Google Sheets
      const success = await sendToGoogleSheets(userSession.userName, userSession.userEmail);
      userSession.dataSubmitted = true;
      
      response = "THANK YOU.. WHAT YOU NEED NOW..";
    } else {
      response = '<span class="error-text">THIS GMAIL NOT AVAILABLE.. PLEASE TRY AGAIN</span>';
    }
  }
  // Handle normal commands after user setup
  else if (userSession.dataSubmitted) {
    // Send message to Google Sheets for logging
    sendMessageToSheet(command);
    
    // Process normal commands
    if (cmd === "help" || cmd === "?") {
      response = hackerResponses.help;
    } else if (cmd === "hi" || cmd === "hello") {
      response =
        hackerResponses.greetings[
          Math.floor(Math.random() * hackerResponses.greetings.length)
        ];
    } else if (cmd === "status") {
      response =
        hackerResponses.status[
          Math.floor(Math.random() * hackerResponses.status.length)
        ];
    } else if (cmd === "scan") {
      response =
        hackerResponses.scan[
          Math.floor(Math.random() * hackerResponses.scan.length)
        ];
    } else if (cmd === "hack") {
      response =
        hackerResponses.hack[
          Math.floor(Math.random() * hackerResponses.hack.length)
        ];
    } else if (cmd === "info") {
      response = hackerResponses.info;
    } else if (cmd === "time") {
      response = `CURRENT SYSTEM TIME: ${new Date().toLocaleString()}
UTC TIME: ${new Date().toUTCString()}
UNIX TIMESTAMP: ${Math.floor(Date.now() / 1000)}`;
    } else if (cmd === "joke") {
      response =
        hackerResponses.jokes[
          Math.floor(Math.random() * hackerResponses.jokes.length)
        ];
    } else if (cmd === "quote") {
      response =
        hackerResponses.quotes[
          Math.floor(Math.random() * hackerResponses.quotes.length)
        ];
    } else if (cmd === "clear") {
      output.innerHTML = `SYSTEM INITIALIZED...
WELCOME TO THE HACKER TERMINAL
TYPE 'help' FOR AVAILABLE COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      return;
    } else if (cmd === "exit") {
      exitCommandInterface();
      return;
    } else {
      response =
        hackerResponses.unknown[
          Math.floor(Math.random() * hackerResponses.unknown.length)
        ];
    }
  } else {
    response = "PLEASE COMPLETE THE REGISTRATION PROCESS FIRST.";
  }

  // Add response to output
  output.innerHTML += `${response}\n`;

  // Scroll to bottom
  const terminal = document.getElementById("terminal");
  terminal.scrollTop = terminal.scrollHeight;
}

// Start Game Function
function startGame() {
  initAudio();
  gameStarted = true;

  // Enter fullscreen
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen();
  }

  // Hide start screen and show security panel
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("securityPanel").classList.remove("hidden");
  document.getElementById("pinInput").focus();
}

// Check PIN Function
function checkPin() {
  const pin = document.getElementById("pinInput").value;
  const correctPin = "quaf@dhdc";

  if (pin === correctPin) {
    // Correct PIN - Show command interface
    document.getElementById("securityPanel").classList.add("hidden");
    document.getElementById("commandInterface").classList.remove("hidden");
    document.getElementById("commandInput").focus();

    // Reset PIN input
    document.getElementById("pinInput").value = "";
    document.getElementById("warningMessage").classList.add("hidden");
    matrix.setMode("green");
  } else {
    // Wrong PIN - Trigger alert
    triggerAlert();
  }
}

// Exit Command Interface
function exitCommandInterface() {
  document.getElementById("commandInterface").classList.add("hidden");

  // Exit fullscreen
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }

  // Reset to start screen
  document.getElementById("startScreen").classList.remove("hidden");
  gameStarted = false;

  // Reset user session
  userSession = {
    firstCommand: false,
    nameAsked: false,
    emailAsked: false,
    userName: '',
    userEmail: '',
    dataSubmitted: false,
    messages: []
  };

  // Clear command output
  document.getElementById("commandOutput").innerHTML = `SYSTEM INITIALIZED...
WELCOME TO THE HACKER TERMINAL
PLEASE ENTER YOUR FIRST COMMAND TO BEGIN...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// Trigger Alert System
function triggerAlert() {
  document.getElementById("warningMessage").classList.remove("hidden");
  matrix.setMode("red");

  // Play alert sounds for 10 seconds
  let alertCount = 0;
  const alertInterval = setInterval(() => {
    playAlertSound(500);
    alertCount++;
    if (alertCount >= 20) {
      // 10 seconds of alerts
      clearInterval(alertInterval);
      matrix.setMode("green");
      document.getElementById("warningMessage").classList.add("hidden");
    }
  }, 500);

  // Clear input
  document.getElementById("pinInput").value = "";
}

// Enhanced keyboard restrictions
document.addEventListener("keydown", function (e) {
  // Block all Ctrl, Alt, Shift, Tab combinations
  if (
    e.ctrlKey ||
    e.altKey ||

    e.metaKey ||
    e.keyCode === 9
  ) {
    // Allow only basic typing in command input
    if (
      document
        .getElementById("commandInterface")
        .classList.contains("hidden") ||
      (document.activeElement !== document.getElementById("commandInput") &&
        document.activeElement !== document.getElementById("pinInput"))
    ) {
      e.preventDefault();
      if (gameStarted) {
        triggerAlert();
      }
      return false;
    }

    // Allow only basic text input combinations
    if (
      !(
        e.ctrlKey &&
        (e.keyCode === 86 || e.keyCode === 67 || e.keyCode === 88)
      )
    ) {
      e.preventDefault();
      if (gameStarted) {
        triggerAlert();
      }
      return false;
    }
  }

  // Block F-keys and other special keys
  if (e.keyCode >= 112 && e.keyCode <= 123) {
    // F1-F12
    e.preventDefault();
    if (gameStarted) {
      triggerAlert();
    }
    return false;
  }

  // Block other dangerous keys
  if (
    e.keyCode === 27 || // Escape
    e.keyCode === 91 || // Windows key
    e.keyCode === 93 || // Context menu
    e.keyCode === 44 || // Print Screen
    e.keyCode === 145
  ) {
    // Scroll Lock
    e.preventDefault();
    if (gameStarted) {
      triggerAlert();
    }
    return false;
  }

  // Enter key to submit PIN or command
  if (e.keyCode === 13) {
    if (
      !document.getElementById("securityPanel").classList.contains("hidden")
    ) {
      checkPin();
    } else if (
      !document.getElementById("commandInterface").classList.contains("hidden")
    ) {
      const command = document.getElementById("commandInput").value.trim();
      if (command) {
        processCommand(command);
        document.getElementById("commandInput").value = "";
      }
    }
  }
});

// Disable right-click
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
  if (gameStarted) {
    triggerAlert();
  }
});

// Handle fullscreen changes
document.addEventListener("fullscreenchange", function () {
  if (
    !document.fullscreenElement &&
    gameStarted &&
    document
      .getElementById("commandInterface")
      .classList.contains("hidden")
  ) {
    // If user exits fullscreen without completing PIN, show security panel
    document.getElementById("securityPanel").classList.remove("hidden");
  }
});

// Prevent text selection
document.onselectstart = function () {
  return false;
};

// Prevent drag and drop
document.ondragstart = function () {
  return false;
};

// Prevent copy/paste in most contexts
document.addEventListener("copy", function (e) {
  if (
    document.activeElement !== document.getElementById("commandInput") &&
    document.activeElement !== document.getElementById("pinInput")
  ) {
    e.preventDefault();
    if (gameStarted) {
      triggerAlert();
    }
  }
});

document.addEventListener("paste", function (e) {
  if (
    document.activeElement !== document.getElementById("commandInput") &&
    document.activeElement !== document.getElementById("pinInput")
  ) {
    e.preventDefault();
    if (gameStarted) {
      triggerAlert();
    }
  }
});

// --- [EXISTING CODE ABOVE] ---

// --- ADD THESE HELPERS NEAR THE TOP OF script.js ---

function isVideoLink(text) {
  const youtube = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/i;
  const instagram = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[^\s]+/i;
  // Add more patterns for other platforms if desired
  return youtube.test(text) || instagram.test(text);
}

function generateDownloadOptions(url) {
  let encodedUrl = encodeURIComponent(url);
  return `
<div style="margin-top:1em;">
  <span style="color:#00ff00;">VIDEO DOWNLOAD OPTIONS:</span><br>
  <a href="https://yt-download.org/api/button/mp3/${encodedUrl}" target="_blank" style="color:#00ff00;text-decoration:underline;margin-right:1em;">MP3 (Audio Only)</a>
  <a href="https://yt-download.org/api/button/mp4/${encodedUrl}" target="_blank" style="color:#00ff00;text-decoration:underline;">MP4 (Video)</a>
  <br>
  <span style="font-size:0.8em;color:#ccc;">Click above to see available qualities.</span>
</div>
  `;
}

// --- [REST OF YOUR CODE] ---

// Inside your async function processCommand(command):
async function processCommand(command) {
  const cmd = command.toLowerCase().trim();
  const output = document.getElementById("commandOutput");
  const timestamp = new Date().toLocaleTimeString();

  let response = "";

  // Add command to history
  commandHistory.push(command);
  
  // Store message in session
  userSession.messages.push({
    message: command,
    timestamp: new Date().toLocaleString()
  });

  // Add command to output
  output.innerHTML += `\n[${timestamp}] HACKER@TERMINAL:~$ ${command}\n`;

  // ---- ADD THIS BLOCK RIGHT AFTER userSession.dataSubmitted CHECK, BEFORE NORMAL COMMAND CHECKS ----
  if (userSession.dataSubmitted && isVideoLink(command)) {
    response = generateDownloadOptions(command);
    output.innerHTML += `${response}\n`;
    const terminal = document.getElementById("terminal");
    terminal.scrollTop = terminal.scrollHeight;
    sendMessageToSheet(command);
    return;
  }
  // ---- END OF VIDEO LINK BLOCK ----

  // [The rest of your command handling code continues here as before...]
  // ... (do not remove/replace your existing logic)
}

// --- [EXISTING CODE ABOVE] ---

// Helper: Check if command is a pure number (image key)
function isImageNumber(text) {
  return /^\d+$/.test(text.trim());
}

// Helper: List of image sources to check (add more as needed)
const imageSources = [
  {
    repo: "KV569/dqdhdc",
    branch: "6f394df93d23d17420d10055c36d9d15751233d0",
    path: "pic"
  },
  {
    repo: "KV569/Quaf-2024",
    branch: "622094015c38a3f13f2e10649771d23aa8d671b9",
    path: "pic/pic"
  }
];

// Helper: Get possible image URLs for a number
function getImageUrlsByNumber(num) {
  const exts = ["jpg", "png"];
  let urls = [];
  imageSources.forEach(src => {
    exts.forEach(ext => {
      urls.push({
        url: `https://raw.githubusercontent.com/${src.repo.split('/')[0]}/${src.repo.split('/')[1]}/${src.branch}/${src.path}/${num}.${ext}`,
        name: `${num}.${ext}`
      });
    });
  });
  return urls;
}

// Helper: Check if image exists (by trying to load it)
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Async: Find available image(s) for this number
async function findAvailableImages(num) {
  const possible = getImageUrlsByNumber(num);
  const results = [];
  for (let p of possible) {
    if (await checkImageExists(p.url)) {
      results.push(p);
    }
  }
  return results; // array of {url, name}
}

// --- [REST OF YOUR CODE] ---

// Patch your async function processCommand(command):

async function processCommand(command) {
  const cmd = command.toLowerCase().trim();
  const output = document.getElementById("commandOutput");
  const timestamp = new Date().toLocaleTimeString();

  let response = "";

  // Add command to history and session
  commandHistory.push(command);
  userSession.messages.push({
    message: command,
    timestamp: new Date().toLocaleString()
  });

  output.innerHTML += `\n[${timestamp}] HACKER@TERMINAL:~$ ${command}\n`;

  // --- IMAGE LOOKUP LOGIC ---
  if (userSession.dataSubmitted && isImageNumber(command)) {
    const images = await findAvailableImages(command.trim());
    if (images.length) {
      // Responsive image style
      const imgStyle = "max-width:90vw;max-width:480px;width:100%;height:auto;display:block;margin:1em auto;border-radius:12px;box-shadow:0 0 24px #00ff00;";
      response = `<span style="color:#00ff00;">IMAGE(S) DETECTED:</span><br>`;
      images.forEach(img => {
        response += `
<div style="margin-bottom:1em;">
  <img src="${img.url}" alt="${img.name}" style="${imgStyle}" />
  <a href="${img.url}" download="${img.name}" style="color:#00ff00;text-decoration:underline;">Download ${img.name}</a>
</div>
        `;
      });
      output.innerHTML += `${response}\n`;
      // Scroll terminal down
      const terminal = document.getElementById("terminal");
      terminal.scrollTop = terminal.scrollHeight;
      sendMessageToSheet(command);
      return;
    } else {
      response = `<span style="color:#ff0000;">NO IMAGE FOUND FOR NUMBER: ${command.trim()}</span>`;
      output.innerHTML += `${response}\n`;
      const terminal = document.getElementById("terminal");
      terminal.scrollTop = terminal.scrollHeight;
      sendMessageToSheet(command);
      return;
    }
  }
  // --- END IMAGE LOGIC ---

  // --- (Include your existing video link logic and other features below this) ---

  // Example: Video Download Logic
  if (userSession.dataSubmitted && isVideoLink(command)) {
    response = generateDownloadOptions(command);
    output.innerHTML += `${response}\n`;
    const terminal = document.getElementById("terminal");
    terminal.scrollTop = terminal.scrollHeight;
    sendMessageToSheet(command);
    return;
  }

  // --- (Rest of your normal processCommand logic continues here) ---
  // ... (name/email logic, help, scan, etc)
}
