const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let connectedClient = null;
let pendingCode = null; // Code Lua à exécuter
let logs = []; // Logs du client

// Page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

// Enregistrer un client
app.post('/connect', (req, res) => {
    connectedClient = req.body.name;
    console.log(`[SERVER] Client connecté : ${connectedClient}`);
    logs.push(`[SERVER] Client connecté : ${connectedClient}`);
    res.json({ status: 'ok' });
});

// Déconnecter / ejecter le client
app.post('/unlink', (req, res) => {
    if (connectedClient) {
        console.log(`[SERVER] Client déconnecté : ${connectedClient}`);
        logs.push(`[SERVER] Client déconnecté : ${connectedClient}`);
        connectedClient = null;
        pendingCode = null;
        res.json({ status: 'Client déconnecté' });
    } else {
        res.json({ status: 'Aucun client connecté' });
    }
});

// Endpoint que le client Roblox interrogera pour récupérer le code
app.get('/command', (req, res) => {
    res.json({ code: pendingCode || null });
    if (pendingCode) logs.push(`[SERVER] Code envoyé au client : ${pendingCode}`);
    pendingCode = null; // Code consommé après envoi
});

// Envoyer le code Lua depuis l'interface web
app.post('/execute', (req, res) => {
    const code = req.body.code;
    if (connectedClient && code) {
        pendingCode = code;
        console.log(`[SERVER] Code en attente pour : ${connectedClient}`);
        logs.push(`[SERVER] Code en attente pour : ${connectedClient}`);
        res.json({ status: 'Code envoyé au client' });
    } else {
        res.json({ status: 'Aucun client connecté ou code vide' });
    }
});

// Récupérer le client actuel
app.get('/client', (req, res) => {
    res.json({ name: connectedClient });
});

// Récupérer les logs
app.get('/logs', (req, res) => {
    res.json({ logs });
});

app.listen(process.env.PORT || 8080, () => console.log('Serveur lancé sur le port 8080'));
