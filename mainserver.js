// server1.js


const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const { exec } = require('child_process');
const io = socketIO(server);
const fs = require('fs');
const Server = require('socket.io-client');

const server2 = new Server('http://localhost:3001'); // Server 2 URL
const server3 = new Server('http://localhost:3002'); // Server 3 URL


app.use(express.static(path.join(__dirname, 'client')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Relay translation output from server2 to clients
server2.on('translationOutput', (translationOutput) => {
    io.emit('translationOutput', translationOutput);
});

// Relay code completion output from server3 to clients
server3.on('codeCompletionOutput', (codeCompletionOutput) => {
    io.emit('codeCompletionOutput', codeCompletionOutput);
});

io.on('connection', (socket) => {
    console.log('A user connected to Server 1');

    socket.on('updateContent', ({ content, cursorPosition }) => {
        io.emit('updateContent', { content, cursorPosition, senderSocketId: socket.id });
    });

    socket.on('sendText', (text) => {
        io.emit('receiveText', text);
    });

    socket.on('updateTextInput', (text) => {
        io.emit('updateTextInput', text);
    });

    //relay to server 2 and 3
    socket.on('commentTranslation', ({ language, codeWithComments }) => {
        
        console.log("Language sent for translation");
        server2.emit('commentTranslation', { language, codeWithComments });
        console.log("Language translation done");
    });

    socket.on('runCodeCompletion', ({ userCode }) => {
        console.log("Code Sent");
        server3.emit('runCodeCompletion', { userCode });
        console.log("Error suggestions returned");
    });

    socket.on('runPython', async (pythonCode) => {
        // Save the Python code to a temporary file
        const fileName = 'temp.py';

        // Write the Python code to the file
        fs.writeFileSync(fileName, pythonCode);

        // Run the Python script
        exec(`python ${fileName}`, (err, stdout, stderr) => {
            if (err) {
                io.emit('pythonOutput', `Error: ${stderr}`);
            } else {
                io.emit('pythonOutput', stdout);
            }
        });
    });

    socket.on('runC', (cCode) => {
        // Save the C code to a temporary file
        const fileName = 'temp.c';
        fs.writeFileSync(fileName, cCode);

        // Compile and run the C code
        compileAndRun('gcc', fileName, 'temp', io, 'cOutput');
    });

    socket.on('runCpp', (cppCode) => {
        // Save the C++ code to a temporary file
        const fileName = 'temp.cpp';
        fs.writeFileSync(fileName, cppCode);

        // Compile and run the C++ code
        compileAndRun('g++', fileName, 'temp', io, 'cppOutput');
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

function compileAndRun(compiler, inputFileName, outputFileName, io, outputEvent) {
    // Compile the code
    exec(`${compiler} ${inputFileName} -o ${outputFileName}`, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
            io.emit(outputEvent, `Compilation Error: ${compileStderr}`);
        } else {
            // Run the compiled program
            exec(`./${outputFileName}`, (runErr, runStdout, runStderr) => {
                if (runErr) {
                    io.emit(outputEvent, `Runtime Error: ${runStderr}`);
                } else {
                    io.emit(outputEvent, runStdout);
                }
            });
        }
    });
}