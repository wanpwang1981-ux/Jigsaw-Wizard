document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const puzzleContainer = document.getElementById('puzzle-container');
    const puzzleSlots = document.querySelectorAll('.puzzle-slot');

    let draggedItem = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        if (fileInput.files.length === 0) {
            alert('Please select a file to upload.');
            return;
        }
        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }

            puzzleContainer.innerHTML = ''; // Clear previous puzzle pieces

            // Shuffle pieces before displaying
            const shuffledPieces = data.pieces.sort(() => Math.random() - 0.5);

            shuffledPieces.forEach(pieceData => {
                const piece = document.createElement('img');
                piece.src = pieceData.src + '?t=' + new Date().getTime(); // Prevent caching
                piece.dataset.id = pieceData.id;
                piece.classList.add('puzzle-piece');
                piece.draggable = true;
                addDragEvents(piece);
                puzzleContainer.appendChild(piece);
            });

        } catch (error) {
            console.error('Error uploading file:', error);
            alert('An error occurred while uploading the file.');
        }
    });

    function addDragEvents(item) {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            setTimeout(() => {
                item.classList.add('dragging');
            }, 0);
        });

        item.addEventListener('dragend', () => {
            setTimeout(() => {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }, 0);
        });
    }

    puzzleSlots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('over');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('over');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('over');
            if (draggedItem && !slot.hasChildNodes()) {
                if (slot.firstChild) {
                    puzzleContainer.appendChild(slot.firstChild);
                }
                slot.appendChild(draggedItem);

                if (checkWinCondition()) {
                    setTimeout(() => alert('Congratulations! You solved the puzzle!'), 100);
                }
            }
        });
    });

    // Allow dropping pieces back into the container
    puzzleContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    puzzleContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem) {
            puzzleContainer.appendChild(draggedItem);
        }
    });

    function checkWinCondition() {
        let solved = true;
        puzzleSlots.forEach(slot => {
            const piece = slot.querySelector('.puzzle-piece');
            if (!piece || piece.dataset.id !== slot.dataset.id) {
                solved = false;
            }
        });
        return solved;
    }
});
