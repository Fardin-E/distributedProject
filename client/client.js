const textInput = document.getElementById('textInput');
const output = document.getElementById('output');
const languageTranslationOutput = document.getElementById('languageTranslationOutput')
const aiResponse = document.getElementById('codeCompletionResult')
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
    socket.emit('runCodeCompletion', { userCode } );
}

function runCommentTranslation() {
    const languageDropdown = document.getElementById('languageDropdown');
    const selectedLanguage = languageDropdown.value;
    const codeWithComments = textInput.value;
    socket.emit('commentTranslation', { language: selectedLanguage, codeWithComments });
}

socket.on('translationOutput', (translation) => {
    languageTranslationOutput.value = translation;
});

socket.on('codeCompletionOutput', (completeResult) => {
    aiResponse.value = completeResult;
});

socket.on('pythonOutput', (outputText) => {
    // Display the Python script output
    output.innerText = outputText;
});

socket.on('cOutput', (outputText) => {
    // Display the Python script output
    output.innerText = outputText;
});

socket.on('cppOutput', (outputText) => {
    // Display the Python script output
    output.innerText = outputText;
});

