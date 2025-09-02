document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const pieceCountSelect = document.getElementById('piece-count');
    const puzzleContainer = document.getElementById('puzzle-container');
    const puzzleBoard = document.querySelector('.puzzle-grid');

    let draggedItem = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        if (fileInput.files.length === 0) {
            alert('請選擇要上傳的檔案。');
            return;
        }
        formData.append('file', fileInput.files[0]);
        formData.append('piece_count', pieceCountSelect.value);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('網路回應不正常');
            }

            const data = await response.json();

            if (data.error) {
                alert('錯誤: ' + data.error);
                return;
            }

            setupPuzzleBoard(data.cols);

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
            console.error('上傳檔案時發生錯誤:', error);
            alert('上傳檔案時發生錯誤。');
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

    function setupPuzzleBoard(cols) {
        puzzleBoard.innerHTML = ''; // Clear existing board
        puzzleBoard.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
        puzzleBoard.style.gridTemplateRows = `repeat(${cols}, 100px)`;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < cols; j++) {
                const slot = document.createElement('div');
                slot.classList.add('puzzle-slot');
                slot.dataset.id = `${i}-${j}`;
                puzzleBoard.appendChild(slot);
            }
        }
    }

    puzzleBoard.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.target.classList.contains('puzzle-slot')) {
            e.target.classList.add('over');
        }
    });

    puzzleBoard.addEventListener('dragleave', (e) => {
        if (e.target.classList.contains('puzzle-slot')) {
            e.target.classList.remove('over');
        }
    });

    puzzleBoard.addEventListener('drop', (e) => {
        e.preventDefault();
        const slot = e.target;
        if (slot.classList.contains('puzzle-slot')) {
            slot.classList.remove('over');
            if (draggedItem && !slot.hasChildNodes()) {
                if (slot.firstChild) {
                    puzzleContainer.appendChild(slot.firstChild);
                }
                slot.appendChild(draggedItem);

                if (checkWinCondition()) {
                    setTimeout(() => alert('恭喜！你完成了拼圖！'), 100);
                }
            }
        }
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
        const slots = puzzleBoard.querySelectorAll('.puzzle-slot');
        for (const slot of slots) {
            const piece = slot.querySelector('.puzzle-piece');
            if (!piece || piece.dataset.id !== slot.dataset.id) {
                return false; // Not solved
            }
        }
        return true; // All pieces are in the correct slots
    }
});
