# ♟️ Dr. Drona: AI Voice Chess Coach & Engine

[![Build and Release Android APK](https://github.com/MonkeyDLuffy003/Drona-/actions/workflows/build-apk.yml/badge.svg)](https://github.com/MonkeyDLuffy003/Drona-/actions/workflows/build-apk.yml)
[![Download APK](https://img.shields.io/badge/Download-Android%20APK%20(v1.0.0)-blue?logo=android&logoColor=white)](https://github.com/MonkeyDLuffy003/Drona-/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)

> **Dr. Drona** is a full-featured Android chess game and personal AI chess coach powered by an authentic male voice coach, an offline Minimax engine with alpha-beta pruning, interactive tactical puzzles, opening repertoires, and post-game visual analytics.

---

## 📱 Download Android APK

You can download and install the official native Android APK directly on your phone:

### 📥 [👉 Click Here to Download Dr. Drona APK (Releases)](https://github.com/MonkeyDLuffy003/Drona-/releases)

#### Direct Download Link:
- **[DrDrona-AI-Chess-v1.0.apk](https://github.com/MonkeyDLuffy003/Drona-/releases/download/v1.0.0/DrDrona-AI-Chess-v1.0.apk)**

### 📲 How to Install on Android:
1. Tap the **Download APK** link above on your Android phone.
2. Once downloaded, tap on the file `DrDrona-AI-Chess-v1.0.apk`.
3. If prompted by Android, enable **"Allow from this source"** (Settings → Install Unknown Apps).
4. Tap **Install** and open **Dr. Drona** to start playing and learning!

---

## 🌟 Key Features

### 1. 🎙️ Dr. Drona — Personal AI Voice Coach
- **Authentic Male Voice**: Specially tuned resonant male Indian guru persona.
- **Short Tactical Coaching**: Compact contextual cards explain blunders, missed opportunities, and tactical ideas without essays.
- **In-Game Voice Mode Toggle**: Quick `[ 🔊 Voice ON ]` / `[ 🔇 Voice OFF ]` switch right on the header and coaching dock.
- **Multilingual Commentary**: Native commentary support for **English, Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, and Odia**.

### 2. 🎮 Interactive Gaming Dashboard & Modes
- **Play Chess**: Start a new game with 1-tap color selection (White / Black).
- **Play vs AI**: Choose from 6 engine difficulty levels (Beginner ~500 Elo to Master ~2200+ Elo).
- **Two Player Mode**: Pass-and-play with a friend on the same device.
- **Tactical Puzzles**: Checkmate patterns, forks, pins, and skewers with instant feedback.
- **Training Arena**: Opening repertoire trainer and essential endgame technique drills.
- **Game Analysis**: Accuracy percentage, blunder timeline, best moves, and Drona's coaching takeaways.
- **My Progress**: Track wins, draws, rating progression, and milestone achievements.

### 3. ⚙️ Robust Chess Rules & Tie Detection
- Full legal move validation using standard chess rules.
- Automatic **Threefold Repetition** detection.
- Automatic **Stalemate**, **50-Move Rule**, and **Insufficient Material** detection.
- Live position repetition avoidance to prevent infinite piece-shuffling loops in endgames.
- Undo, hint calculation, and board orientation flip.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Audio & Voice**: Web Speech Synthesis API, Web Audio procedural sound generation
- **Chess Engine**: Custom Minimax with Alpha-Beta Pruning, Quiescence Search, and Piece-Square Tables (PST)
- **Mobile Container**: Capacitor Android Native Bridge
- **CI/CD**: GitHub Actions automated APK compilation and release pipeline

---

## 💻 Local Development

Clone the repository and run locally:

```bash
# Clone repository
git clone https://github.com/MonkeyDLuffy003/Drona-.git
cd Drona-

# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Build production bundle
npm run build
```

---

## 📦 Building Android APK Locally

If you have Android Studio installed locally:

```bash
# Install Capacitor packages
npm install @capacitor/core @capacitor/cli @capacitor/android

# Build web distribution
npm run build

# Add Android native project
npx cap add android

# Build debug APK with Gradle
cd android && ./gradlew assembleDebug
```
The APK file will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📜 License
Distributed under the MIT License. Developed for chess lovers and students worldwide.
