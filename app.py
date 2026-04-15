from flask import Flask, request, jsonify
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)

# Train model (simple but valid)
X = []
y = []

for total in range(50, 101, 5):
    for attended in range(30, total):
        X.append([total, attended])
        y.append((attended / total) * 100)

X = np.array(X)
y = np.array(y)

model = LinearRegression()
model.fit(X, y)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    total = int(data['total'])
    attended = int(data['attended'])
    future = int(data['future'])

    # Prediction
    future_pred = model.predict([[total + future, attended + future]])[0]

    required = 75
    current = (attended / total) * 100

    # DECISION SYSTEM
    if current < required:
        needed = 0
        while ((attended + needed) / (total + needed)) * 100 < required:
            needed += 1
        decision = f"❌ Attend next {needed} classes minimum"

    else:
        bunk = 0
        while ((attended) / (total + bunk)) * 100 >= required:
            bunk += 1
        decision = f"✅ You can bunk {bunk-1} classes safely"

    # Risk Warning
    if future_pred < required:
        decision += " ⚠️ Future risk detected!"

    return jsonify({
        "prediction": round(future_pred, 2),
        "decision": decision
    })


if __name__ == "__main__":
    app.run(debug=True)
