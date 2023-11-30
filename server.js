// server1.js

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const { Server: Server2 } = require('socket.io-client');
const { Server: Server3 } = require('socket.io-client');

const server2 = new Server2('http://localhost:4000'); // Server 2 URL
const server3 = new Server3('http://localhost:5000'); // Server 3 URL

app.use(express.static(path.join(__dirname, 'client')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected to Server 1');

    // Relay client requests to Server 2 and Server 3

    socket.on('commentTranslation', ({ language, codeWithComments }) => {
        server2.emit('commentTranslation', { language, codeWithComments });
    });

    socket.on('runPython', (pythonCode) => {
        server3.emit('runPython', pythonCode);
    });

    // Handle other client requests and relay to respective servers

    socket.on('disconnect', () => {
        console.log('User disconnected from Server 1');
    });
});

// Listen to a port for Server 1
const PORT = 3000; // Set your preferred port number
server.listen(PORT, () => {
    console.log(`Server 1 is running on port ${PORT}`);
});
