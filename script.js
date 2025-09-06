document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const imageLoader = document.getElementById('imageLoader');
    const startCameraBtn = document.getElementById('startCamera');
    const cameraContainer = document.getElementById('camera-container');
    const cameraVideo = document.getElementById('camera-video');
    const captureBtn = document.getElementById('captureBtn');
    const cancelCameraBtn = document.getElementById('cancelCamera');
    const puzzleContainer = document.getElementById('puzzle-container');
    const originalCanvas = document.getElementById('original-canvas');
    const winMessage = document.getElementById('win-message');
    const playAgainBtn = document.getElementById('play-again');

    const originalCtx = originalCanvas.getContext('2d');
    let pieces = [];
    let puzzleSize = 3; // 3x3 grid
    let pieceWidth, pieceHeight;
    let draggedPiece = null;
    let stream = null;

    // --- Event Listeners ---
    imageLoader.addEventListener('change', handleImageUpload);
    startCameraBtn.addEventListener('click', startCamera);
    cancelCameraBtn.addEventListener('click', stopCamera);
    captureBtn.addEventListener('click', capturePhoto);
    playAgainBtn.addEventListener('click', resetGame);

    // --- Image & Camera Handling ---
    function handleImageUpload(e) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                startGame(img);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraVideo.srcObject = stream;
            document.querySelector('.controls').classList.add('hidden');
            cameraContainer.classList.remove('hidden');
        } catch (err) {
            console.error("無法存取相機:", err);
            alert("無法存取相機，請確認已授權。");
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        cameraContainer.classList.add('hidden');
        document.querySelector('.controls').classList.remove('hidden');
    }

    function capturePhoto() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = cameraVideo.videoWidth;
        tempCanvas.height = cameraVideo.videoHeight;
        tempCtx.drawImage(cameraVideo, 0, 0, tempCanvas.width, tempCanvas.height);

        const img = new Image();
        img.onload = () => {
            startGame(img);
        };
        img.src = tempCanvas.toDataURL('image/jpeg');
        stopCamera();
    }

    // --- Game Logic ---
    function startGame(img) {
        // "智慧"切割邏輯：根據圖片長寬比調整網格
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 1.2) { // 寬圖
            puzzleSize = 4;
        } else if (aspectRatio < 0.8) { // 長圖
            puzzleSize = 3;
        } else { // 方形圖
            puzzleSize = 3;
        }
        // 為了簡化，我們先用固定的 3x3
        puzzleSize = 3;

        // 設置畫布尺寸
        const maxDisplayWidth = 600;
        originalCanvas.width = Math.min(img.width, maxDisplayWidth);
        originalCanvas.height = originalCanvas.width / aspectRatio;
        originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);

        puzzleContainer.style.width = `${originalCanvas.width}px`;
        puzzleContainer.style.height = `${originalCanvas.height}px`;

        sliceAndShuffle();
        document.querySelector('.controls').classList.add('hidden');
    }

    function sliceAndShuffle() {
        pieces = [];
        puzzleContainer.innerHTML = '';
        pieceWidth = originalCanvas.width / puzzleSize;
        pieceHeight = originalCanvas.height / puzzleSize;

        puzzleContainer.style.gridTemplateColumns = `repeat(${puzzleSize}, 1fr)`;
        puzzleContainer.style.gridTemplateRows = `repeat(${puzzleSize}, 1fr)`;

        for (let y = 0; y < puzzleSize; y++) {
            for (let x = 0; x < puzzleSize; x++) {
                const pieceCanvas = document.createElement('canvas');
                pieceCanvas.width = pieceWidth;
                pieceCanvas.height = pieceHeight;
                const pieceCtx = pieceCanvas.getContext('2d');

                pieceCtx.drawImage(
                    originalCanvas,
                    x * pieceWidth, y * pieceHeight, // Source x, y
                    pieceWidth, pieceHeight,          // Source width, height
                    0, 0,                             // Destination x, y
                    pieceWidth, pieceHeight           // Destination width, height
                );

                const piece = {
                    element: document.createElement('div'),
                    originalIndex: y * puzzleSize + x,
                    currentIndex: -1, // Will be set after shuffle
                };
                piece.element.classList.add('puzzle-piece');
                piece.element.style.width = `${pieceWidth}px`;
                piece.element.style.height = `${pieceHeight}px`;
                piece.element.style.backgroundImage = `url(${pieceCanvas.toDataURL()})`;
                piece.element.dataset.index = piece.originalIndex;

                addDragAndDropHandlers(piece.element);
                pieces.push(piece);
            }
        }

        // Shuffle and place on board
        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach((piece, index) => {
            piece.currentIndex = index;
            puzzleContainer.appendChild(piece.element);
        });
    }

    // --- Drag and Drop Logic ---
    function addDragAndDropHandlers(elem) {
        elem.draggable = true;
        elem.addEventListener('dragstart', handleDragStart);
        elem.addEventListener('dragover', handleDragOver);
        elem.addEventListener('drop', handleDrop);
        elem.addEventListener('dragend', handleDragEnd);
    }

    function handleDragStart(e) {
        draggedPiece = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    function handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        const target = e.target.closest('.puzzle-piece');
        if (target && target !== draggedPiece) {
             // 可選：增加視覺回饋
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const dropTarget = e.target.closest('.puzzle-piece');
        if (dropTarget && dropTarget !== draggedPiece) {
            swapElements(draggedPiece, dropTarget);
        }
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        checkWinCondition();
    }

    function swapElements(elem1, elem2) {
        const parent = elem1.parentNode;
        const afterElem2 = elem2.nextElementSibling;
        if(afterElem2 === elem1) {
            parent.insertBefore(elem1, elem2);
        } else {
            parent.insertBefore(elem2, elem1);
            if(afterElem2) {
                parent.insertBefore(elem1, afterElem2);
            } else {
                parent.appendChild(elem1);
            }
        }
    }

    // --- Win Condition ---
    function checkWinCondition() {
        const currentOrder = Array.from(puzzleContainer.children).map(elem => elem.dataset.index);
        const isWin = currentOrder.every((val, index) => parseInt(val) === index);

        if (isWin) {
            winMessage.classList.remove('hidden');
            puzzleContainer.style.border = "2px solid #4CAF50";
        }
    }

    // --- Reset Game ---
    function resetGame() {
        winMessage.classList.add('hidden');
        puzzleContainer.innerHTML = '';
        puzzleContainer.style.border = "2px solid #ccc";
        originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        document.querySelector('.controls').classList.remove('hidden');
        imageLoader.value = ''; // Reset file input
    }
});
