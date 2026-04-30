# PokéRogue Stats Calculator

A web-based calculator for calculating Pokémon stats and Individual Values (IVs) in PokéRogue endless mode.

## Features

- **Stat Calculation**: Calculate final stats from IVs, level, nature, vitamins, and held items
- **IV Calculation**: Reverse-engineer IVs from actual stats (exact at level 100+, approximate below)
- **Endless Mode Support**: Level cap up to 99,999
- **Stat Modifiers**:
  - Flip Stat Challenge (rotates base stats)
  - Shuckle Juice (+10 BST)
  - Old Gateau (+10 to all base stats)
  - Vitamins (+10% per vitamin, max 31)
  - Held items (Eviolite, Light Ball, Thick Club, etc.)
  - Macho Brace and Soul Dew support
- **Stat Pentagon**: Visual representation of IV distribution
- **Impossible Stat Detection**: Validates that entered stats are within possible ranges
- **Cross-link**: Quick link to the [Fusion Calculator](https://roundsalmon4.github.io/fusioncalc-web/)

## Getting Started

### Running Locally

Open `index.html` directly in a browser.

### Deploying

Changes pushed to `main` branch automatically deploy to GitHub Pages via GitHub Actions.

## Tech Stack

- Vanilla JavaScript
- CSS
- HTML

## Data Source

Pokémon data is synced from the [PokeRogue-Dex](https://github.com/Sandstormer/PokeRogue-Dex) via GitHub Actions.

## License

MIT
