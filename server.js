// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir les fichiers statiques depuis le dossier public/
app.use(express.static(path.join(__dirname, 'public')));

// Stockage temporaire du contenu partagé
let currentSharedPages = '';

// Connexion d'un client (enseignant ou élève)
io.on('connection', (socket) => {
  console.log('✅ Client connecté');

  // Envoie immédiatement le contenu actuel à un nouvel élève
  socket.emit('updateContent', currentSharedPages);

  // Lorsqu'une page est partagée par l'enseignant
  socket.on('sharePage', (html) => {
    currentSharedPages = html;
    socket.broadcast.emit('updateContent', html);
    console.log('📤 Page(s) partagée(s) vers les élèves.');
  });

  // Réinitialisation
  socket.on('resetTablets', () => {
    currentSharedPages = '';
    io.emit('clearTablet');
    console.log('🧹 Réinitialisation des tablettes demandée.');
  });

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté');
  });
});

// Utiliser le port défini par Render ou 3000 en local
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur actif sur http://0.0.0.0:${PORT}`);
});
