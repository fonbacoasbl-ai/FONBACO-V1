// FONBACO SERVER.JS - BLOC 4/5
// LOI: GRADE 0→100 + CONSERVE + TOUTES LES LOIS

const express = require('express');
const app = express();
app.use(express.json());

// BASE DE DONNÉES
let users = {"test-user": {energie: 100, pieces: 500, grade: 0, conserve: 0, solde: 0, xp: 0}};
let caisseApp = 0;
let caisseBrule = 0;

// MODULE IA PROVERBE
const proverbes = [
    {ctx: "gorille", lingala: "Loboko moko ezali kokende te", fr: "Une seule main ne ramasse pas la farine"},
    {ctx: "comeback", lingala: "Mutu oyo akufi te akokufa lisusu te", fr: "Celui qui n'est pas mort ne mourra plus"},
    {ctx: "victoire", lingala: "Ndeke moko ekotaka te na likolo", fr: "Un seul oiseau ne vole pas au ciel"},
    {ctx: "defaite", lingala: "Nzela ya moke ememaka na nzela ya monene", fr: "Un petit chemin mène au grand chemin"}
];

// LOI 1: MONTER GRADE. 1000 XP = +1 GRADE
function monterGrade(userId){
    if(users[userId].xp >= 1000){
        users[userId].xp -= 1000;
        users[userId].grade += 1;
        return true;
    }
    return false;
}

// ROUTE 1: ACHETER PIÈCES
app.post('/pieces/acheter', (req, res) => {
    const {userId, dollars} = req.body;
    users[userId].pieces += dollars * 100;
    users[userId].solde -= dollars;
    res.json({msg: `+${dollars*100} Pièces`, pieces: users[userId].pieces});
});

// ROUTE 2: LANCER COMBAT
app.post('/combat/lancer', (req, res) => {
    const {j1, j2, mise} = req.body;
    if(users[j1].energie < 100 || users[j2].energie < 100) return res.status(400).json({msg: "ÉNERGIE pas pleine"});
    users[j1].energie = 0; users[j2].energie = 0;
    users[j1].pieces -= mise; users[j2].pieces -= mise;
    res.json({msg: `Combat lancé! Mise: ${mise*2}P`});
});

// ROUTE 3: FIN COMBAT - LOI 50% | 48% | 2%
app.post('/combat/fin', (req, res) => {
    const {gagnant, miseTotale} = req.body;
    const partGagnant = miseTotale * 0.48;
    const partApp = miseTotale * 0.50;
    const partBrule = miseTotale * 0.02;
    
    users[gagnant].pieces += miseTotale + partGagnant;
    users[gagnant].xp += 200;
    caisseApp += partApp;
    caisseBrule += partBrule;
    
    // VÉRIFIER SI MONTEE DE GRADE
    if(monterGrade(gagnant)) res.json({msg: `Victoire! +200 XP + GRADE UP! Nouveau Grade: ${users[gagnant].grade}`});
    else res.json({msg: `Victoire! +200 XP. XP Total: ${users[gagnant].xp}`});
});

// ROUTE 4: METTRE EN CONSERVE - LOI: VERROUILLÉ 7 JOURS
app.post('/conserve/mettre', (req, res) => {
    const {userId, pieces} = req.body;
    if(users[userId].pieces < pieces) return res.status(400).json({msg: "Pas assez de pièces"});
    users[userId].pieces -= pieces;
    users[userId].conserve += pieces;
    res.json({msg: `${pieces}P mises en CONSERVE. Déverrouillage dans 7 jours`});
});

// ROUTE 5: PROVERBE AUTO
app.post('/ia/proverbe', (req, res) => {
    const {contexte} = req.body;
    const prov = proverbes.find(p => p.ctx === contexte) || proverbes[0];
    res.json({proverbe: `${prov.lingala} = ${prov.fr}`});
});

// ROUTE 6: VOIR PROFIL COMPLET
app.get('/profil/:userId', (req, res) => {
    res.json(users[req.params.userId]);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`FONBACO SERVER ACTIF - GRADE + CONSERVE`));
