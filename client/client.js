const textInput = document.getElementById('textInput');
const output = document.getElementById('output');
const socket = io();

// Update text input as someone types
textInput.addEventListener('input', (event) => {
    const text = event.target.value;
    socket.emit('updateTextInput', text);
});

socket.on('updateTextInput', (text) => {
    textInput.value = text;
});

function runPython() {
    const pythonCode = textInput.value;
    socket.emit('runPython', pythonCode);
}

function runC() {
    const cCode = textInput.value;
    socket.emit('runC', cCode);
}

function runCpp(){
    const cppCode = textInput.value;
    socket.emit('runCpp', cppCode);
}

function runCodeCompletion() {
    const userCode = textInput.value;
    socket.emit('runCodeCompletion', userCode);
}

socket.on('pythonOutput', (outputText) => {
    output.innerText = `Python Output:\n${outputText}`;
});

socket.on('cOutput', (outputText) => {
    output.innerText = `C Output:\n${outputText}`;
});

socket.on('cppOutput', (outputText) => {
    output.innerText = `C++ Output:\n${outputText}`;
});

socket.on('codeCompletionOutput', (completionOutput) => {
    output.innerText = `Code Completion Output:\n${completionOutput}`;
});