// server3.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const server3 = http.createServer(app);
const io = socketIO(server3);
const { OpenAI } = require('openai');
const Server = require('socket.io-client');
const mainServer = new Server('http://localhost:3000');
const errorCodeSuggestionInstruction = `
Return only error code suggestions
ignore the comments in the code that start with double slashes or hashtag. 
make sure to check what language is posssibly being compiled, the options are python, c++, or c, and ignore comments for all three of these types.
Do not provide corrected code only ways to fix it and which line.
Give 1 to 3 valid alternative solution.
ignore errors where they are just warnings
do not give solutions to problems that are not necessary for the code to run. Here is the code: [USER_CODE]
`

io.on('connection', (socket) => {
    console.log('Connected to Server 3');
    const openai = new OpenAI({
        key: process.env.OPENAI_API_KEY,
        // Other configuration options if needed
    });

    socket.on('runCodeCompletion', async (userCode) => {
        console.log("User code:", userCode);
        const prompt = errorCodeSuggestionInstruction
        .replace("[USER_CODE]", userCode);
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                { role: 'system', content: prompt }, 
                ],
                model: 'gpt-3.5-turbo',
            });

            const aiResponse = completion.choices[0].message.content;
            console.log("done code suggestions");
            mainServer.emit('codeCompletionOutput', aiResponse);
            socket.emit('codeCompletionOutput', aiResponse);
        } catch (error) {
            console.error('Error during code completion:', error);
            socket.emit('codeCompletionOutput', 'Error during code completion.');
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Server 3');
    });
});

// Listen to a port for Server 3
const PORT = 3002; // Set your preferred port number
server3.listen(PORT, () => {
    console.log(`Server 3 is running on port ${PORT}`);
});
