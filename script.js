async function calculate() {
    let total = Number(document.getElementById("total").value);
    let attended = Number(document.getElementById("attended").value);
    let future = Number(document.getElementById("future").value);

    saveHistory(total, attended);

    let response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ total, attended, future })
    });

    let data = await response.json();

    document.getElementById("result").innerText =
        "Predicted Attendance: " + data.prediction + "%";

    document.getElementById("suggestion").innerText =
        data.decision;

    let history = loadHistory();
    document.getElementById("pattern").innerText =
        detectPattern(history);

    drawChart();
}

/* ---------------- HISTORY ---------------- */

function saveHistory(total, attended) {
    let history = JSON.parse(localStorage.getItem("attendanceHistory")) || [];

    history.push({
        date: new Date().toLocaleDateString(),
        percentage: ((attended / total) * 100).toFixed(2)
    });

    localStorage.setItem("attendanceHistory", JSON.stringify(history));
}

function loadHistory() {
    return JSON.parse(localStorage.getItem("attendanceHistory")) || [];
}

/* ---------------- PATTERN DETECTION ---------------- */

function detectPattern(history) {
    if (history.length < 4) return "Not enough data";

    let last = history.slice(-4);

    let trend =
        last[3].percentage - last[2].percentage +
        last[2].percentage - last[1].percentage +
        last[1].percentage - last[0].percentage;

    if (trend < 0) return "⚠️ Attendance declining";
    if (trend > 0) return "📈 Attendance improving";

    return "⚖️ Stable attendance";
}

/* ---------------- GRAPH ---------------- */

function drawChart() {
    let history = loadHistory();

    let labels = history.map(h => h.date);
    let data = history.map(h => h.percentage);

    const ctx = document.getElementById("chart").getContext("2d");

    if (window.chart) window.chart.destroy();

    window.chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Attendance %",
                data: data,
                tension: 0.3
            }]
        }
    });
}
