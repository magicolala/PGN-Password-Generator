# 🔐♟️ PGN Password Generator

**Transform your chess games into cryptographically secure passwords**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chess](https://img.shields.io/badge/Chess-PGN-blue.svg)](https://en.wikipedia.org/wiki/Portable_Game_Notation)

A unique web application that converts chess games in PGN (Portable Game Notation) format into secure, deterministic passwords. Turn your memorable chess games into unbreakable passwords!

## ✨ Key Features

- 🔒 **Cryptographically Secure** - Uses SHA-256 hashing for maximum security
- ♟️ **Interactive Chess Board** - Play games directly or load existing PGN files
- 📏 **Customizable Length** - Password length from 8 to 32 characters
- 🎯 **Deterministic** - Same PGN always generates the same password
- 🎨 **Character Variety** - Includes uppercase, lowercase, numbers, and special characters
- 📋 **One-Click Copy** - Copy passwords to clipboard instantly
- 🕶️ **Discrete Mode** - Hide passwords when in public spaces
- 🎮 **Game Navigation** - Step through moves with interactive controls

## 🚀 Quick Start

### Option 1: Download and Run Locally
```bash
# Clone the repository
git clone https://github.com/magicolala/PGN-Password-Generator.git

# Navigate to the project directory
cd PGN-Password-Generator

# Open in your browser
# Simply open index.html in any modern web browser
```

### Option 2: Use Online
Visit the live demo: [PGN Password Generator](https://magicolala.github.io/PGN-Password-Generator) *(if deployed)*

## 🎯 How It Works

1. **Input** - Paste a chess game in PGN notation or play directly on the board
2. **Processing** - Clean the PGN by removing metadata, comments, and annotations
3. **Hashing** - Generate SHA-256 hash from the cleaned move sequence
4. **Generation** - Convert hash into a secure password with guaranteed character variety
5. **Output** - Display password with copy-to-clipboard functionality

## 🎮 Usage Guide

### Method 1: Load Existing PGN
1. Open the application in your web browser
2. Paste your PGN text in the textarea **OR** click "Load PGN File" to upload a .pgn file
3. Adjust password length using the slider (8-32 characters)
4. Click "Generate" to create your password
5. Use the copy button to copy the password to clipboard

### Method 2: Play a New Game
1. Use the interactive chessboard to play moves by dragging pieces
2. The PGN is automatically generated as you play
3. Navigate through moves using the control buttons
4. Generate password when satisfied with your game

## 🔧 Technical Details

| Feature | Implementation |
|---------|----------------|
| **Hash Algorithm** | SHA-256 with deterministic character selection |
| **Security** | Guarantees at least one uppercase, lowercase, digit, and special character |
| **Browser Support** | Modern browsers with Web Crypto API support |
| **Dependencies** | Chess.js, ChessBoard.js, jQuery, Font Awesome |
| **Frontend** | Pure HTML5, CSS3, and JavaScript ES6+ |

## 📁 Project Structure

```text
PGN-Password-Generator/
├── 📄 index.html           # Main application file
├── 📁 css/                 # Stylesheets
│   └── style.css
├── 📁 js/                  # JavaScript modules
│   └── script.js
├── 📁 assets/              # Images and icons
│   ├── favicon.ico
│   └── ...
└── 📖 README.md            # This documentation
```

## 💡 Example Usage

**Input PGN:**
```pgn
1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6
```

**Generated Password:** `K8#mN2$pL9@vQ5!z` *(example, actual output will be deterministic)*

## 🛡️ Security & Privacy

- **🔒 Client-Side Only** - All processing happens in your browser, no data sent to servers
- **🎯 Deterministic** - Same PGN always produces the same password
- **🔐 Cryptographically Secure** - Uses SHA-256 for password generation
- **📝 Memorable** - Base passwords on your memorable chess games
- **🕶️ Discrete Mode** - Option to hide passwords from prying eyes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Chess.js](https://github.com/jhlywa/chess.js) - Chess engine
- [ChessBoard.js](https://chessboardjs.com/) - Interactive chessboard
- [Font Awesome](https://fontawesome.com/) - Icons
- Chess community for PGN format standards

---

**⚠️ Disclaimer:** This tool is designed for educational and personal use. Always use strong, unique passwords for critical accounts and consider using established password managers for sensitive applications.
