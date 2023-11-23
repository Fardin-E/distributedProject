const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('updateContent', ({ content, cursorPosition }) => {
        io.emit('updateContent', { content, cursorPosition, senderSocketId: socket.id });
    });

    socket.on('sendText', (text) => {
        io.emit('receiveText', text);
    });

    socket.on('updateTextInput', (text) => {
        io.emit('updateTextInput', text);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});