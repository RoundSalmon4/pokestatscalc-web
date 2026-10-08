# PokéRogue Stats Calculator

A web-based calculator for calculating Pokémon stats and Individual Values (IVs) in PokéRogue endless mode.

## Features

- **Stat Calculation**: Calculate final stats from IVs, level, nature, vitamins, and held items
- **IV Calculation**: Reverse-engineer IVs from actual stats (exact at level 100+, approximate below)
- **Endless Mode Support**: Level cap up to 99,999
- **Stat Modifiers**:
  - Flip Stat Challenge (rotates base stats)
  - Shuckle Juice (+5 HP, +10 to other base stats)
  - Old Gateau (+20 to the lower stat of each pair: HP/Spd, Atk/SpA, Def/SpD)
  - Vitamins (+10% per vitamin, max 31, applied to base stats)
  - Held items applied to the final stat (Eviolite, Light Ball, Thick Club, etc.)
  - Macho Brace and Soul Dew support
- **Stat Pentagon**: Visual representation of IV distribution
- **Impossible Stat Detection**: Validates that entered stats are within possible ranges
- **Cross-link**: Quick link to the [Fusion Calculator](https://roundsalmon4.github.io/fusioncalc-web/)

## Getting Started

### Running Locally

Open `index.html` directly in a browser.

### Deploying

Changes pushed to `main` are served on GitHub Pages (the site builds from the `main` branch root). Data auto-updates are also committed to `main` by the `update-data.yml` workflow.

## Tech Stack

- Vanilla JavaScript
- CSS
- HTML

## Data Source

Pokémon data is synced from the [PokeRogue-Dex](https://github.com/Sandstormer/PokeRogue-Dex) via GitHub Actions. The exact upstream commit used is recorded in `data_version.txt`.

## Attributions

Pokémon is © Nintendo / Creatures Inc. / GAME FREAK LLC. This is an unofficial fan project: Pokémon sprites and artwork remain the property of their original creators and are not affiliated with or endorsed by Nintendo, Creatures Inc., or GAME FREAK.

Pokémon data files and sprite images are synced from [Sandstormer/PokeRogue-Dex](https://github.com/Sandstormer/PokeRogue-Dex) (AGPL-3.0), which derives its data from [pagefaultgames/pokerogue](https://github.com/pagefaultgames/pokerogue) (AGPL-3.0). Generated data files carry a provenance header noting the upstream source and commit.

This project's own code is released under the MIT License; the bundled data and sprites remain under their upstream licenses.

## License

MIT
