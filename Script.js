const gameBoard = document.getElementById('game-board');
const scoreSpan = document.getElementById('score');
const pairsFoundSpan = document.getElementById('pairs-found');
const resetButton = document.getElementById('reset-button');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let lockBoard = false; // Empêche de cliquer pendant le retournement

const numPairs = 8; // Nombre de paires par "niveau"
const boardCols = 4; // Nombre de colonnes (pour la mise en page)
const boardRows = Math.ceil(numPairs * 2 / boardCols); // Calcul des lignes

async function fetchRandomImage() {
    // Utilisation de Lorem Picsum pour des images aléatoires simples
    // Pour Unsplash, il faudrait une clé API et gérer les limites de requêtes.
    const width = 120; // Correspond à la taille de la carte en CSS
    const height = 120;
    const seed = Math.floor(Math.random() * 10000); // Pour avoir des images différentes à chaque appel
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

async function createCards() {
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    lockBoard = false;
    gameBoard.innerHTML = ''; // Nettoie l'ancien plateau
    score = 0; // Réinitialise le score à chaque nouveau jeu
    updateScore();

    // Réinitialiser la disposition de la grille CSS
    gameBoard.style.gridTemplateColumns = `repeat(${boardCols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${boardRows}, 1fr)`;

    const imagePromises = [];
    for (let i = 0; i < numPairs; i++) {
        imagePromises.push(fetchRandomImage());
    }

    const imageUrls = await Promise.all(imagePromises);
    const cardContent = [...imageUrls, ...imageUrls]; // Créer les paires

    // Mélanger les cartes
    cardContent.sort(() => Math.random() - 0.5);

    cardContent.forEach((imageUrl, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = imageUrl; // Stocke l'URL de l'image
        card.dataset.index = index; // Pour identifier la carte

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.textContent = '?'; // Peut être un chiffre ou un logo
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        const img = document.createElement('img');
        img.src = imageUrl;
        cardBack.appendChild(img);

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
        cards.push(card);
    });
}

function flipCard(card) {
    if (lockBoard) return;
    if (card === flippedCards[0]) return; // Empêche de cliquer deux fois sur la même carte

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        lockBoard = true;
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.image === card2.dataset.image;

    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    const [card1, card2] = flippedCards;
    card1.removeEventListener('click', () => flipCard(card1));
    card2.removeEventListener('click', () => flipCard(card2));

    card1.classList.add('matched');
    card2.classList.add('matched');

    matchedPairs++;
    score += 10; // Augmenter le score pour une paire trouvée
    updateScore();
    resetBoard();

    if (matchedPairs === numPairs) {
        setTimeout(() => {
            alert('Félicitations ! Toutes les paires trouvées ! Nouveau niveau !');
            createCards(); // Lance un nouveau niveau
        }, 1000);
    }
}

function unflipCards() {
    const [card1, card2] = flippedCards;
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        score = Math.max(0, score - 2); // Pénalité pour une mauvaise paire
        updateScore();
        resetBoard();
    }, 1000); // Garde les cartes visibles 1 seconde
}

function resetBoard() {
    [flippedCards, lockBoard] = [[], false];
}

function updateScore() {
    scoreSpan.textContent = score;
    pairsFoundSpan.textContent = matchedPairs;
}

resetButton.addEventListener('click', createCards);

// Initialisation du jeu
createCards();
