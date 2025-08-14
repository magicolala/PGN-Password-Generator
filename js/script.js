// ========== GLOBAL VARIABLES ========== //
let board = null;
let game = new Chess();
let gameHistory = [];
let currentMoveIndex = -1;
let generatedPassword = "";

// ========== DOM UTILS ========== //
/**
 * Cache les éléments DOM fréquemment utilisés pour éviter les recherches répétées.
 */
const DOMElements = {
  pageLoader: document.getElementById("page-loader"),
  lengthSlider: document.getElementById("length"),
  lengthLabel: document.getElementById("length-label"),
  pgnInput: document.getElementById("pgnInput"),
  pgnFileInput: document.getElementById("pgnFileInput"),
  fileName: document.getElementById("fileName"),
  toast: document.getElementById("toast"),
  generateBtn: document.querySelector(".generate-btn"),
  passwordText: document.getElementById("password-text"),
  passwordContainer: document.getElementById("password-container"),
  moveInfo: document.getElementById("move-info"),
  copyBtn: document.querySelector(".copy-btn"),
  discreteMode: document.getElementById("discrete-mode"),
  chessboard: document.getElementById("chessboard"),
  instructionItems: document.querySelectorAll(".instruction-item"),
  fileUploadContainer: document.querySelector(".file-upload-container"),
};

// ========== LOADER MANAGEMENT ========== //
/**
 * Vérifie si toutes les ressources critiques sont chargées.
 */
function checkAllResourcesLoaded() {
  return (
    typeof Chess !== "undefined" &&
    typeof Chessboard !== "undefined" &&
    typeof $ !== "undefined" &&
    document.readyState === "complete"
  );
}

/**
 * Masque le loader de la page avec une animation.
 */
function hidePageLoader() {
  if (DOMElements.pageLoader) {
    DOMElements.pageLoader.classList.add("hidden");
    setTimeout(() => {
      DOMElements.pageLoader.style.display = "none";
    }, 500);
  }
}

/**
 * Vérifie périodiquement si tout est chargé, puis masque le loader.
 */
function checkAndHideLoader() {
  const interval = setInterval(() => {
    if (checkAllResourcesLoaded()) {
      clearInterval(interval);
      setTimeout(hidePageLoader, 1000);
    }
  }, 100);
}

// ========== PASSWORD GENERATION ========== //
/**
 * Génère un mot de passe sécurisé à partir d'un texte PGN.
 */
async function generateSecurePasswordFromPGN(pgnText, length = 16) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(pgnText);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const specials = "!@#$%^&*()_+-=";
    let passwordChars = [];

    // Ajoute au moins un caractère de chaque type
    passwordChars.push(String.fromCharCode(65 + (hashArray[0] % 26))); // Majuscule
    passwordChars.push(String.fromCharCode(97 + (hashArray[1] % 26))); // Minuscule
    passwordChars.push(String.fromCharCode(48 + (hashArray[2] % 10))); // Chiffre
    passwordChars.push(specials[hashArray[3] % specials.length]); // Spécial

    // Remplit le reste du mot de passe
    for (let i = 4; passwordChars.length < length; i++) {
      const charCode = hashArray[i % hashArray.length];
      passwordChars.push(String.fromCharCode(33 + (charCode % 94))); // ASCII imprimable
    }

    // Mélange déterministe
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = hashArray[i % hashArray.length] % (i + 1);
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return passwordChars.slice(0, length).join("");
  } catch (error) {
    console.error("Erreur lors de la génération du mot de passe:", error);
    throw new Error("Échec de la génération du mot de passe.");
  }
}

/**
 * Nettoie le texte PGN pour ne garder que les coups.
 */
function cleanPgnText(pgnText) {
  const unwantedPartsRegex = /\[[^\]]*\]|\{[^}]*\}|\([^)]*\)|\b\d+\.{1,3}|(1-0|0-1|1\/2-1\/2|\*)|[?!#+]/g;
  return pgnText.replace(unwantedPartsRegex, "").replace(/\s+/g, " ").trim();
}

/**
 * Affiche un toast avec un message et un type (succès/erreur).
 */
function showToast(message, type = "success") {
  const { toast } = DOMElements;
  const originalMessage = toast.textContent;

  toast.style.background = type === "error" ? "#ff4757" : "#a8eb12";
  toast.style.color = type === "error" ? "#fff" : "#051937";
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.textContent = originalMessage;
      toast.style.background = "";
      toast.style.color = "";
    }, 300);
  }, 2500);
}

/**
 * Anime un élément pour indiquer une erreur.
 */
function showErrorShake(element) {
  element.style.animation = "shake 0.5s ease-in-out";
  setTimeout(() => {
    element.style.animation = "";
  }, 500);
}

/**
 * Génère un mot de passe à partir du PGN saisi.
 */
async function generate() {
  const { pgnInput, generateBtn, passwordText, passwordContainer, discreteMode } = DOMElements;
  const pgnText = pgnInput.value.trim();

  if (!pgnText) {
    showErrorShake(generateBtn);
    showToast("Veuillez d'abord coller un PGN !", "error");
    return;
  }

  // État de chargement
  const originalText = generateBtn.innerHTML;
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération...';
  generateBtn.disabled = true;

  try {
    const length = parseInt(DOMElements.lengthSlider.value, 10);
    const movesOnly = cleanPgnText(pgnText);
    const password = await generateSecurePasswordFromPGN(movesOnly, length);
    generatedPassword = password;

    // Affiche le mot de passe (ou masqué en mode discret)
    if (discreteMode.checked) {
      passwordText.innerHTML =
        '<span class="hidden-message"><i class="fas fa-lock"></i> Mot de passe généré (masqué pour sécurité)</span>';
      passwordText.classList.add("password-hidden");
    } else {
      passwordText.innerText = password;
      passwordText.classList.remove("password-hidden");
    }

    passwordContainer.classList.add("show");
    showToast("Mot de passe généré avec succès !", "success");
  } catch (error) {
    showToast("Échec de la génération du mot de passe.", "error");
  } finally {
    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
  }
}

/**
 * Copie le mot de passe dans le presse-papiers.
 */
function copyPassword() {
  const { copyBtn, passwordText } = DOMElements;
  const passwordToCopy = generatedPassword || passwordText.innerText;

  navigator.clipboard
    .writeText(passwordToCopy)
    .then(() => {
      const originalIcon = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      copyBtn.style.color = "#a8eb12";
      setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.style.color = "";
      }, 1000);
      showToast("Mot de passe copié !", "success");
    })
    .catch(() => {
      showToast("Échec de la copie du mot de passe.", "error");
    });
}

// ========== FILE UPLOAD ========== //
/**
 * Gère le téléchargement d'un fichier PGN.
 */
function handleFileUpload(event) {
  const { fileName, toast, pgnInput } = DOMElements;
  const file = event.target.files[0];
  if (!file) return;

  fileName.textContent = file.name;
  const reader = new FileReader();

  reader.onload = (e) => {
    pgnInput.value = e.target.result;
    const originalMessage = toast.textContent;
    toast.textContent = `Fichier "${file.name}" chargé avec succès !`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.textContent = originalMessage;
      }, 300);
    }, 2500);
  };

  reader.onerror = () => {
    showToast("Erreur lors de la lecture du fichier.", "error");
  };

  reader.readAsText(file);
}

// ========== CHESS BOARD ========== //
/**
 * Initialise l'échiquier.
 */
function initializeBoard() {
  game = new Chess();
  const config = {
    draggable: true,
    position: "start",
    onDragStart,
    onDrop,
    onSnapEnd,
    pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
  };
  board = Chessboard("chessboard", config);
}

/**
 * Met à jour le PGN dans la zone de texte à partir de la position actuelle.
 */
function updatePgnFromBoard() {
  DOMElements.pgnInput.value = game.pgn();
}

/**
 * Charge un PGN dans l'échiquier.
 */
function loadPgnToBoard() {
  const { pgnInput } = DOMElements;
  const pgnText = pgnInput.value.trim();

  if (!pgnText) {
    showToast("Veuillez d'abord coller un PGN !", "error");
    return;
  }

  try {
    game = new Chess();
    game.load_pgn(pgnText);
    buildGameHistory();
    goToEnd();
  } catch (error) {
    showToast("Format PGN invalide !", "error");
  }
}

/**
 * Efface l'échiquier et réinitialise le jeu.
 */
function clearBoard() {
  game = new Chess();
  game.clear();
  board.clear();
  DOMElements.pgnInput.value = "";
  gameHistory = [];
  currentMoveIndex = -1;
  updateMoveInfo();
}

/**
 * Réinitialise l'échiquier à la position de départ.
 */
function resetBoard() {
  game = new Chess();
  board.start();
  DOMElements.pgnInput.value = "";
  gameHistory = [];
  currentMoveIndex = -1;
  updateMoveInfo();
}

/**
 * Retourne l'échiquier.
 */
function flipBoard() {
  board.flip();
}

// ========== MOVE NAVIGATION ========== //
/**
 * Construit l'historique des coups à partir du PGN actuel.
 */
function buildGameHistory() {
  gameHistory = [];
  const { pgnInput } = DOMElements;
  const pgnText = pgnInput.value.trim();
  let tempGame = new Chess();

  // Position initiale
  gameHistory.push({
    fen: tempGame.fen(),
    move: null,
    san: "Position initiale",
  });

  // Rejoue tous les coups pour construire l'historique
  try {
    tempGame.load_pgn(pgnText);
    const history = tempGame.history({ verbose: true });
    tempGame = new Chess(); // Réinitialise pour rejouer

    history.forEach((move, index) => {
      tempGame.move(move);
      gameHistory.push({
        fen: tempGame.fen(),
        move,
        san: move.san,
        moveNumber: Math.ceil((index + 1) / 2),
      });
    });
  } catch (error) {
    console.error("Erreur lors de la construction de l'historique:", error);
    showToast("Erreur lors du chargement du PGN.", "error");
  }
}

/**
 * Met à jour l'affichage du coup actuel.
 */
function updateMoveInfo() {
  const { moveInfo } = DOMElements;

  if (currentMoveIndex < 0 || currentMoveIndex >= gameHistory.length) {
    moveInfo.textContent = "Position initiale";
    return;
  }

  const currentPosition = gameHistory[currentMoveIndex];
  if (currentPosition.san === "Position initiale") {
    moveInfo.textContent = "Position initiale";
  } else {
    const moveNum = currentPosition.moveNumber;
    const isWhite = currentMoveIndex % 2 === 1;
    moveInfo.textContent = `Coup ${moveNum}${isWhite ? "" : "..."}: ${currentPosition.san}`;
  }
}

/**
 * Va au début de la partie.
 */
function goToStart() {
  if (gameHistory.length > 0) {
    currentMoveIndex = 0;
    board.position(gameHistory[0].fen);
    updateMoveInfo();
  }
}

/**
 * Va à la fin de la partie.
 */
function goToEnd() {
  if (gameHistory.length > 0) {
    currentMoveIndex = gameHistory.length - 1;
    board.position(gameHistory[currentMoveIndex].fen);
    updateMoveInfo();
  }
}

/**
 * Va au coup précédent.
 */
function previousMove() {
  if (currentMoveIndex > 0) {
    currentMoveIndex--;
    board.position(gameHistory[currentMoveIndex].fen);
    updateMoveInfo();
  }
}

/**
 * Va au coup suivant.
 */
function nextMove() {
  if (currentMoveIndex < gameHistory.length - 1) {
    currentMoveIndex++;
    board.position(gameHistory[currentMoveIndex].fen);
    updateMoveInfo();
  }
}

// ========== CHESS EVENT HANDLERS ========== //
function onDragStart(source, piece, position, orientation) {
  if (game.game_over()) return false;
  return !((game.turn() === "w" && piece.search(/^b/) !== -1) || (game.turn() === "b" && piece.search(/^w/) !== -1));
}

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });

  if (move === null) return "snapback";
  updatePgnFromBoard();
}

function onSnapEnd() {
  board.position(game.fen());
}

// ========== UI ENHANCEMENTS ========== //
/**
 * Améliore l'interaction avec le slider de longueur du mot de passe.
 */
function enhanceSlider() {
  const { lengthSlider } = DOMElements;
  if (!lengthSlider) return;

  lengthSlider.addEventListener("input", function () {
    const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
    this.style.background = `linear-gradient(to right, #a8eb12 0%, #a8eb12 ${percent}%, rgba(0,0,0,0.5) ${percent}%, rgba(0,0,0,0.5) 100%)`;
    DOMElements.lengthLabel.innerText = this.value;
  });

  lengthSlider.dispatchEvent(new Event("input"));
}

/**
 * Améliore l'interaction avec le glisser-déposer de fichier.
 */
function enhanceFileInput() {
  const { pgnFileInput, fileUploadContainer } = DOMElements;
  if (!fileUploadContainer) return;

  fileUploadContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileUploadContainer.style.background = "rgba(168, 235, 18, 0.15)";
    fileUploadContainer.style.borderColor = "rgba(168, 235, 18, 0.4)";
  });

  fileUploadContainer.addEventListener("dragleave", () => {
    fileUploadContainer.style.background = "";
    fileUploadContainer.style.borderColor = "";
  });

  fileUploadContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    fileUploadContainer.style.background = "";
    fileUploadContainer.style.borderColor = "";
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      pgnFileInput.files = files;
      handleFileUpload({ target: { files } });
    }
  });
}

/**
 * Anime les éléments au scroll.
 */
function observeElements() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  DOMElements.instructionItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    item.style.transition = "all 0.6s ease";
    observer.observe(item);
  });
}

/**
 * Met à jour l'effet de parallaxe au scroll.
 */
function updateBackgroundOnScroll() {
  const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
  const gradientPosition = (1 - scrollPercent) * 100;
  document.body.style.backgroundPosition = `${gradientPosition}% 50%, center`;
}

// ========== INITIALIZATION ========== //
document.addEventListener("DOMContentLoaded", function () {
  // Initialise les écouteurs d'événements
  DOMElements.lengthSlider?.addEventListener("input", () => {
    DOMElements.lengthLabel.innerText = DOMElements.lengthSlider.value;
  });

  DOMElements.pgnFileInput?.addEventListener("change", handleFileUpload);

  // Initialise l'échiquier et l'UI
  initializeBoard();
  updateMoveInfo();
  checkAndHideLoader();
  enhanceSlider();
  enhanceFileInput();
  observeElements();
});

window.addEventListener("scroll", updateBackgroundOnScroll);
window.addEventListener("load", () => {
  setTimeout(() => {
    if (DOMElements.pageLoader && !DOMElements.pageLoader.classList.contains("hidden")) {
      hidePageLoader();
    }
  }, 2000);
});
