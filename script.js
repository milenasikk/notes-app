const { ipcRenderer } = require('electron');

const shrinkBtn = document.querySelector('.shrink');
const closeBtn = document.querySelector('.close');

shrinkBtn.addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

closeBtn.addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

const newFile = document.querySelector('.btn1');
const saveFile = document.querySelector('.btn2');
const deleteFile = document.querySelector('.btn3');
const savedNotes = document.querySelector('.btn4');
const textarea = document.querySelector('.user-input');

const listContainer = document.querySelector('.notes-list-container');
const listContent = document.querySelector('.notes-list-content');
const closeListBtn = document.querySelector('.close-list-btn');
const searchInput = document.querySelector('.search-input');

let selectedNoteIndex = null;

const savedText = localStorage.getItem('pixel_note_text');
const savedIndex = localStorage.getItem('pixel_note_index');

if (savedText) {
    textarea.value = savedText;
}
if (savedIndex !== null) {
    selectedNoteIndex = parseInt(savedIndex, 10);
}

newFile.addEventListener('click', () => {
    textarea.value = '';
    selectedNoteIndex = null;
    localStorage.removeItem('pixel_note_text');
    localStorage.removeItem('pixel_note_index');
    listContainer.style.display = 'none';
    textarea.style.display = 'block';
});

saveFile.addEventListener('click', () => {
    const textToSave = textarea.value.trim();
    if (!textToSave) return;

    let allNotes = JSON.parse(localStorage.getItem('pixel_notes_list')) || [];

    if (selectedNoteIndex !== null && selectedNoteIndex >= 0 && selectedNoteIndex < allNotes.length) {
        allNotes[selectedNoteIndex] = textToSave;
    } else {
        allNotes.push(textToSave);
        selectedNoteIndex = allNotes.length - 1;
    }

    localStorage.setItem('pixel_notes_list', JSON.stringify(allNotes));
    localStorage.setItem('pixel_note_text', textToSave);
    localStorage.setItem('pixel_note_index', selectedNoteIndex);
});

deleteFile.addEventListener('click', () => {
    let allNotes = JSON.parse(localStorage.getItem('pixel_notes_list')) || [];

    if (listContainer.style.display === 'flex' && selectedNoteIndex !== null) {
        if (confirm('Are you sure you want to delete this note?')) {
            allNotes.splice(selectedNoteIndex, 1);
            localStorage.setItem('pixel_notes_list', JSON.stringify(allNotes));
            localStorage.removeItem('pixel_note_text');
            localStorage.removeItem('pixel_note_index');
            textarea.value = '';
            selectedNoteIndex = null;
            renderNotesList();
        }
    } else {
        if (textarea.value.trim() !== '') {
            if (confirm('Are you sure you want to clear current text?')) {
                if (selectedNoteIndex !== null) {
                    allNotes.splice(selectedNoteIndex, 1);
                    localStorage.setItem('pixel_notes_list', JSON.stringify(allNotes));
                }
                localStorage.removeItem('pixel_note_text');
                localStorage.removeItem('pixel_note_index');
                textarea.value = '';
                selectedNoteIndex = null;
            }
        }
    }
});

function renderNotesList() {
    const allNotes = JSON.parse(localStorage.getItem('pixel_notes_list')) || [];
    const query = searchInput.value.toLowerCase().trim();
    listContent.innerHTML = '';

    const filteredNotes = allNotes
        .map((noteText, originalIndex) => ({ noteText, originalIndex }))
        .filter(item => item.noteText.toLowerCase().includes(query));

    if (filteredNotes.length === 0) {
        listContent.innerHTML = '<p style="text-align:center; opacity:0.5;">No notes found...</p>';
    } else {
        filteredNotes.forEach((item) => {
            const noteItem = document.createElement('div');
            noteItem.classList.add('note-item');
            
            if (item.originalIndex === selectedNoteIndex) {
                noteItem.classList.add('active-note');
            }

            const preview = item.noteText.length > 25 ? item.noteText.substring(0, 25) + '...' : item.noteText;
            noteItem.textContent = `${item.originalIndex + 1}. ${preview}`;
            
            noteItem.addEventListener('click', (e) => {
                e.stopPropagation();
                const items = listContent.querySelectorAll('.note-item');
                items.forEach(el => el.classList.remove('active-note'));
                noteItem.classList.add('active-note');
                selectedNoteIndex = item.originalIndex;
                localStorage.setItem('pixel_note_index', selectedNoteIndex);
            });

            noteItem.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                textarea.value = item.noteText;
                selectedNoteIndex = item.originalIndex;
                localStorage.setItem('pixel_note_text', item.noteText);
                localStorage.setItem('pixel_note_index', selectedNoteIndex);
                listContainer.style.display = 'none';
                textarea.style.display = 'block';
            });
            listContent.appendChild(noteItem);
        });
    }
}

searchInput.addEventListener('input', renderNotesList);

savedNotes.addEventListener('click', () => {
    renderNotesList();
    textarea.style.display = 'none';
    listContainer.style.display = 'flex';
});

closeListBtn.addEventListener('click', () => {
    listContainer.style.display = 'none';
    textarea.style.display = 'block';
});