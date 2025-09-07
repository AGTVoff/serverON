const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Variables globales
let connectedClient = null;
let pendingLuaCode = null;
let clientLogs = [];

// Page principale
app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Enregistrer un client
app.post('/connect', (req,res)=>{
    connectedClient = req.body.name;
    console.log(`[SERVER] Client connecté : ${connectedClient}`);
    res.json({ status: 'ok' });
});

// Déconnecter le client
app.post('/unlink', (req,res)=>{
    console.log(`[SERVER] Client déconnecté manuellement : ${connectedClient}`);
    connectedClient = null;
    pendingLuaCode = null;
    clientLogs = [];
    res.json({ status: 'Client déconnecté' });
});

// Endpoint pour envoyer le code Lua
app.post('/execute', (req,res)=>{
    const code = req.body.code;
    if(!connectedClient) return res.json({ status: 'Aucun client connecté' });

    pendingLuaCode = code;
    console.log(`[SERVER] Code enregistré pour le client`);
    res.json({ status: 'Code envoyé au client' });
});

// Endpoint que le client Roblox interroge
app.get('/command', (req,res)=>{
    res.json({ action: pendingLuaCode || null });
    pendingLuaCode = null; // consommé après envoi
});

// Endpoint pour récupérer le client actuel
app.get('/client', (req,res)=>{
    res.json({ name: connectedClient });
});

// Endpoint pour récupérer les logs
app.get('/logs', (req,res)=>{
    res.json({ logs: clientLogs });
});

// Endpoint pour recevoir logs du client
app.post('/log', (req,res)=>{
    if(req.body.log && connectedClient){
        clientLogs.push(req.body.log);
        if(clientLogs.length > 100) clientLogs.shift(); // garde seulement 100 dernières lignes
    }
    res.json({ status: 'ok' });
});

// Démarrage serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>console.log(`Serveur lancé sur le port ${PORT}`));
