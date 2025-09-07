const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let connectedClient = null;
let pendingCommand = null; // commande à exécuter côté client
let logs = []; // logs des actions exécutées

// Page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

// Enregistrement d'un client
app.post('/connect', (req, res) => {
    connectedClient = req.body.name;
    const log = `[SERVER] Client connecté : ${connectedClient}`;
    console.log(log);
    logs.push(log);
    res.json({ status: 'ok' });
});

// Récupérer le client actuel
app.get('/client', (req, res) => {
    res.json({ name: connectedClient });
});

// Envoyer un script à exécuter
app.post('/execute', (req, res) => {
    if (connectedClient) {
        const { code } = req.body;
        if (code) {
            pendingCommand = { action: 'execute', code };
            const log = `[SERVER] Code exécuté envoyé au client ${connectedClient}`;
            console.log(log);
            logs.push(log);
            res.json({ status: 'Code envoyé au client' });
        } else {
            res.json({ status: 'Aucun code fourni' });
        }
    } else {
        res.json({ status: 'Aucun client connecté' });
    }
});

// Endpoint que le client Roblox interrogera pour récupérer la commande
app.get('/command', (req, res) => {
    res.json(pendingCommand || {});
    pendingCommand = null; // commande consommée après envoi
});

// Récupérer les logs
app.get('/logs', (req, res) => {
    res.json({ logs });
});

// ✅ IMPORTANT : écouter le port Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur lancé sur port ${PORT}`));
