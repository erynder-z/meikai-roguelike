# Meikai

_A Journey to the Center of the Earth_

A classic roguelike game built with TypeScript, Tauri, and a bit of Rust.

---

## About

Meikai is a personal project to build a roguelike game from the ground up. It's a journey into the genre's classic mechanics, with a focus on creating a solid, extensible foundation. The game is in active development, and much of the content is still in a placeholder state. The current focus is on building out the core systems and mechanics, with the goal of eventually creating a full-fledged game.

## Current State

The game is playable, but it's still very much a work in progress. Here's what you can expect from the current build:

- **Procedural Map Generation:** The game generates a new dungeon layout for each run, with a mix of different room and corridor styles.
- **Turn-Based Combat:** The combat system is in place, with melee and ranged attacks, as well as a basic spell system.
- **Placeholder Content:** The mobs, items, and level progression are all placeholders. They're functional, but not balanced or diverse.
- **No Story or Goal (Yet):** The only objective right now is to see how far you can get. The narrative and a proper endgame are still on the road map.

## Tech Stack

- **Frontend:** The game is built with TypeScript and Vite. The UI is composed of custom Web Components, which keeps things modular and lightweight.
- **Backend:** The game is wrapped in a Tauri container, using Rust for the backend to handle file system access and window management.
- **Game Logic:** The core game logic is written in TypeScript and is decoupled from the UI, which makes it easier to test and maintain.

## Getting Started

To build and run the game, you'll need to have Node.js and Rust installed. Follow the instructions on the [Tauri website](https://tauri.app/v1/guides/getting-started/prerequisites) to set up your environment.
(Pre-build binaries will be released later down the road)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/erynder-z/meikai-roguelike.git
    cd meikai-roguelike
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run in development mode:**

    ```bash
    npm run tauri dev
    ```

4.  **Build for production:**

    ```bash
    npm run tauri build
    ```

    The production build will be located in the `src-tauri/target/release` directory.

## Acknowledgements

This project is built upon the fundamental structure outlined in the book [_How to Create Your Own Roguelike with TypeScript_](https://www.google.com/search?client=firefox-b-d&q=how+to+make+your+own+roguelike%2C+gaardsted) by Jakob Gaardsted.
