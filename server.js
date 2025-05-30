const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configuration pour Render
const PORT = process.env.PORT || 10000
const HOST = process.env.HOST || '0.0.0.0';

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes pour accéder directement aux interfaces
app.get('/teacher', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/teacher.html'));
});

app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/student.html'));
});

// Stockage du contenu partagé
let currentSharedContent = '';

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('✅ Nouveau client connecté');
  
  // Envoi du contenu actuel aux nouveaux clients
  socket.emit('updateContent', currentSharedContent);

  // Réception du contenu partagé par l'enseignant
  socket.on('shareContent', (html) => {
    currentSharedContent = html;
    socket.broadcast.emit('updateContent', html);
    console.log('📤 Contenu partagé avec les élèves');
  });

  // Réinitialisation des tablettes
  socket.on('resetTablets', () => {
    currentSharedContent = '';
    io.emit('clearTablets');
    console.log('🧹 Tablettes réinitialisées');
  });

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté');
  });
});

// Démarrage du serveur
server.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur actif sur http://${HOST}:${PORT}`);
});
