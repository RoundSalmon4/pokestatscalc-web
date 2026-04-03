# PokéRogue Stats Calculator

A web-based calculator for calculating Pokémon stats and Individual Values (IVs) in PokéRogue.

## Features

- Calculate stats based on IVs, level, nature, SD, and stat modifiers
- Calculate IVs based on actual stats
- Side-by-side comparison of two Pokémon
- Search and select from all Pokémon in PokéRogue
- Nature modifiers with SD support

## Getting Started

1. Clone the repository
2. Open `website/index.html` in a browser

## Development

### Running locally

Simply open `website/index.html` in your web browser, or use a local server:

```bash
npx serve website
```

### Deploying to GitHub Pages

1. Ensure you have push access to the repository
2. Run: `npm run deploy`

This will deploy the contents of the `website` directory to the `gh-pages` branch.

## Data Updates

The Pokémon data is automatically updated daily from [PokeRogue-Dex](https://github.com/Sandstormer/PokeRogue-Dex) via GitHub Actions. You can manually trigger an update from the Actions tab.

## Tech Stack

- Vanilla JavaScript
- CSS
- HTML

## License

MIT