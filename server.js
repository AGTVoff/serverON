const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let connectedClient = null;
let pendingCommand = null; // { action: "execute", code: "..." }
let logs = []; // stocke les logs du client

// Page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

// Enregistrement d'un client
app.post('/connect', (req, res) => {
    connectedClient = req.body.name;
    console.log(`[SERVER] Client connecté : ${connectedClient}`);
    logs.push(`[SERVER] Client connecté : ${connectedClient}`);
    res.json({ status: 'ok' });
});

// Récupérer le client actuel
app.get('/client', (req, res) => {
    res.json({ name: connectedClient });
});

// Envoyer du code Lua à exécuter
app.post('/execute', (req, res) => {
    if (connectedClient && req.body.code) {
        pendingCommand = { action: "execute", code: req.body.code };
        logs.push(`[SERVER] Code envoyé au client ${connectedClient}`);
        console.log(`[SERVER] Code envoyé au client ${connectedClient}`);
        res.json({ status: 'Code envoyé !' });
    } else {
        res.json({ status: 'Aucun client connecté ou code vide' });
    }
});

// Endpoint que le client interrogera pour récupérer la commande
app.get('/command', (req, res) => {
    res.json(pendingCommand || null);
    pendingCommand = null; // commande consommée
});

// Recevoir les logs du client
app.post('/log', (req, res) => {
    if(req.body.log) {
        logs.push(req.body.log);
        console.log(req.body.log);
    }
    res.json({ status: 'ok' });
});

// Endpoint pour récupérer les logs côté serveur
app.get('/logs', (req, res) => {
    res.json({ logs });
});

app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
