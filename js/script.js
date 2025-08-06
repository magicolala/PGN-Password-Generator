// Global Variables
let board = null;
let game = new Chess();
let gameHistory = [];
let currentMoveIndex = -1;
let generatedPassword = '';

// Password Length Slider
document.addEventListener('DOMContentLoaded', function() {
  // Update length label when slider changes
  const lengthSlider = document.getElementById('length');
  const lengthLabel = document.getElementById('length-label');
  
  if (lengthSlider && lengthLabel) {
    lengthSlider.addEventListener('input', function() {
      lengthLabel.innerText = this.value;
    });
  }
  
  // Initialize file input listener
  const fileInput = document.getElementById('pgnFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }
  
  // Initialize chess board
  initializeBoard();
  updateMoveInfo();
});

// File Upload Function
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Update file name display
  const fileName = document.getElementById('fileName');
  fileName.textContent = file.name;
  
  // Read file content
  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    document.getElementById('pgnInput').value = content;
    
    // Show success message
    const toast = document.getElementById('toast');
    const originalMessage = toast.textContent;
    toast.textContent = `Fichier "${file.name}" chargé avec succès !`;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.textContent = originalMessage;
      }, 300);
    }, 2500);
  };
  
  reader.onerror = function() {
    alert('Erreur lors de la lecture du fichier.');
  };
  
  reader.readAsText(file);
}

// Password Generation Functions
async function generate() {
  const pgnText = document.getElementById('pgnInput').value.trim();
  const generateBtn = document.querySelector('.generate-btn');
  
  if (!pgnText) {
    showErrorShake(generateBtn);
    showToast("Veuillez d'abord coller un PGN !", 'error');
    return;
  }

  // Add loading state
  const originalText = generateBtn.innerHTML;
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération...';
  generateBtn.disabled = true;
  
  // Simulate processing time for better UX
  setTimeout(async () => {
    const length = parseInt(document.getElementById('length').value, 10);
    const unwantedPartsRegex = /\[[^\]]*\]|\{[^}]*\}|\([^)]*\)|\b\d+\.{1,3}|(1-0|0-1|1\/2-1\/2|\*)|[?!#+]/g;
    const movesOnly = pgnText.replace(unwantedPartsRegex, '').replace(/\s+/g, ' ').trim();

    const password = await generateSecurePasswordFromPGN(movesOnly, length);
    generatedPassword = password; // Store password for copying
    
    const isDiscreteMode = document.getElementById('discrete-mode').checked;
    const passwordElement = document.getElementById('password-text');
    
    if (isDiscreteMode) {
      passwordElement.innerHTML = '<span class="hidden-message"><i class="fas fa-lock"></i> Mot de passe généré (masqué pour sécurité)</span>';
      passwordElement.classList.add('password-hidden');
    } else {
      passwordElement.innerText = password;
      passwordElement.classList.remove('password-hidden');
    }
    
    // Reset button
    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
    
    document.getElementById('password-container').classList.add('show');
    showToast("Mot de passe généré avec succès !", 'success');
  }, 800);
}

function copyPassword() {
  // Use stored password rather than displayed text
  const passwordToCopy = generatedPassword || document.getElementById('password-text').innerText;
  const copyBtn = document.querySelector('.copy-btn');
  
  navigator.clipboard.writeText(passwordToCopy).then(() => {
    // Visual feedback for copy button
    const originalIcon = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    copyBtn.style.color = '#a8eb12';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalIcon;
      copyBtn.style.color = '';
    }, 1000);
    
    showToast("Mot de passe copié !", 'success');
  }, (err) => {
    showToast('Échec de la copie du mot de passe.', 'error');
  });
}

async function generateSecurePasswordFromPGN(pgnText, length = 16) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pgnText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const specials = '!@#$%^&*()_+-=';
  let passwordChars = [];

  passwordChars.push(String.fromCharCode(65 + (hashArray[0] % 26))); // Uppercase
  passwordChars.push(String.fromCharCode(97 + (hashArray[1] % 26))); // Lowercase
  passwordChars.push(String.fromCharCode(48 + (hashArray[2] % 10)));   // Digit
  passwordChars.push(specials[hashArray[3] % specials.length]);      // Special

  for (let i = 4; passwordChars.length < length; i++) {
    const charCode = hashArray[i % hashArray.length];
    passwordChars.push(String.fromCharCode(33 + (charCode % 94))); // Printable ASCII
  }

  // Deterministic shuffle
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = hashArray[i % hashArray.length] % (i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.slice(0, length).join('');
}

// Chess Board Functions
function onDragStart(source, piece, position, orientation) {
  // Only allow moving pieces for the current turn
  if (game.game_over()) return false;
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

function onDrop(source, target) {
  // Check if move is legal
  let move = game.move({
    from: source,
    to: target,
    promotion: 'q' // Always promote to queen for simplicity
  });

  // Move is not legal
  if (move === null) return 'snapback';

  // Update PGN in textarea
  updatePgnFromBoard();
}

function onSnapEnd() {
  board.position(game.fen());
}

function updatePgnFromBoard() {
  document.getElementById('pgnInput').value = game.pgn();
}

function initializeBoard() {
  game = new Chess();
  let config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
  };
  board = Chessboard('chessboard', config);
}

function loadPgnToBoard() {
  const pgnText = document.getElementById('pgnInput').value.trim();
  if (!pgnText) {
    alert("Veuillez d'abord coller un PGN !");
    return;
  }

  try {
    game = new Chess();
    game.load_pgn(pgnText);
    
    // Build game history
    buildGameHistory();
    
    // Go to end of game
    goToEnd();
  } catch (error) {
    alert("Format PGN invalide !");
  }
}

function clearBoard() {
  game = new Chess();
  game.clear();
  board.clear();
  document.getElementById('pgnInput').value = '';
  gameHistory = [];
  currentMoveIndex = -1;
  updateMoveInfo();
}

function resetBoard() {
  game = new Chess();
  board.start();
  document.getElementById('pgnInput').value = '';
  gameHistory = [];
  currentMoveIndex = -1;
  updateMoveInfo();
}

function flipBoard() {
  board.flip();
}

// Move Navigation Functions
function buildGameHistory() {
  gameHistory = [];
  let tempGame = new Chess();
  
  // Initial position
  gameHistory.push({
    fen: tempGame.fen(),
    move: null,
    san: 'Position initiale'
  });
  
  // Replay all moves to build history
  try {
    tempGame.load_pgn(document.getElementById('pgnInput').value.trim());
    let history = tempGame.history({ verbose: true });
    
    tempGame = new Chess(); // Reset to replay
    
    history.forEach((move, index) => {
      tempGame.move(move);
      gameHistory.push({
        fen: tempGame.fen(),
        move: move,
        san: move.san,
        moveNumber: Math.ceil((index + 1) / 2)
      });
    });
  } catch (error) {
    console.error("Error building game history:", error);
  }
}

function updateMoveInfo() {
  const moveInfo = document.getElementById('move-info');
  if (currentMoveIndex < 0 || currentMoveIndex >= gameHistory.length) {
    moveInfo.textContent = 'Position initiale';
    return;
  }
  
  const currentPosition = gameHistory[currentMoveIndex];
  if (currentPosition.san === 'Position initiale') {
    moveInfo.textContent = 'Position initiale';
  } else {
    const moveNum = currentPosition.moveNumber;
    const isWhite = currentMoveIndex % 2 === 1;
    moveInfo.textContent = `Coup ${moveNum}${isWhite ? '' : '...'}: ${currentPosition.san}`;
  }
}

function goToStart() {
  if (gameHistory.length > 0) {
    currentMoveIndex = 0;
    board.position(gameHistory[0].fen);
    updateMoveInfo();
  }
}

function goToEnd() {
  if (gameHistory.length > 0) {
    currentMoveIndex = gameHistory.length - 1;
    board.position(gameHistory[currentMoveIndex].fen);
    updateMoveInfo();
  }
}

function previousMove() {
  if (currentMoveIndex > 0) {
    currentMoveIndex--;
    board.position(gameHistory[currentMoveIndex].fen);
    updateMoveInfo();
  }
}

function nextMove() {
  if (currentMoveIndex < gameHistory.length - 1) {
    currentMoveIndex++;
    board.position(gameHistory[currentMoveIndex].fen);
    updateMoveInfo();
  }
}

// Interactive Helper Functions
function showErrorShake(element) {
  element.style.animation = 'shake 0.5s ease-in-out';
  setTimeout(() => {
    element.style.animation = '';
  }, 500);
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const originalMessage = toast.textContent;
  
  // Update toast styling based on type
  if (type === 'error') {
    toast.style.background = '#ff4757';
    toast.style.color = '#fff';
  } else {
    toast.style.background = '#a8eb12';
    toast.style.color = '#051937';
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.textContent = originalMessage;
      toast.style.background = '';
      toast.style.color = '';
    }, 300);
  }, 2500);
}

// Parallax effect for background
function updateBackgroundOnScroll() {
  const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
  const gradientPosition = (1 - scrollPercent) * 100;
  document.body.style.backgroundPosition = `${gradientPosition}% 50%, center`;
}

// Smooth element entry animations
function observeElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.instruction-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'all 0.6s ease';
    observer.observe(item);
  });
}

// Enhanced file input interaction
function enhanceFileInput() {
  const fileInput = document.getElementById('pgnFileInput');
  const uploadContainer = document.querySelector('.file-upload-container');
  
  if (uploadContainer) {
    uploadContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadContainer.style.background = 'rgba(168, 235, 18, 0.15)';
      uploadContainer.style.borderColor = 'rgba(168, 235, 18, 0.4)';
    });
    
    uploadContainer.addEventListener('dragleave', () => {
      uploadContainer.style.background = '';
      uploadContainer.style.borderColor = '';
    });
    
    uploadContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadContainer.style.background = '';
      uploadContainer.style.borderColor = '';
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files;
        handleFileUpload({ target: { files } });
      }
    });
  }
}

// Enhanced slider interaction
function enhanceSlider() {
  const slider = document.getElementById('length');
  if (slider) {
    slider.addEventListener('input', function() {
      const percent = (this.value - this.min) / (this.max - this.min) * 100;
      this.style.background = `linear-gradient(to right, #a8eb12 0%, #a8eb12 ${percent}%, rgba(0,0,0,0.5) ${percent}%, rgba(0,0,0,0.5) 100%)`;
    });
    
    // Initialize slider styling
    slider.dispatchEvent(new Event('input'));
  }
}

window.addEventListener('scroll', updateBackgroundOnScroll);
window.addEventListener('load', () => {
  observeElements();
  enhanceFileInput();
  enhanceSlider();
});
