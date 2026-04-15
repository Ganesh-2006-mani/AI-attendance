let myChart = null;

async function processAttendance() {
    const total = document.getElementById('total').value;
    const attended = document.getElementById('attended').value;
    const future = document.getElementById('upcoming').value;

    if (!total || !attended) return alert("Please fill inputs");

    // Fetch prediction from Flask Backend
    const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total, attended, future })
    });
    const data = await response.json();

    // UI Updates
    const currentPct = ((attended / total) * 100).toFixed(2);
    document.getElementById('predictionText').innerHTML = 
        `Current: ${currentPct}% | Predicted: ${data.predicted_pct}% <br> <span class="warning">${data.warning}</span>`;
    document.getElementById('decisionText').innerText = data.decision;

    saveHistory(currentPct);
    updateDashboard();
}

function saveHistory(pct) {
    let history = JSON.parse(localStorage.getItem('attHistory')) || [];
    history.push({ date: new Date().toLocaleDateString(), percentage: pct });
    if (history.length > 10) history.shift(); // Keep last 10
    localStorage.setItem('attHistory', JSON.stringify(history));
}

function detectPattern(history) {
    if (history.length < 4) return "Need more data for pattern detection...";
    const lastFour = history.slice(-4).map(h => parseFloat(h.percentage));
    
    let inc = 0, dec = 0;
    for(let i=1; i<4; i++) {
        if(lastFour[i] > lastFour[i-1]) inc++;
        if(lastFour[i] < lastFour[i-1]) dec++;
    }

    if (inc === 3) return "Trend: Consistently Increasing! 📈";
    if (dec === 3) return "Trend: Consistently Decreasing! 📉";
    return "Trend: Stable Pattern.";
}

function updateDashboard() {
    const history = JSON.parse(localStorage.getItem('attHistory')) || [];
    document.getElementById('patternText').innerText = detectPattern(history);

    const ctx = document.getElementById('historyChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => h.date),
            datasets: [{
                label: 'Attendance % History',
                data: history.map(h => h.percentage),
                borderColor: '#2ecc71',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(46, 204, 113, 0.1)'
            }]
        },
        options: { scales: { y: { min: 0, max: 100 } } }
    });
}

// Load chart on startup
window.onload = updateDashboard;
