/**
 * PokéRogue Stats Calculator
 * 
 * Stat calculation formulas verified against PokéRogue source:
 * - src/field/pokemon.ts (calculateStats method)
 * - src/data/nature.ts (getNatureStatMultiplier)
 * - src/modifier/modifier.ts (all stat modifiers)
 */

let selectedPokemon = null;

function initPokemonData() {
    if (typeof POKEMON_DATA !== 'undefined') {
        console.log('Loaded ' + Object.keys(POKEMON_DATA).length + ' Pokemon');
    } else {
        console.error('POKEMON_DATA not found!');
    }
}

const STAT_KEYS = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'spd'];
const STAT_NAMES = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];

const NATURE_MODIFIERS = {
    'Adamant': { increases: 'atk', decreases: 'spAtk' },
    'Bashful': { increases: 'spAtk', decreases: 'spAtk' },
    'Bold': { increases: 'def', decreases: 'atk' },
    'Brave': { increases: 'atk', decreases: 'spd' },
    'Calm': { increases: 'spDef', decreases: 'atk' },
    'Careful': { increases: 'spDef', decreases: 'spAtk' },
    'Docile': { increases: 'def', decreases: 'def' },
    'Gentle': { increases: 'spDef', decreases: 'def' },
    'Hardy': { increases: 'atk', decreases: 'atk' },
    'Hasty': { increases: 'spd', decreases: 'def' },
    'Impish': { increases: 'def', decreases: 'spAtk' },
    'Jolly': { increases: 'spd', decreases: 'spAtk' },
    'Lax': { increases: 'def', decreases: 'spDef' },
    'Lonely': { increases: 'atk', decreases: 'def' },
    'Mild': { increases: 'spAtk', decreases: 'def' },
    'Modest': { increases: 'spAtk', decreases: 'atk' },
    'Naive': { increases: 'spd', decreases: 'spDef' },
    'Naughty': { increases: 'atk', decreases: 'spDef' },
    'Quiet': { increases: 'spAtk', decreases: 'spd' },
    'Quirky': { increases: 'spDef', decreases: 'spDef' },
    'Rash': { increases: 'spAtk', decreases: 'spDef' },
    'Relaxed': { increases: 'def', decreases: 'spd' },
    'Sassy': { increases: 'spDef', decreases: 'spd' },
    'Serious': { increases: 'spd', decreases: 'spd' },
    'Timid': { increases: 'spd', decreases: 'atk' }
};

const SPECIES_ITEMS = {
    'Pikachu': 'lightBall', 'Raichu': 'lightBall',
    'Marowak': 'thickClub', 'Marowak-Alola': 'thickClub', 'Cubone': 'thickClub',
    'Ditto': 'metalPowder',
    'Clamperl': 'deepSeaScale',
    'Gorebyss': 'deepSeaTooth', 'Huntail': 'deepSeaScale'
};

function canUseEviolite(pokemonName) {
    const pokemon = POKEMON_DATA[pokemonName];
    if (!pokemon || !pokemon.evolution) return true;
    const evoLine = pokemon.evolution.split(',').map(e => e.trim());
    const isFinalForm = evoLine.length === 1 || evoLine[evoLine.length - 1] === pokemonName;
    return !isFinalForm;
}

function setStatus(msg, isError = false) {
    const statusBar = document.getElementById('status-bar');
    statusBar.textContent = msg;
    statusBar.style.color = isError ? '#ff6b6b' : '#888';
}

function addToLog(text, type = '') {
    const log = document.getElementById('calculationLog');
    if (!log) return;
    
    const line = document.createElement('div');
    line.className = 'terminal-line ' + type;
    line.innerHTML = '';
    log.appendChild(line);
    
    // Typing effect
    const fullText = text;
    let index = 0;
    const speed = 3;
    
    function typeChar() {
        if (index < fullText.length) {
            line.innerHTML = fullText.substring(0, index + 1);
            index++;
            setTimeout(typeChar, speed);
        }
        log.scrollTop = log.scrollHeight;
    }
    
    typeChar();
}

function clearLog() {
    const log = document.getElementById('calculationLog');
    if (log) log.innerHTML = '<div class="terminal-line">> Select a Pokémon to begin</div>';
}

function clearHighlights() {
    document.querySelectorAll('.stat-input-field, .iv-input-field, .vitamin-field, .item-field').forEach(el => {
        el.classList.remove('error-highlight');
    });
    document.getElementById('search').classList.remove('error-highlight');
    document.getElementById('level').classList.remove('error-highlight');
}

function highlightField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.add('error-highlight');
}

function getPokemonList() {
    return Object.keys(POKEMON_DATA).sort((a, b) => (POKEMON_DATA[a].id || 0) - (POKEMON_DATA[b].id || 0));
}

function getFilteredPokemonList(filter) {
    const filterLower = filter.toLowerCase();
    return getPokemonList().filter(name => name.toLowerCase().includes(filterLower)).slice(0, 100);
}

function populatePokemonList(filter = '') {
    const listContainer = document.getElementById('pokemonList');
    listContainer.innerHTML = '';
    const pokemonNames = getFilteredPokemonList(filter);
    pokemonNames.forEach(name => {
        const div = document.createElement('div');
        div.innerHTML = `<span class="poke-id">#${POKEMON_DATA[name].id}</span> ${name}`;
        div.onclick = () => selectPokemon(name);
        if (selectedPokemon === name) div.classList.add('selected');
        listContainer.appendChild(div);
    });
}

function selectPokemon(name) {
    const pokemon = POKEMON_DATA[name];
    if (!pokemon) return;
    selectedPokemon = name;
    document.getElementById('pokemonTitle').textContent = name;
    const listContainer = document.getElementById('pokemonList');
    Array.from(listContainer.children).forEach(child => {
        const childName = child.textContent.replace('#', '').trim();
        child.classList.toggle('selected', childName === name);
    });
    const imgId = pokemon.img || pokemon.id;
    
    const statLabels = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spd'];
    const statValues = [pokemon.hp, pokemon.attack, pokemon.defense, pokemon.spAttack, pokemon.spDefense, pokemon.speed];
    let statsHtml = '<div class="stat-line-container">';
    statLabels.forEach((label, i) => {
        statsHtml += `<div class="stat-line"><span class="stat-label">${label}:</span><span class="stat-value">${statValues[i]}</span></div>`;
    });
    statsHtml += `<div class="total-bst">BST: ${pokemon.bst}</div>`;
    statsHtml += `<div class="type-line">Type: ${pokemon.type1}${pokemon.type2 ? '/' + pokemon.type2 : ''}</div>`;
    statsHtml += '</div>';
    
    document.getElementById('baseStatsDisplay').innerHTML = statsHtml;
    document.getElementById('pokemonSprite').innerHTML = `<img src="images/${imgId}_0.png" alt="${name}" onerror="this.style.display='none'; this.parentElement.classList.add('no-sprite');">`;
    
    clearLog();
    addToLog(`> Selected: ${name}`, '');
    setStatus(`Selected: ${name}`);
    // Draw pentagon after DOM update
    setTimeout(() => drawStatPentagon(null), 0);
}

function applyFlipStat(baseStats) {
    const stats = baseStats.slice();
    const temp = [...stats];
    stats[0] = temp[5]; stats[1] = temp[4]; stats[2] = temp[3];
    stats[3] = temp[2]; stats[4] = temp[1]; stats[5] = temp[0];
    return stats;
}

function applyShuckleJuice(baseStats) {
    // Shuckle Juice: +10 to total BST (HP gets +5, rest split +5)
    const stats = [...baseStats];
    stats[0] += 5;
    const remaining = 5;
    for (let i = 1; i < 6; i++) {
        stats[i] += Math.floor(remaining / 5);
    }
    return stats;
}

function applyOldGateau(baseStats) {
    // Old Gateau: +10 flat to ALL base stats
    return baseStats.map(stat => stat + 10);
}

function applyVitaminsToBaseStats(baseStats, vitamins) {
    return baseStats.map((stat, i) => Math.floor(stat * (1 + (vitamins[i] || 0) * 0.1)));
}

function getNatureMultiplier(natureName, statKey) {
    const nature = NATURE_MODIFIERS[natureName];
    if (!nature) return 1.0;
    if (nature.increases === statKey) return 1.1;
    if (nature.decreases === statKey) return 0.9;
    return 1.0;
}

function applyHeldItems(baseStats, pokemonName, machoBraceStacks, ivs) {
    const stats = [...baseStats];
    
    // Macho Brace: +2 HP, +1 other per stack, +10%/5% bonus at max (50)
    if (machoBraceStacks > 0) {
        stats[0] += 2 * machoBraceStacks;
        for (let i = 1; i < 6; i++) stats[i] += machoBraceStacks;
        if (machoBraceStacks >= 50) {
            stats[0] = Math.floor(stats[0] * 1.1);
            for (let i = 1; i < 6; i++) stats[i] = Math.floor(stats[i] * 1.05);
        }
    }
    
    // Species items (checkbox - single use)
    const speciesItem = SPECIES_ITEMS[pokemonName];
    if (document.getElementById('lightBall')?.checked && speciesItem === 'lightBall') {
        stats[1] *= 2; stats[3] *= 2;
    }
    if (document.getElementById('thickClub')?.checked && speciesItem === 'thickClub') {
        stats[1] *= 2;
    }
    if (document.getElementById('metalPowder')?.checked && speciesItem === 'metalPowder') {
        stats[2] *= 2;
    }
    if (document.getElementById('quickPowder')?.checked && pokemonName === 'Ditto') {
        stats[5] *= 2;
    }
    if (document.getElementById('deepSeaScale')?.checked && (speciesItem === 'deepSeaScale' || pokemonName === 'Huntail')) {
        stats[4] *= 2;
    }
    if (document.getElementById('deepSeaTooth')?.checked && (speciesItem === 'deepSeaTooth' || pokemonName === 'Gorebyss')) {
        stats[3] *= 2;
    }
    // Eviolite: 1.5x Def/SpDef if not fully evolved
    if (document.getElementById('eviolite')?.checked && canUseEviolite(pokemonName)) {
        stats[2] = Math.floor(stats[2] * 1.5);
        stats[4] = Math.floor(stats[4] * 1.5);
    }
    
    return stats;
}

function getVitamins() {
    return [
        parseInt(document.getElementById('vitHP').value) || 0,
        parseInt(document.getElementById('vitAtk').value) || 0,
        parseInt(document.getElementById('vitDef').value) || 0,
        parseInt(document.getElementById('vitSpAtk').value) || 0,
        parseInt(document.getElementById('vitSpDef').value) || 0,
        parseInt(document.getElementById('vitSpd').value) || 0
    ];
}

function calculateStats() {
    clearHighlights();
    
    if (!selectedPokemon) {
        setStatus('Error: Please select a Pokémon', true);
        highlightField('search');
        return null;
    }
    
    const level = parseInt(document.getElementById('level').value);
    if (!level || level < 1 || level > 99999) {
        setStatus('Error: Please enter a valid level (1-99999)', true);
        highlightField('level');
        return null;
    }
    
    const maxIv = document.getElementById('maxIv').checked;
    const flipStat = document.getElementById('flipStat').checked;
    const shuckleJuice = document.getElementById('shuckleJuice').checked;
    const oldGateau = document.getElementById('oldGateau').checked;
    const soulDew = parseInt(document.getElementById('soulDew').value) || 0;
    
    const ivs = STAT_KEYS.map((key, i) => {
        if (maxIv) return 31;
        const elem = document.getElementById(`iv${key}`);
        if (!elem) return null;
        const val = parseInt(elem.value);
        if (isNaN(val) || val < 0 || val > 31) {
            setStatus(`Error: Invalid IV for ${STAT_NAMES[i]} (must be 0-31)`, true);
            highlightField(`iv${key}`);
            return null;
        }
        return val || 0;
    });
    if (ivs.includes(null)) return null;
    
    const pokemon = POKEMON_DATA[selectedPokemon];
    const natureName = document.getElementById('nature').value;
    const machoBrace = parseInt(document.getElementById('machoBrace').value) || 0;
    const vitamins = getVitamins();
    
    let baseStats = [pokemon.hp, pokemon.attack, pokemon.defense, pokemon.spAttack, pokemon.spDefense, pokemon.speed];
    
    addToLog(`<span class="label">Level:</span> ${level} | <span class="label">Nature:</span> ${natureName || 'Neutral'}`, '');
    
    if (flipStat) baseStats = applyFlipStat(baseStats);
    if (shuckleJuice) baseStats = applyShuckleJuice(baseStats);
    if (oldGateau) baseStats = applyOldGateau(baseStats);
    baseStats = applyVitaminsToBaseStats(baseStats, vitamins);
    baseStats = applyHeldItems(baseStats, selectedPokemon, machoBrace, ivs);
    
    addToLog(`<span class="label">Base+Vit:</span> ${baseStats.join(' ')}`, '');
    
    const stats = {};
    STAT_KEYS.forEach((key, index) => {
        let natureMult = getNatureMultiplier(natureName, key);
        // Apply Soul Dew (extra nature boost)
        if (natureMult !== 1.0 && soulDew > 0) {
            const sign = natureMult > 1 ? 1 : -1;
            natureMult += sign * soulDew * 0.1;
        }
        
        let calculated;
        let formula = '';
        if (key === 'hp') {
            const base = baseStats[index];
            const iv = ivs[index];
            calculated = Math.floor(((2 * base + iv) * level / 100) + level + 10);
            formula = `HP: floor(((2*${base}+${iv})*${level}/100)+${level}+10) = ${calculated}`;
        } else {
            const base = baseStats[index];
            const iv = ivs[index];
            const baseCalc = Math.floor(((2 * base + iv) * level / 100) + 5);
            calculated = natureMult > 1 ? Math.ceil(baseCalc * natureMult) : Math.floor(baseCalc * natureMult);
            formula = `${key.toUpperCase()}: floor(((2*${base}+${iv})*${level}/100)+5) = ${baseCalc} → ${natureMult !== 1 ? 'x' + natureMult.toFixed(1) : ''} = ${calculated}`;
        }
        stats[key] = Math.max(1, calculated);
        
        addToLog(formula, 'formula');
    });
    
    addToLog(`<span class="result">Final: HP=${stats.hp} Atk=${stats.atk} Def=${stats.def} SpA=${stats.spAtk} SpD=${stats.spDef} Spd=${stats.spd}</span>`, 'result');
    
    return stats;
}

function populateStats(stats) {
    STAT_KEYS.forEach(key => document.getElementById(key).value = stats[key]);
}

function calculateIVs() {
    clearHighlights();
    
    if (!selectedPokemon) {
        setStatus('Error: Please select a Pokémon', true);
        highlightField('search');
        return null;
    }
    
    const level = parseInt(document.getElementById('level').value);
    if (!level || level < 1 || level > 99999) {
        setStatus('Error: Please enter a valid level (1-99999)', true);
        highlightField('level');
        return null;
    }
    
    const actualStats = STAT_KEYS.map((key, i) => {
        const val = parseInt(document.getElementById(key).value);
        if (isNaN(val) || val < 1) {
            setStatus(`Error: Please enter a valid stat for ${STAT_NAMES[i]}`, true);
            highlightField(key);
            return null;
        }
        return val;
    });
    if (actualStats.includes(null)) return null;
    
    const pokemon = POKEMON_DATA[selectedPokemon];
    const natureName = document.getElementById('nature').value;
    const flipStat = document.getElementById('flipStat').checked;
    const shuckleJuice = document.getElementById('shuckleJuice').checked;
    const oldGateau = document.getElementById('oldGateau').checked;
    const soulDew = parseInt(document.getElementById('soulDew').value) || 0;
    const machoBrace = parseInt(document.getElementById('machoBrace').value) || 0;
    const vitamins = getVitamins();
    
    let baseStats = [pokemon.hp, pokemon.attack, pokemon.defense, pokemon.spAttack, pokemon.spDefense, pokemon.speed];
    if (flipStat) baseStats = applyFlipStat(baseStats);
    if (shuckleJuice) baseStats = applyShuckleJuice(baseStats);
    if (oldGateau) baseStats = applyOldGateau(baseStats);
    baseStats = applyVitaminsToBaseStats(baseStats, vitamins);
    baseStats = applyHeldItems(baseStats, selectedPokemon, machoBrace, null);
    
    const ivs = {};
    STAT_KEYS.forEach((key, index) => {
        let natureMult = getNatureMultiplier(natureName, key);
        if (natureMult !== 1.0 && soulDew > 0) {
            const sign = natureMult > 1 ? 1 : -1;
            natureMult += sign * soulDew * 0.1;
        }
        
        if (key === 'hp') {
            ivs[key] = Math.max(0, Math.min(31, Math.round(((actualStats[index] - level - 10) * 100 / level - 2 * baseStats[index]))));
        } else {
            let iv = 0;
            if (natureMult === 1.0) {
                iv = Math.round(((actualStats[index] - 5) * 100 / level - 2 * baseStats[index]));
            } else if (natureMult > 1) {
                const baseCalc = Math.ceil(actualStats[index] / natureMult);
                iv = Math.round((baseCalc - 5) * 100 / level - 2 * baseStats[index]);
            } else {
                const baseCalc = Math.floor(actualStats[index] / natureMult);
                iv = Math.round((baseCalc - 5) * 100 / level - 2 * baseStats[index]);
            }
            ivs[key] = Math.max(0, Math.min(31, iv));
        }
        
        const statName = key.toUpperCase();
        addToLog(`${statName}: IV=${ivs[key]} (base=${baseStats[index]})`, 'formula');
    });
    
    addToLog(`<span class="result">IVs: HP=${ivs.hp} Atk=${ivs.atk} Def=${ivs.def} SpA=${ivs.spAtk} SpD=${ivs.spDef} Spd=${ivs.spd}</span>`, 'result');
    
    return ivs;
}

function populateIVs(ivs) {
    STAT_KEYS.forEach(key => document.getElementById(`iv${key}`).value = ivs[key]);
}

function onCalculateStats() {
    clearLog();
    const stats = calculateStats();
    if (stats) {
        populateStats(stats);
        drawStatPentagon(stats);
        addToLog(`<span class="result">★ Stats populated in boxes above</span>`, 'result');
        setStatus('Stats calculated and populated');
    }
}

function onCalculateIVs() {
    clearLog();
    const ivs = calculateIVs();
    if (ivs) {
        populateIVs(ivs);
        addToLog(`<span class="result">★ IVs populated in boxes above</span>`, 'result');
        setStatus('IVs calculated and populated');
    }
}

function drawStatPentagon(stats) {
    const canvas = document.getElementById('statPentagon');
    if (!canvas) return;
    
    // If no stats provided, calculate from current IV inputs (default 15)
    if (!stats && selectedPokemon) {
        const pokemon = POKEMON_DATA[selectedPokemon];
        const level = parseInt(document.getElementById('level').value) || 50;
        const natureName = document.getElementById('nature').value;
        const ivs = STAT_KEYS.map(key => parseInt(document.getElementById(`iv${key}`).value) || 15);
        
        stats = {};
        STAT_KEYS.forEach((key, i) => {
            const base = pokemon[key === 'spAtk' ? 'spAttack' : key === 'spDef' ? 'spDefense' : key === 'spd' ? 'speed' : key === 'atk' ? 'attack' : key === 'def' ? 'defense' : key];
            let natureMult = getNatureMultiplier(natureName, key);
            let calculated;
            if (key === 'hp') {
                calculated = Math.floor(((2 * base + ivs[i]) * level / 100) + level + 10);
            } else {
                const baseCalc = Math.floor(((2 * base + ivs[i]) * level / 100) + 5);
                calculated = natureMult > 1 ? Math.ceil(baseCalc * natureMult) : Math.floor(baseCalc * natureMult);
            }
            stats[key] = Math.max(1, calculated);
        });
    }
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = 55;
    const statNames = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spd'];
    
    // Calculate min/max for each stat individually (IV=1 to IV=31)
    const statRanges = {};
    if (selectedPokemon && POKEMON_DATA[selectedPokemon]) {
        const pokemon = POKEMON_DATA[selectedPokemon];
        const level = parseInt(document.getElementById('level').value) || 50;
        
        STAT_KEYS.forEach(key => {
            const base = pokemon[key === 'spAtk' ? 'spAttack' : key === 'spDef' ? 'spDefense' : key === 'spd' ? 'speed' : key === 'atk' ? 'attack' : key === 'def' ? 'defense' : key];
            if (key === 'hp') {
                statRanges[key] = {
                    min: Math.floor(((2 * base + 1) * level / 100) + level + 10),
                    max: Math.floor(((2 * base + 31) * level / 100) + level + 10)
                };
            } else {
                statRanges[key] = {
                    min: Math.floor(((2 * base + 1) * level / 100) + 5),
                    max: Math.floor(((2 * base + 31) * level / 100) + 5)
                };
            }
        });
    }
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw background pentagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
        const x = cx + Math.cos(angle) * maxR;
        const y = cy + Math.sin(angle) * maxR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw inner pentagons
    for (let r = maxR * 0.25; r < maxR; r += maxR * 0.25) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // If no stats, just draw labels
    if (!stats) {
        ctx.font = '9px Consolas, monospace';
        ctx.fillStyle = '#4ecdc4';
        ctx.textAlign = 'center';
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
            const labelR = maxR + 15;
            const x = cx + Math.cos(angle) * labelR;
            const y = cy + Math.sin(angle) * labelR;
            ctx.fillText(statNames[i], x, y + 3);
        }
        return;
    }
    
    // Draw stat values
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
        const statKeys = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'spd'];
        const key = statKeys[i];
        const value = stats[key];
        // Normalize: IV=1 should be near center (small), IV=31 should be at edge
        const range = statRanges[key] || { min: 1, max: 300 };
        const ratio = (value - range.min) / (range.max - range.min);
        const r = maxR * Math.max(0.05, Math.min(ratio, 1));
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(78, 205, 196, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw labels
    ctx.font = '9px Consolas, monospace';
    ctx.fillStyle = '#4ecdc4';
    ctx.textAlign = 'center';
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
        const labelR = maxR + 10;
        const x = cx + Math.cos(angle) * labelR;
        const y = cy + Math.sin(angle) * labelR;
        ctx.fillText(statNames[i], x, y + 3);
    }
}

function onClear() {
    selectedPokemon = null;
    clearHighlights();
    document.getElementById('pokemonTitle').textContent = 'Select Pokémon';
    document.getElementById('search').value = '';
    document.getElementById('nature').value = '';
    document.getElementById('level').value = 50;
    document.getElementById('soulDew').value = 0;
    document.getElementById('pokemonList').innerHTML = '';
    document.getElementById('pokemonDetails').innerHTML = '';
    STAT_KEYS.forEach(key => {
        document.getElementById(key).value = 0;
        document.getElementById(`iv${key}`).value = 15;
    });
    ['vitHP', 'vitAtk', 'vitDef', 'vitSpAtk', 'vitSpDef', 'vitSpd'].forEach(id => {
        document.getElementById(id).value = 0;
    });
    document.getElementById('machoBrace').value = 0;
    ['eviolite', 'lightBall', 'thickClub', 'metalPowder', 'quickPowder', 'deepSeaScale', 'deepSeaTooth'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });
    document.getElementById('maxIv').checked = false;
    document.getElementById('flipStat').checked = false;
    document.getElementById('shuckleJuice').checked = false;
    document.getElementById('oldGateau').checked = false;
    clearLog();
    populatePokemonList();
    drawStatPentagon(null);
    setStatus('Cleared');
}

function init() {
    initPokemonData();
    document.getElementById('search').addEventListener('input', (e) => populatePokemonList(e.target.value));
    document.getElementById('calculateBtn').addEventListener('click', onCalculateStats);
    document.getElementById('calculateIvBtn').addEventListener('click', onCalculateIVs);
    document.getElementById('clearBtn').addEventListener('click', onClear);
    
    // Redraw pentagon when IVs or level change
    ['level', 'nature'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => { if (selectedPokemon) drawStatPentagon(null); });
    });
    STAT_KEYS.forEach(key => {
        const el = document.getElementById(`iv${key}`);
        if (el) el.addEventListener('input', () => { 
            el.classList.remove('default-value');
            if (selectedPokemon) drawStatPentagon(null); 
        });
    });
    
    populatePokemonList();
    drawStatPentagon(null);
    setStatus('Ready - Select a Pokémon and enter your stats to calculate IVs');
}

document.addEventListener('DOMContentLoaded', init);