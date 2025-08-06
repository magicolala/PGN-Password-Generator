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
  if (!pgnText) {
    alert("Veuillez d'abord coller un PGN !");
    return;
  }

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
  
  document.getElementById('password-container').classList.add('show');
}

function copyPassword() {
  // Use stored password rather than displayed text
  const passwordToCopy = generatedPassword || document.getElementById('password-text').innerText;
  navigator.clipboard.writeText(passwordToCopy).then(() => {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }, (err) => {
    alert('Échec de la copie du mot de passe.');
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

// Background Animation on Scroll
function updateBackgroundOnScroll() {
  const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
  const gradientPosition = (1 - scrollPercent) * 100;
  document.body.style.backgroundPosition = `${gradientPosition}% 50%, center`;
}

window.addEventListener('scroll', updateBackgroundOnScroll);
