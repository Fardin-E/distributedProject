// server2.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const server2 = http.createServer(app);
const io = socketIO(server2);
const { OpenAI } = require('openai');
const Server = require('socket.io-client');
const Server2 = new Server('http://localhost:3000');



const languageTranslationInstruction = `Translate the comments in the provided code to [DESTINATION_LANGUAGE]. 
Maintain the line numbers and comment symbols (e.g., # or //). do not keep the orignal code in the output, just the comments.
 Some comments will have the words connected to the // or # like this: //hello. make sure to watch for this and translate as well. take the text and directly translate the meaning to the destination language.
 do not add any extra text other than what is in the comment. do not mention that the translated text is a comment.
 if the comment is already in the specified language then dont translate just return original.
 keep the vertical spacing the same as the original: if there are 5 lines after a comment in the original before the next comment, 
 add 5 empty lines after to keep it consistent with the original structure of comments, even if destination language is same as original.
 do not translate the code. replace the lines of code with empty string, even in the string within the code inside double quotations.
 only return comments and absolutely no actual code.

=== Code ===
[CODE_WITH_COMMENTS]
`


io.on('connection', (socket) => {
    console.log('Connected to Server 2');
    const openai = new OpenAI({
        key: process.env.OPENAI_API_KEY,
        // Other configuration options if needed
    });

    socket.on('commentTranslation', async ({ language, codeWithComments }) => {
        const prompt = languageTranslationInstruction
            .replace("[DESTINATION_LANGUAGE]", language)
            .replace("[CODE_WITH_COMMENTS]", codeWithComments);

        try {
            const translation = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: prompt },
                ],
                model: 'gpt-3.5-turbo',
            });

            const translationOutput = translation.choices[0].message.content;
            Server2.emit('translationOutput', translationOutput);

            socket.emit('translationOutput', translationOutput);
            console.log("done");
        } catch (error) {
            console.error('Error during translation:', error);
            io.emit('translationOutput', 'Error during translation.');
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Server 2');
    });
});

// Listen to a port for Server 2
const PORT = 3001; // Set your preferred port number
server2.listen(PORT, () => {
    console.log(`Server 2 is running on port ${PORT}`);
});


Server2.on('translationOutput', (translationOutput) => {
    io.emit('translationOutput', translationOutput);
});