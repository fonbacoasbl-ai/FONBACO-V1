// FONBACO SERVER.JS - BLOC 5/5 FINAL
// LOI COMPLÈTE: RETRAIT + REGEN ÉNERGIE + TOUT

const express = require('express');
const app = express();
app.use(express.json());

// BASE DE DONNÉES
let users = {"test-user": {energie: 100, pieces: 500, grade: 0, conserve: 0, solde: 0, xp: 0, lastEnergy: Date.now()}};
let caisseApp = 0;
let caisseBrule = 0;

// MODULE IA PROVERBE LINGALA=FRANÇAIS
const proverbes = [
    {ctx: "gorille", lingala: "Loboko moko ezali kokende te", fr: "Une seule main ne ramasse pas la farine"},
    {ctx: "comeback", lingala: "Mutu oyo akufi te akokufa lisusu te", fr: "Celui qui n'est pas mort ne mourra plus"},
    {ctx: "victoire", lingala: "Ndeke moko ekotaka te na likolo", fr: "Un seul oiseau ne vole pas au ciel"},
    {ctx: "defaite", lingala: "Nzela ya moke ememaka na nzela ya monene", fr: "Un petit chemin mène au grand chemin"}
];

// LOI: REGENERATION ENERGIE = +1 PV / 5 MINUTES
setInterval(() => {
    for(let userId in users){
        if(users[userId].energie < 100){
            users[userId].energie += 1;
        }
    }
}, 5 * 60 * 1000); // 5 minutes

// LOI: MONTER GRADE. 1000 XP = +1 GRADE
function monterGrade(userId){
    if(users[userId].xp >= 1000){
        users[userId].xp -= 1000;
        users[userId].grade += 1;
        return true;
    }
    return false;
}

// ROUTE 1: ACHETER PIÈCES = 1$ = 100 PIÈCES
app.post('/pieces/acheter', (req, res) => {
    const {userId, dollars} = req.body;
    users[userId].pieces += dollars * 100;
    users[userId].solde -= dollars;
    res.json({msg: `+${dollars*100} Pièces`, pieces: users[userId].pieces});
});

// ROUTE 2: LANCER COMBAT 4J
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
    
    if(monterGrade(gagnant)) res.json({msg: `Victoire! +200 XP + GRADE UP! Grade: ${users[gagnant].grade}`});
    else res.json({msg: `Victoire! +200 XP. XP: ${users[gagnant].xp}`});
});

// ROUTE 4: METTRE EN CONSERVE
app.post('/conserve/mettre', (req, res) => {
    const {userId, pieces} = req.body;
    users[userId].pieces -= pieces;
    users[userId].conserve += pieces;
    res.json({msg: `${pieces}P en CONSERVE. 7 jours`});
});

// ROUTE 5: RETRAIT - LOI: MINIMUM 100$
app.post('/retrait', (req, res) => {
    const {userId, dollars} = req.body;
    if(dollars < 100) return res.status(400).json({msg: "RETRAIT MINIMUM 100$"});
    if(users[userId].solde < dollars) return res.status(400).json({msg: "Solde insuffisant"});
    users[userId].solde -= dollars;
    res.json({msg: `Demande de retrait ${dollars}$ envoyée. Traitement 24h`});
});

// ROUTE 6: PROVERBE AUTO
app.post('/ia/proverbe', (req, res) => {
    const {contexte} = req.body;
    const prov = proverbes.find(p => p.ctx === contexte) || proverbes[0];
    res.json({proverbe: `${prov.lingala} = ${prov.fr}`});
});

// ROUTE 7: VOIR PROFIL COMPLET
app.get('/profil/:userId', (req, res) => {
    res.json(users[req.params.userId]);
});

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => { 
      console.log(`FONBACO SERVER ACTIF SUR ${PORT}`); 
    });