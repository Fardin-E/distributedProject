const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('runPython', (pythonCode) => {
        // Save the Python code to a temporary file
        const fileName = 'temp.py';

        // Write the Python code to the file
        require('fs').writeFileSync(fileName, pythonCode);

        // Run the Python script
        exec(`python ${fileName}`, (err, stdout, stderr) => {
            if (err) {
                io.emit('pythonOutput', `Error: ${stderr}`);
            } else {
                io.emit('pythonOutput', stdout);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
