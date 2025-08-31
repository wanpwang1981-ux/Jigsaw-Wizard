import os
from flask import Flask, request, render_template, jsonify
from PIL import Image
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
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            img = Image.open(filepath)
            width, height = img.size
            piece_width = width // 3
            piece_height = height // 3
            pieces = []

            for i in range(3):
                for j in range(3):
                    box = (j * piece_width, i * piece_height, (j + 1) * piece_width, (i + 1) * piece_height)
                    piece = img.crop(box)
                    piece_filename = f'piece_{i}_{j}_{filename}'
                    piece_path = os.path.join(app.config['UPLOAD_FOLDER'], piece_filename)
                    piece.save(piece_path)
                    pieces.append(f'/{piece_path}')

            return jsonify({'pieces': pieces})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
