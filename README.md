# PGN Password Generator

A web application that converts chess PGN (Portable Game Notation) files into secure, deterministic passwords.

## Features

- **PGN Input**: Paste any chess game in PGN format
- **Secure Generation**: Uses SHA-256 hashing for cryptographically secure passwords
- **Customizable Length**: Adjustable password length (8-32 characters)
- **Character Variety**: Includes uppercase, lowercase, numbers, and special characters
- **Deterministic**: Same PGN always generates the same password
- **Copy Function**: One-click password copying to clipboard

## How It Works

1. **Input**: Paste a chess game in PGN notation
2. **Processing**: The app removes metadata, comments, and annotations from the PGN
3. **Hashing**: Uses SHA-256 to create a hash from the clean move sequence
4. **Generation**: Converts the hash into a secure password with guaranteed character variety
5. **Output**: Displays the password with copy functionality

## Usage

1. Open `index.html` in a web browser
2. Paste your PGN text into the text area
3. Adjust the password length using the slider (8-32 characters)
4. Click "Generate" to create your password
5. Click the copy icon to copy the password to clipboard

## Technical Details

- **Algorithm**: SHA-256 hashing with deterministic character selection
- **Security**: Ensures at least one uppercase, lowercase, digit, and special character
- **Browser Support**: Modern browsers with Web Crypto API support
- **No Dependencies**: Pure HTML, CSS, and JavaScript

## File Structure

```
pgnPassword/
├── index.html          # Main application file
└── README.md           # This documentation
```

## Example

Input PGN:
```
1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6
```

Output: A unique, secure password based on this move sequence.

## Security Note

This tool is designed for creating memorable yet secure passwords from chess games. The same PGN will always produce the same password, making it useful for creating consistent passwords from memorable games.
