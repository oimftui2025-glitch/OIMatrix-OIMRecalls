let currentLevel = 1;
let lives = 3;
let score = 0;
let teamName = "Tim Misterius";

let fullDeck = [];
let targetSequence = []; 
let userStep = 0; 
let showcaseInterval;
let replayCount = 5; 

const suits = [
    { id: 'S', icon: '♠', color: 'black' }, 
    { id: 'H', icon: '♥', color: 'red' },   
    { id: 'C', icon: '♣', color: 'black' }, 
    { id: 'D', icon: '♦', color: 'red' }    
];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// --- 1. NAVIGASI ---
function showPage(pageId) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- 2. GENERATE DECK ---
function initDeck() {
    fullDeck = [];
    suits.forEach(s => {
        values.forEach(v => {
            fullDeck.push({ suitId: s.id, icon: s.icon, color: s.color, value: v, id: `${v}-${s.id}` });
        });
    });
}

// --- 3. SETUP GAME ---
function saveAndStart() {
    const input = document.getElementById('teamNameInput').value;
    if(input.trim() === "") return alert("Isi nama tim lo dulu bos! 🐈");
    
    teamName = input;
    currentLevel = 1;
    score = 0;
    lives = 3;
    
    initDeck();
    startLevel();
    showPage('page4');
}

// --- 4. ENGINE LEVEL & MENGHAFAL ---
function startLevel() {
    document.getElementById('lvlDisplay').innerText = currentLevel;
    document.getElementById('scoreDisplay').innerText = score;
    document.getElementById('hearts').innerText = "❤️".repeat(lives);
    
    replayCount = 5;
    let rBtn = document.getElementById('replay-btn');
    if(rBtn) {
        rBtn.innerText = `🔄 ULANG HAFALAN (${replayCount})`;
        rBtn.disabled = false;
    }
    
    let numCards = Math.min(10 + ((currentLevel - 1) * 5), 52);
    
    let shuffledDeck = [...fullDeck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }

    targetSequence = shuffledDeck.slice(0, numCards);
    userStep = 0;

    document.getElementById('showcase-phase').classList.remove('hidden');
    document.getElementById('input-phase').classList.add('hidden');
    document.getElementById('game-status-text').innerText = "HAFALKAN URUTANNYA!";
    document.getElementById('game-status-text').style.color = "var(--neon-blue)";
    
    playShowcaseSequence();
}

function playShowcaseSequence() {
    let index = 0;
    const bigCard = document.getElementById('big-card');
    const counterText = document.getElementById('memory-counter');
    
    bigCard.classList.add('hidden'); 
    clearInterval(showcaseInterval);

    let speedMs = Math.max(1500 - (currentLevel * 100), 800); 

    setTimeout(() => {
        showcaseInterval = setInterval(() => {
            if(index >= targetSequence.length) {
                clearInterval(showcaseInterval);
                bigCard.classList.add('hidden');
                startInputPhase(); 
                return;
            }

            let card = targetSequence[index];
            counterText.innerText = `Kartu ${index + 1} / ${targetSequence.length}`;
            
            bigCard.className = `cyber-card big-card ${card.color}`;
            bigCard.innerHTML = `<div class="card-val">${card.value}</div><div class="card-suit">${card.icon}</div>`;
            bigCard.classList.remove('hidden');

            index++;
            
            setTimeout(() => bigCard.classList.add('hidden'), speedMs - 200); 

        }, speedMs);
    }, 1000);
}

// --- 5. FASE INPUT & REPLAY ---
function startInputPhase() {
    document.getElementById('showcase-phase').classList.add('hidden');
    document.getElementById('input-phase').classList.remove('hidden');
    document.getElementById('game-status-text').innerText = "PILIH KARTU KE-1";
    document.getElementById('game-status-text').style.color = "var(--gold-solid)";
    
    renderDeckGrid();
}

function replaySequence() {
    if(replayCount <= 0) return;
    
    replayCount--;
    let rBtn = document.getElementById('replay-btn');
    rBtn.innerText = `🔄 ULANG HAFALAN (${replayCount})`;
    
    if(replayCount === 0) rBtn.disabled = true;

    userStep = 0; 
    
    document.getElementById('input-phase').classList.add('hidden');
    document.getElementById('showcase-phase').classList.remove('hidden');
    document.getElementById('game-status-text').innerText = "HAFALKAN URUTANNYA!";
    document.getElementById('game-status-text').style.color = "var(--neon-blue)";
    
    playShowcaseSequence();
}

function renderDeckGrid() {
    const grid = document.getElementById('deck-grid');
    grid.innerHTML = '';

    fullDeck.forEach(card => {
        let btn = document.createElement('div');
        btn.className = `cyber-card small-card ${card.color}`;
        btn.id = `input-card-${card.id}`;
        btn.innerHTML = `<div class="card-val">${card.value}</div><div class="card-suit">${card.icon}</div>`;
        
        btn.onclick = () => selectCard(card.id, btn);
        grid.appendChild(btn);
    });
}

// --- 6. VALIDASI TEBAKAN ---
function selectCard(cardId, btnElement) {
    let expectedCard = targetSequence[userStep];

    if(cardId === expectedCard.id) {
        btnElement.classList.add('picked-correct');
        userStep++;
        score += 100; 
        document.getElementById('scoreDisplay').innerText = score;
        
        if(userStep < targetSequence.length) {
            document.getElementById('game-status-text').innerText = `PILIH KARTU KE-${userStep + 1}`;
        } else {
            handleLevelComplete();
        }
    } else {
        btnElement.classList.add('picked-wrong');
        setTimeout(() => btnElement.classList.remove('picked-wrong'), 300); 
        
        lives--;
        document.getElementById('hearts').innerText = "❤️".repeat(lives > 0 ? lives : 0);
        
        if(lives <= 0) {
            setTimeout(() => finishGame("Kehabisan Nyawa (Memory Failure)"), 500);
        }
    }
}

function handleLevelComplete() {
    score += (currentLevel * 1000); 
    document.getElementById('scoreDisplay').innerText = score;
    document.getElementById('success-modal').classList.remove('hidden');
}

function nextLevel() {
    document.getElementById('success-modal').classList.add('hidden');
    currentLevel++;
    startLevel();
}

// --- 7. GAME OVER ---
function finishGame(reason) {
    clearInterval(showcaseInterval);
    
    document.getElementById('finalName').innerText = teamName;
    document.getElementById('final-level').innerText = currentLevel;
    document.getElementById('finalScore').innerText = score;
    document.getElementById('gameover-reason').innerText = reason;
    
    showPage('page7');
}