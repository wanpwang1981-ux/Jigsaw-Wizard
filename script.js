document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const imageLoader = document.getElementById('imageLoader');
    const startCameraBtn = document.getElementById('startCamera');
    const cameraContainer = document.getElementById('camera-container');
    const cameraVideo = document.getElementById('camera-video');
    const captureBtn = document.getElementById('captureBtn');
    const cancelCameraBtn = document.getElementById('cancelCamera');
    const difficultySelector = document.getElementById('difficultySelector');
    const gameCanvas = document.getElementById('game-canvas');
    const gameCtx = gameCanvas.getContext('2d');
    const originalCanvas = document.getElementById('original-canvas');
    const winMessage = document.getElementById('win-message');
    const playAgainBtn = document.getElementById('play-again');
    const resetBtn = document.getElementById('resetBtn');
    const solveBtn = document.getElementById('solveBtn');
    const muteBtn = document.getElementById('muteBtn');

    // Audio elements
    const bgMusic = document.getElementById('bgMusic');
    const pickupSound = document.getElementById('pickupSound');
    const dropSound = document.getElementById('dropSound');
    const winSound = document.getElementById('winSound');

    const originalCtx = originalCanvas.getContext('2d');
    let pieces = [];
    let puzzleSize = 3; // 3x3 grid
    let pieceWidth, pieceHeight;
    let draggedPiece = null;
    let stream = null;
    let isMuted = false;
    let animationFrameId = null;
    let selectedPiece = null;
    let offsetX, offsetY;

    class PuzzlePiece {
        constructor(x, y, width, height) {
            this.x = x; // Grid position, not pixel
            this.y = y;
            this.width = width;
            this.height = height;
            this.sourceX = this.x * this.width;
            this.sourceY = this.y * this.height;
            this.finalX = this.sourceX; // Correct final position
            this.finalY = this.sourceY;

            // Random initial position
            this.currentX = Math.random() * (gameCanvas.width - this.width);
            this.currentY = Math.random() * (gameCanvas.height - this.height);
            this.isSnapped = false;

            // Shape properties to be set later
            this.topTab = null;
            this.rightTab = null;
            this.bottomTab = null;
            this.leftTab = null;
            this.shapePath = null;
        }

        draw(ctx, image) {
            ctx.save();
            ctx.translate(this.currentX, this.currentY);
            if (this.shapePath) {
                ctx.clip(this.shapePath);
            }
            ctx.drawImage(
                image,
                this.sourceX, this.sourceY, this.width, this.height,
                0, 0, this.width, this.height // Draw at the new (0,0)
            );
            ctx.restore();

            // Draw border for debugging
            ctx.save();
            ctx.translate(this.currentX, this.currentY);
            ctx.stroke(this.shapePath);
            ctx.restore();
        }

        isPointInPath(ctx, x, y) {
            // To check against a path at (0,0), we must check the point relative to the piece's position
            if (!this.shapePath) return false;
            return ctx.isPointInPath(this.shapePath, x - this.currentX, y - this.currentY);
        }
    }

    function generatePuzzleShapes() {
        // Determine tab shapes for each piece
        for (let y = 0; y < puzzleSize; y++) {
            for (let x = 0; x < puzzleSize; x++) {
                const piece = pieces[y * puzzleSize + x];

                // Top tab
                if (y === 0) piece.topTab = 0;
                else piece.topTab = -pieces[(y - 1) * puzzleSize + x].bottomTab;

                // Right tab
                if (x === puzzleSize - 1) piece.rightTab = 0;
                else piece.rightTab = Math.random() < 0.5 ? 1 : -1;

                // Bottom tab
                if (y === puzzleSize - 1) piece.bottomTab = 0;
                else piece.bottomTab = Math.random() < 0.5 ? 1 : -1;

                // Left tab
                if (x === 0) piece.leftTab = 0;
                else piece.leftTab = -pieces[y * puzzleSize + (x - 1)].rightTab;
            }
        }

        // Create the path for each piece
        pieces.forEach(p => {
            p.shapePath = createPiecePath(p);
        });
    }

    function createPiecePath(piece) {
        const path = new Path2D();
        const { width, height, topTab, rightTab, bottomTab, leftTab } = piece;
        const tabSize = Math.min(width, height) * 0.2;

        // Start at top-left corner
        path.moveTo(0, 0);

        // Top side
        if (topTab !== 0) {
            path.lineTo(width * 0.35, 0);
            path.bezierCurveTo(
                width * 0.15, -tabSize * topTab,
                width * 0.65, -tabSize * topTab,
                width * 0.65, 0
            );
            path.lineTo(width, 0);
        } else {
            path.lineTo(width, 0);
        }

        // Right side
        if (rightTab !== 0) {
            path.lineTo(width, height * 0.35);
            path.bezierCurveTo(
                width - tabSize * rightTab, height * 0.15,
                width - tabSize * rightTab, height * 0.65,
                width, height * 0.65
            );
            path.lineTo(width, height);
        } else {
            path.lineTo(width, height);
        }

        // Bottom side
        if (bottomTab !== 0) {
            path.lineTo(width * 0.65, height);
            path.bezierCurveTo(
                width * 0.65, height - tabSize * bottomTab,
                width * 0.15, height - tabSize * bottomTab,
                width * 0.35, height
            );
            path.lineTo(0, height);
        } else {
            path.lineTo(0, height);
        }

        // Left side
        if (leftTab !== 0) {
            path.lineTo(0, height * 0.65);
             path.bezierCurveTo(
                -tabSize * leftTab, height * 0.65,
                -tabSize * leftTab, height * 0.15,
                0, height * 0.35
            );
            path.lineTo(0, 0);
        } else {
            path.lineTo(0, 0);
        }

        path.closePath();
        return path;
    }

    // --- Audio Functions ---
    function playSound(sound) {
        if (isMuted) return;
        sound.currentTime = 0; // Rewind to start
        sound.play().catch(e => console.log("Audio play failed:", e)); // Autoplay policy might prevent this
    }

    function toggleMute() {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        pickupSound.muted = isMuted;
        dropSound.muted = isMuted;
        winSound.muted = isMuted;
        muteBtn.textContent = isMuted ? '取消靜音' : '靜音';
    }

    // --- Event Listeners ---
    muteBtn.addEventListener('click', toggleMute);
    solveBtn.addEventListener('click', solvePuzzle);
    imageLoader.addEventListener('change', handleImageUpload);
    startCameraBtn.addEventListener('click', startCamera);
    cancelCameraBtn.addEventListener('click', stopCamera);
    captureBtn.addEventListener('click', capturePhoto);
    playAgainBtn.addEventListener('click', resetGame);
    resetBtn.addEventListener('click', resetGame);

    // Canvas Mouse Events
    gameCanvas.addEventListener('mousedown', onMouseDown);
    gameCanvas.addEventListener('mousemove', onMouseMove);
    gameCanvas.addEventListener('mouseup', onMouseUp);

    function onMouseDown(e) {
        const rect = gameCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Iterate backwards to select the top-most piece
        for (let i = pieces.length - 1; i >= 0; i--) {
            if (pieces[i].isPointInPath(gameCtx, mouseX, mouseY) && !pieces[i].isSnapped) {
                selectedPiece = pieces[i];
                offsetX = mouseX - selectedPiece.currentX;
                offsetY = mouseY - selectedPiece.currentY;

                // Move selected piece to the end of the array to draw it on top
                pieces.push(pieces.splice(i, 1)[0]);

                playSound(pickupSound);
                break;
            }
        }
    }
    function onMouseMove(e) {
        if (selectedPiece) {
            const rect = gameCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            selectedPiece.currentX = mouseX - offsetX;
            selectedPiece.currentY = mouseY - offsetY;
        }
    }
    function onMouseUp(e) {
        if (selectedPiece) {
            playSound(dropSound);

            const snapThreshold = 20; // pixels
            const dx = Math.abs(selectedPiece.currentX - selectedPiece.finalX);
            const dy = Math.abs(selectedPiece.currentY - selectedPiece.finalY);

            if (dx < snapThreshold && dy < snapThreshold) {
                selectedPiece.currentX = selectedPiece.finalX;
                selectedPiece.currentY = selectedPiece.finalY;
                selectedPiece.isSnapped = true;
                checkWinCondition(); // Check if the game is won
            }

            selectedPiece = null;
        }
    }

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
        // Read puzzle size from the difficulty selector
        puzzleSize = parseInt(difficultySelector.value, 10);
        playSound(bgMusic);

        // 設置畫布尺寸
        const maxDisplayWidth = 600;
        const aspectRatio = img.width / img.height;
        originalCanvas.width = Math.min(img.width, maxDisplayWidth);
        originalCanvas.height = originalCanvas.width / aspectRatio;
        originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);

        gameCanvas.width = originalCanvas.width;
        gameCanvas.height = originalCanvas.height;

        // NEW LOGIC STARTS HERE
        pieces = [];
        pieceWidth = gameCanvas.width / puzzleSize;
        pieceHeight = gameCanvas.height / puzzleSize;

        for (let y = 0; y < puzzleSize; y++) {
            for (let x = 0; x < puzzleSize; x++) {
                const piece = new PuzzlePiece(x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight);
                pieces.push(piece);
            }
        }

        generatePuzzleShapes();

        animationFrameId = requestAnimationFrame(update);
        // NEW LOGIC ENDS HERE

        document.querySelector('.controls').classList.add('hidden');
        resetBtn.classList.remove('hidden');
        solveBtn.classList.remove('hidden');
    }

    function sliceAndShuffle() {
        // This function will be re-written for canvas rendering
    }

    // --- Drag and Drop Logic (To be re-written for canvas) ---
    function addDragAndDropHandlers(elem) {}
    function handleDragStart(e) {}
    function handleDragOver(e) {}
    function handleDrop(e) {}
    function handleDragEnd(e) {}
    function swapElements(elem1, elem2) {}

    // --- Win Condition ---
    function checkWinCondition() {
        const allSnapped = pieces.every(p => p.isSnapped);
        if (allSnapped && pieces.length > 0) {
             bgMusic.pause();
             playSound(winSound);
             winMessage.classList.remove('hidden');
        }
    }

    function update() {
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        pieces.forEach(piece => {
            piece.draw(gameCtx, originalCanvas); // We use originalCanvas as the image source
        });

        animationFrameId = requestAnimationFrame(update);
    }

    // --- Reset Game ---
    function resetGame() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        winMessage.classList.add('hidden');
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height); // Clear the main canvas
        originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        document.querySelector('.controls').classList.remove('hidden');
        imageLoader.value = ''; // Reset file input
        resetBtn.classList.add('hidden');
        solveBtn.classList.add('hidden');
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    function solvePuzzle() {
        // This function will be re-written for canvas rendering
    }
});
