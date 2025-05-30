const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir les fichiers statiques (html, js, pdfjs, etc.)
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
    currentSharedPages = html; // Met à jour le contenu partagé
    socket.broadcast.emit('updateContent', html); // Envoie à toutes les tablettes sauf l’enseignant
    console.log('📤 Page(s) partagée(s) vers les élèves.');
  });

  // Lorsqu'on demande une réinitialisation (nettoyage global)
  socket.on('resetTablets', () => {
    currentSharedPages = ''; // Vide le stockage
    io.emit('clearTablet');  // Avertit tous les clients (enseignant et élèves) pour réinitialiser
    console.log('🧹 Réinitialisation des tablettes demandée.');
  });

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté');
  });
});

// Démarrage du serveur
server.listen(3000, () => {
  console.log('🚀 Serveur actif sur http://192.168.1.100:3000');
});
