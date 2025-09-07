const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let connectedClient = null;
let pendingCode = null; // code Lua à exécuter
let logs = []; // logs du client

// Page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

// Enregistrer un client
app.post('/connect', (req, res) => {
    connectedClient = req.body.name;
    console.log(`[SERVER] Client connecté : ${connectedClient}`);
    res.json({ status: 'ok' });
});

// Récupérer le client actuel
app.get('/client', (req, res) => {
    res.json({ name: connectedClient });
});

// Définir du code Lua à exécuter sur le client
app.post('/execute', (req, res) => {
    if(!connectedClient){
        return res.json({ status: 'Aucun client connecté' });
    }
    const code = req.body.code;
    pendingCode = code;
    console.log(`[SERVER] Code envoyé au client : ${code}`);
    res.json({ status: 'Code envoyé au client !' });
});

// Endpoint que le client Roblox interrogera pour récupérer le code à exécuter
app.get('/command', (req, res) => {
    res.json({ code: pendingCode || null });
    pendingCode = null; // code consommé après envoi
});

// Endpoint pour récupérer les logs
app.post('/log', (req, res) => {
    if(req.body.log) {
        logs.push(req.body.log);
        console.log(`[CLIENT LOG] ${req.body.log}`);
    }
    res.json({ status: 'ok' });
});

app.get('/logs', (req, res) => {
    res.json({ logs });
});

// Déconnecter / Unlink le client
app.post('/unlink', (req, res) => {
    if(connectedClient){
        console.log(`[SERVER] Client ${connectedClient} déconnecté via Unlink`);
        connectedClient = null;
        pendingCode = null;
        res.json({ status: 'Client déconnecté !' });
    } else {
        res.json({ status: 'Aucun client à déconnecter' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
