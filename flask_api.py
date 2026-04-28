from flask import Flask, request, jsonify
import random

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'ML Flask API is running!'})

@app.route('/predict-soil', methods=['POST'])
def predict_soil():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Extract features
    ph = float(data.get('ph', 0))
    nitrogen = float(data.get('nitrogen', 0))
    phosphorus = float(data.get('phosphorus', 0))
    potassium = float(data.get('potassium', 0))
    
    # Mock ML logic (replace with your trained model inference later)
    # e.g., model.predict(...)
    if 6.0 <= ph <= 7.5 and nitrogen > 50 and phosphorus > 30 and potassium > 30:
        prediction = 'High'
    elif ph < 5.5 or ph > 8.0:
        prediction = 'Low'
    else:
        prediction = 'Medium'
        
    return jsonify({
        'prediction': prediction,
        'confidence': round(random.uniform(0.7, 0.98), 2)
    })

@app.route('/predict-disease', methods=['POST'])
def predict_disease():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty file'}), 400
    
    # Mock ML logic for disease (replace with your CNN inference later)
    # e.g., image = load_img(file); model.predict(image)...
    diseases = ['Healthy', 'Leaf Blight', 'Rust', 'Powdery Mildew']
    weights = [0.6, 0.15, 0.15, 0.1]
    
    prediction = random.choices(diseases, weights=weights, k=1)[0]
    confidence = round(random.uniform(0.85, 0.99), 2)
    
    return jsonify({
        'prediction': prediction,
        'confidence': confidence
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
