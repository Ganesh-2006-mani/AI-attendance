from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

@app.route('/predict', method=['POST'])
def predict():
    data = request.json
    total = int(data.get('total'))
    attended = int(data.get('attended'))
    future = int(data.get('future'))

    # 1. Simple Linear Regression Model
    # Training on current state to project future
    X = np.array([[total]]) 
    y = np.array([attended])
    model = LinearRegression().fit(X, y)
    
    # Predict future attendance if current ratio continues
    future_total = total + future
    predicted_attended = model.predict([[future_total]])[0]
    predicted_pct = (predicted_attended / future_total) * 100

    # 2. Decision Logic
    current_pct = (attended / total) * 100
    decision = ""
    warning = ""

    if current_pct < 75:
        # Formula: (attended + x) / (total + x) = 0.75
        # x = (0.75 * total - attended) / (1 - 0.75)
        needed = int(np.ceil((0.75 * total - attended) / 0.25))
        decision = f"You need to attend {max(0, needed)} more classes consecutively to reach 75%."
    else:
        # Formula: attended / (total + x) = 0.75
        # x = (attended / 0.75) - total
        can_skip = int(np.floor((attended / 0.75) - total))
        decision = f"You can safely bunk {max(0, can_skip)} classes."

    if predicted_pct < 75:
        warning = "WARNING: Your predicted future attendance falls below 75%!"

    return jsonify({
        "predicted_pct": round(predicted_pct, 2),
        "decision": decision,
        "warning": warning
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
