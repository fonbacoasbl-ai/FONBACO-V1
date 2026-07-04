// FONBACO SERVER.JS - BLOC 1/5
// LOI: LES 5 COFFRES DU PRÉSIDENT

const express = require('express');
const app = express();
app.use(express.json());

// BASE DE DONNÉES DES 5 COFFRES
let users = {
  "test-user": {
    energie: 100, // COFFRE 1: PV. Max 100. +1/5min
    pieces: 0, // COFFRE 2: Monnaie. 1P = 1FC
    grade: 0, // COFFRE 3: Niveau 0→100
    conserve: 0, // COFFRE 4: Épargne verrouillée
    solde: 0 // COFFRE 5: Argent réel. Retrait 100$ min
  }
};

// ROUTE 1: VOIR LES 5 COFFRES
app.get('/coffres/:userId', (req, res) => {
    const user = users[req.params.userId];
    if(!user) return res.status(404).json({msg: "Joueur non trouvé"});
    res.json({
        ENERGIE: user.energie,
        PIECES: user.pieces,
        GRADE: user.grade,
        CONSERVE: user.conserve,
        SOLDE: user.solde + "$"
    });
});

// ROUTE 2: REMPLIR ÉNERGIE LOI = 1 Pièce = 1 HP
app.post('/energie/acheter', (req, res) => {
    const {userId, pieces} = req.body;
    if(users[userId].pieces < pieces) return res.status(400).json({msg: "Pas assez de pièces"});
    users[userId].pieces -= pieces;
    users[userId].energie += pieces;
    if(users[userId].energie > 100) users[userId].energie = 100;
    res.json({msg: `ÉNERGIE remplie. Nouveau PV: ${users[userId].energie}`});
});

// ROUTE 3: GAGNER XP QUAND ON ENVOIE = +1 XP / 2 Pièces
app.post('/xp/envoyer', (req, res) => {
    const {userId, pieces} = req.body;
    const xpGagne = Math.floor(pieces / 2);
    users[userId].xp = (users[userId].xp || 0) + xpGagne;
    res.json({msg: `+${xpGagne} XP. Total: ${users[userId].xp}`});
});

const PORT = 3000;
app.listen(PORT, () => console.log(`FONBACO SERVER ACTIF SUR PORT ${PORT}`));
