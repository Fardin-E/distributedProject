const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const errorCodeSuggestionInstruction = `
Return only error code suggestions
ignore the comments in the code that start with double slashes or hashtag. 
make sure to check what language is posssibly being compiled, the options are python, c++, or c, and ignore comments for all three of these types.
Do not provide corrected code only ways to fix it and which line.
Give 1 to 3 valid alternative solution.
ignore errors where they are just warnings
do not give solutions to problems that are not necessary for the code to run
`

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
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    const openai = new OpenAI({
        key: process.env.OPENAI_API_KEY,
        // Other configuration options if needed
    });

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
            io.emit('translationOutput', translationOutput);
        } catch (error) {
            console.error('Error during translation:', error);
            io.emit('translationOutput', 'Error during translation.');
        }
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

    // Change this line
    socket.on('runCodeCompletion', async (userCode) => {
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                { role: 'system', content: errorCodeSuggestionInstruction }, 
                
                { role: 'user', content: userCode }
                ],
                model: 'gpt-3.5-turbo',
            });

            const aiResponse = completion.choices[0].message.content;
            io.emit('codeCompletionOutput', aiResponse);
        } catch (error) {
            console.error('Error during code completion:', error);
            io.emit('codeCompletionOutput', 'Error during code completion.');
        }
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
