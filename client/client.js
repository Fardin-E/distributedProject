const editorContainer = document.getElementById('editor-container');
const lineNumbers = document.getElementById('lineNumbers');
const editor = document.getElementById('textInput');
const output = document.getElementById('output');
const socket = io();

let cursorPosition = { start: 0, end: 0 };
function updateLineNumbers(content) {
    const lines = content.split('\n');
    const lineNumbersHTML = lines.map((_, index) => `<div>${index + 1}</div>`).join('');
    lineNumbers.innerHTML = lineNumbersHTML;
}
// Update cursor position and content as someone types
editor.addEventListener('input', () => {
    const content = editor.innerHTML;
    updateLineNumbers(content);

    const selection = window.getSelection();
    cursorPosition = {
        start: selection.anchorOffset,
        end: selection.focusOffset,
    };
    socket.emit('updateContent', { content, cursorPosition });
});

socket.on('updateContent', ({ content, cursorPosition }) => {
    editor.innerHTML = content;
    updateLineNumbers(content);

    setCursorPosition(cursorPosition);
});

function setCursorPosition(position) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    const textNode = editor.firstChild;
    range.setStart(textNode, position.start);
    range.setEnd(textNode, position.end);
    selection.addRange(range);
}

// Update text input as someone types
editor.addEventListener('input', () => {
    const text = editor.innerHTML;
    socket.emit('updateTextInput', text);
});

socket.on('updateTextInput', (text) => {
    editor.innerHTML = text;
});

function sendText() {
    const text = editor.innerHTML;
    socket.emit('sendText', text);
    editor.innerHTML = '';
}
