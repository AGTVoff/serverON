const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let connectedClient = null;
let pendingCommand = null;
let logs = [];

// Page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

// Enregistrement d'un client
app.post('/connect', (req, res) => {
    connectedClient = req.body.name;
    logs.push(`[SERVER] Client connecté : ${connectedClient}`);
    console.log(`[SERVER] Client connecté : ${connectedClient}`);
    res.json({ status: 'ok' });
});

// Récupérer le client actuel
app.get('/client', (req, res) => {
    res.json({ name: connectedClient });
});

// Exécution du code Lua envoyé depuis l'interface
app.post('/execute', (req, res) => {
    if(!connectedClient) return res.json({ status: 'Aucun client connecté' });
    const { code } = req.body;
    pendingCommand = code;
    logs.push(`[SERVER] Code envoyé au client : ${code.substring(0,50)}...`);
    console.log(`[SERVER] Code envoyé au client : ${code.substring(0,50)}...`);
    res.json({ status: 'Code envoyé au client' });
});

// Déconnecter le client manuellement
app.post('/unlink', (req, res) => {
    if (connectedClient) {
        const log = `[SERVER] Client ${connectedClient} a été déconnecté manuellement.`;
        console.log(log);
        logs.push(log);
        connectedClient = null;
        pendingCommand = null;
        res.json({ status: 'Client déconnecté' });
    } else {
        res.json({ status: 'Aucun client connecté' });
    }
});

// Récupération des commandes côté client
app.get('/command', (req, res) => {
    res.json({ action: pendingCommand || null });
    pendingCommand = null;
});

// Endpoint pour récupérer les logs
app.get('/logs', (req, res) => {
    res.json({ logs });
});

app.listen(8080, () => console.log('Serveur lancé sur le port 8080'));
