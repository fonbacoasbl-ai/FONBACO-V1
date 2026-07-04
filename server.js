// FONBACO SERVER.JS - BLOC 3/5
// LOI: RÉPARTITION 50% APP | 48% GAGNANT | 2% BRÛLÉ + MONNAIE

const express = require('express');
const app = express();
app.use(express.json());

// BASE DE DONNÉES
let users = {"test-user": {energie: 100, pieces: 500, grade: 0, conserve: 0, solde: 0, xp: 0}};
let caisseApp = 0; // Coffre de l'Application
let caisseBrule = 0; // Coffre brûlé

// MODULE IA PROVERBE LINGALA=FRANÇAIS
const proverbes = [
    {ctx: "gorille", lingala: "Loboko moko ezali kokende te", fr: "Une seule main ne ramasse pas la farine"},
    {ctx: "comeback", lingala: "Mutu oyo akufi te akokufa lisusu te", fr: "Celui qui n'est pas mort ne mourra plus"},
    {ctx: "victoire", lingala: "Ndeke moko ekotaka te na likolo", fr: "Un seul oiseau ne vole pas au ciel"},
    {ctx: "defaite", lingala: "Nzela ya moke ememaka na nzela ya monene", fr: "Un petit chemin mène au grand chemin"}
];

// ROUTE 1: ACHETER PIÈCES = 1$ = 100 PIÈCES
app.post('/pieces/acheter', (req, res) => {
    const {userId, dollars} = req.body;
    const piecesAchetees = dollars * 100;
    users[userId].pieces += piecesAchetees;
    users[userId].solde -= dollars;
    res.json({msg: `+${piecesAchetees} Pièces achetées`, pieces: users[userId].pieces});
});

// ROUTE 2: LANCER COMBAT 4J - LOI: ÉNERGIE DOIT ÊTRE 100
app.post('/combat/lancer', (req, res) => {
    const {j1, j2, mise} = req.body;
    if(users[j1].energie < 100 || users[j2].energie < 100) return res.status(400).json({msg: "ÉNERGIE pas pleine. Remplir d'abord"});
    users[j1].energie = 0; users[j2].energie = 0;
    users[j1].pieces -= mise; users[j2].pieces -= mise;
    res.json({msg: `Combat lancé! Mise totale: ${mise*2}P. Durée: 3min`});
});

// ROUTE 3: FIN COMBAT - LOI DU PRÉSIDENT 50% | 48% | 2%
app.post('/combat/fin', (req, res) => {
    const {gagnant, miseTotale} = req.body;
    const partGagnant = miseTotale * 0.48;
    const partApp = miseTotale * 0.50;
    const partBrule = miseTotale * 0.02;
    
    users[gagnant].pieces += miseTotale + partGagnant;
    users[gagnant].xp += 200;
    caisseApp += partApp;
    caisseBrule += partBrule;
    
    res.json({
        msg: `Victoire! +${miseTotale + partGagnant}P +200 XP`, 
        repartition: {gagnant: partGagnant, app: partApp, brule: partBrule}
    });
});

// ROUTE 4: PROVERBE AUTO
app.post('/ia/proverbe', (req, res) => {
    const {contexte} = req.body;
    const prov = proverbes.find(p => p.ctx === contexte) || proverbes[0];
    res.json({proverbe: `${prov.lingala} = ${prov.fr}`});
});

// ROUTE 5: VOIR LES CAISSES
app.get('/caisses', (req, res) => {
    res.json({app: caisseApp, brule: caisseBrule});
});

const PORT = 3000;
app.listen(PORT, () => console.log(`FONBACO SERVER ACTIF LOI 50-48-2`));
