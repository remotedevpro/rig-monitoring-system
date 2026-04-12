// 🔥 Frontend: Real-time Drilling Data Dashboard (SCADA-style)
// This script connects to the backend via Socket.IO to receive real-time drilling data updates.
// It updates the UI immediately upon receiving new data and also has a SCADA-style refresh cycle every 5 seconds.
// Author: NURAB Systems


// Initiate connection  to the backend server via  websocket framework :  Socket.IO
const socket = io("http://localhost:5000");


// Confirms 🔌 Connection established
socket.on("connect",() => {
    console.log("✅ Connected:", socket.id);
});

// prepare to receive and store latest data  from backend for delivery to frontend in SCADA-style refresh manner
    let latestData = {
        depth: 0,
        rpm: 0,
        hookload: 0,
        pressure: 0
    };

    // 🔥 Using an arrow function, Receive real-time data (store only, DO NOT update UI immediately)
    // the arrow function works as follows:
    // 
    socket.on("rigDataUpdate", (data) => {
        console.log("📡 Received:", data);
        latestData = data;

        // Optionally, update the UI immediately
         // 🔥 Instant update (critical)
         // ensures operators see the latest data without waiting for the 5-second refresh to avoid missing critical changes
         //this ensures the data pipeline is engaged and  ready to push the latest data without waiting for the 5-second refresh, which is crucial for monitoring critical parameters in real-time.
        updateUI(data);
    });



    // 🔁 Update UI every 5 seconds (SCADA-style refresh cycle)
    setInterval(() => {
        updateUI(latestData);
    }, 5000);

    function updateUI(data) {
        updateField("depth", data.depth);
        updateField("rpm", data.rpm);
        updateField("hookload", data.hookload);
        updateField("pressure", data.pressure);
    }

    function updateField(id, value) {
        const el = document.getElementById(id);

        el.innerText = value;

        // Add highlight effect
        el.classList.add("updated");

        setTimeout(() => {
            el.classList.remove("updated");
        }, 1000);
    }

