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

socket.on('pythonOutput', (outputText) => {
    // Display the Python script output
    output.innerText = outputText;
});
