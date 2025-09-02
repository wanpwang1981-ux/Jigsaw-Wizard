import os
import math
import random
from flask import Flask, request, render_template, jsonify, url_for
from PIL import Image, ImageDraw
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': '沒有檔案部分'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未選擇檔案'}), 400

    if file:
        try:
            piece_count = int(request.form.get('piece_count', 9))
            cols = int(math.sqrt(piece_count))
            if cols * cols != piece_count:
                return jsonify({'error': '不支援的拼圖數量'}), 400

            original_img = Image.open(file.stream)
            img_width, img_height = original_img.size
            piece_width = img_width // cols
            piece_height = img_height // cols

            # To ensure the image is usable, convert to RGBA
            img = original_img.convert('RGBA')

            filename_base = str(uuid.uuid4())
            pieces_data = []

            generated_pieces = create_jigsaw_pieces(img, cols)

            for i in range(cols):
                for j in range(cols):
                    piece_img = generated_pieces[i * cols + j]

                    piece_filename = f'piece_{i}_{j}_{filename_base}.png'
                    piece_path = os.path.join(app.config['UPLOAD_FOLDER'], piece_filename)
                    piece_img.save(piece_path, 'PNG')

                    piece_id = f'{i}-{j}'
                    piece_url = url_for('static', filename=f'uploads/{piece_filename}')
                    pieces_data.append({'id': piece_id, 'src': piece_url})

            return jsonify({'pieces': pieces_data, 'cols': cols})

        except Exception as e:
            # Log the exception e for debugging
            print(f"An error occurred: {e}")
            return jsonify({'error': '處理圖片時發生錯誤: ' + str(e)}), 500

def create_jigsaw_pieces(img, cols):
    img_width, img_height = img.size
    piece_width = img_width // cols
    piece_height = img_height // cols

    # Constants for edge types
    FLAT = 0
    TAB = 1
    BLANK = 2

    # Helper to get an opposite edge
    opposite = {FLAT: FLAT, TAB: BLANK, BLANK: TAB}

    # Store the edge shapes for each piece
    edge_shapes = {} # (row, col) -> [top, right, bottom, left]

    for row in range(cols):
        for col in range(cols):
            # Determine top edge
            if row == 0:
                top = FLAT
            else:
                top = opposite[edge_shapes[(row - 1, col)][2]] # Opposite of piece above's bottom

            # Determine left edge
            if col == 0:
                left = FLAT
            else:
                left = opposite[edge_shapes[(row, col - 1)][1]] # Opposite of piece to the left's right

            # Determine right edge
            if col == cols - 1:
                right = FLAT
            else:
                right = random.choice([TAB, BLANK])

            # Determine bottom edge
            if row == cols - 1:
                bottom = FLAT
            else:
                bottom = random.choice([TAB, BLANK])

            edge_shapes[(row, col)] = [top, right, bottom, left]

    pieces = []
    for row in range(cols):
        for col in range(cols):
            shapes = edge_shapes[(row, col)]

            # Crop the rectangular piece from the main image
            box = (col * piece_width, row * piece_height, (col + 1) * piece_width, (row + 1) * piece_height)
            piece_image = img.crop(box)

            # Create a mask for the piece
            mask = Image.new('L', (piece_width, piece_height), 0)
            draw = ImageDraw.Draw(mask)

            # Draw the main rectangle
            draw.rectangle([(0, 0), (piece_width, piece_height)], fill=255)

            # Parameters for tab shape
            tab_depth = piece_height // 4

            # Draw tabs or blanks
            if shapes[0] != FLAT: # Top
                poly = [(piece_width/2 - tab_depth, 0), (piece_width/2 - tab_depth, tab_depth), (piece_width/2 + tab_depth, tab_depth), (piece_width/2 + tab_depth, 0)]
                draw.polygon(poly, fill=255 if shapes[0] == TAB else 0)
            if shapes[1] != FLAT: # Right
                poly = [(piece_width, piece_height/2 - tab_depth), (piece_width-tab_depth, piece_height/2 - tab_depth), (piece_width-tab_depth, piece_height/2 + tab_depth), (piece_width, piece_height/2 + tab_depth)]
                draw.polygon(poly, fill=255 if shapes[1] == TAB else 0)
            if shapes[2] != FLAT: # Bottom
                poly = [(piece_width/2 - tab_depth, piece_height), (piece_width/2 - tab_depth, piece_height-tab_depth), (piece_width/2 + tab_depth, piece_height-tab_depth), (piece_width/2 + tab_depth, piece_height)]
                draw.polygon(poly, fill=255 if shapes[2] == TAB else 0)
            if shapes[3] != FLAT: # Left
                poly = [(0, piece_height/2 - tab_depth), (tab_depth, piece_height/2 - tab_depth), (tab_depth, piece_height/2 + tab_depth), (0, piece_height/2 + tab_depth)]
                draw.polygon(poly, fill=255 if shapes[3] == TAB else 0)

            # Create a new image with transparency for the final piece
            final_piece = Image.new('RGBA', (piece_width, piece_height))
            final_piece.paste(piece_image, (0, 0), mask)
            pieces.append(final_piece)

    return pieces

if __name__ == '__main__':
    app.run(debug=True)
