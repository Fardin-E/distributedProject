const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

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
        console.log("server.js runC");
        // Save the C code to a temporary file
        const fileName = 'temp.c';
        fs.writeFileSync(fileName, cCode);

        // Compile and run the C code
        compileAndRun('gcc', fileName, 'temp', io, 'cOutput');
    });

    socket.on('runCpp', (cppCode) => {
        console.log("server.js runCpp");
        // Save the C++ code to a temporary file
        const fileName = 'temp.cpp';
        fs.writeFileSync(fileName, cppCode);

        // Compile and run the C++ code
        compileAndRun('g++', fileName, 'temp', io, 'cppOutput');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
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
