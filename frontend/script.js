// 🔥 Frontend: Real-time Drilling Data Dashboard (SCADA-style)
// This script connects to the backend via Socket.IO to receive real-time drilling data updates.
// It updates the UI immediately upon receiving new data and also has a SCADA-style refresh cycle every 5 seconds.
// Author: NURAB Systems



// Page loads → fetch last data → display immediately.....



// Initiate connection  to the backend server via  websocket framework :  Socket.IO
// 1️⃣ Connect socket
// This allows for real-time, bidirectional communication between the frontend and backend, enabling instant updates of drilling data on the dashboard without needing to refresh the page.
const socket = io("http://localhost:5000");

// KEEP A GLOBAL DATA STORE
// 2️⃣ Global data store (VERY IMPORTANT)
// prepare to receive and store latest data  from backend for delivery to frontend in SCADA-style refresh manner
    let latestData = {
        depth: 0,
        rpm: 0,
        hookload: 0,
        pressure: 0
    };

// Confirms 🔌 Connection established
// 3️⃣ Confirm connection
socket.on("connect",() => {
    console.log("✅ Connected:", socket.id);
});


    // 4️⃣ Receive real-time data
    // 🔥 Receive real-time data (store only, update UI)
    // 🔥 Using an arrow function, Receive real-time data (store only,  update UI)
    // the arrow function works as follows:
        socket.on("rigDataUpdate", (data) => {
        console.log("📡 Received:", data);
        latestData = data;

        // Optionally, update the UI immediately
         // 🔥 Instant update (critical)
         // ensures operators see the latest data without waiting for the 5-second refresh to avoid missing critical changes
         //this ensures the data pipeline is engaged and  ready to push the latest data without waiting for the 5-second refresh, which is crucial for monitoring critical parameters in real-time.
        // 🔥 OPTIONAL (instant feedback)
        updateUI(latestData); 
    });

    // 5️⃣ 🔥 FETCH LAST SAVED DATA (PUT IT HERE)
    // 🔥 Fetch last saved data on page load (CRITICAL)
    // This fetches the most recent drilling data from the backend when the page loads, ensuring that the dashboard starts with the latest available information. It prevents the UI from displaying empty or default values and provides immediate context to operators as soon as they access the dashboard.
    // 🔥 Using an arrow function, Fetch last saved data on page load (CRITICAL)
    fetch("http://localhost:5000/api/rig-data")
    .then(res => res.json())
    .then(data => {
        if (data.length > 0) {
            latestData = data[0];
            updateUI(latestData);
        }
    })
    .catch(err => console.error("Fetch error:", err));

    // 6️⃣ SCADA refresh loop
    // 🔁 SCADA-STYLE REFRESH CYCLE or LOOP (CRITICAL)
    // 🔁 Update UI every 5 seconds (SCADA-style refresh cycle)
    setInterval(() => {
        console.log("🔁 Refreshing UI...");
        updateUI(latestData);
    }, 5000);

    // 7️⃣ UI update functions
    // 🔥 UI update functions (CRITICAL)
    // ENSURE updateUI NEVER CLEARS VALUES
    // 🔥 Update UI function (CRITICAL)
    // This function updates the UI with the latest data. It ensures that if any field is missing or null, it retains the previous value instead of clearing it.
    // This is crucial for maintaining a consistent and reliable display of data, especially in a SCADA-style dashboard where operators rely on continuous visibility of parameters.
    // The function checks each field in the incoming data and only updates the UI if the value is valid (not null or undefined). If a field is missing, it keeps the existing value on the dashboard, preventing any confusion or loss of critical information.
    function updateUI(data) {
        updateField("depth", data.depth);
        updateField("rpm", data.rpm);
        updateField("hookload", data.hookload);
        updateField("pressure", data.pressure);
    }

    // Helper function to update individual fields with validation
    function updateField(id, value) {
    const el = document.getElementById(id);

    // 🔥 Only update if value is valid
    if (value !== undefined && value !== null) {
        el.innerText = value;

        // Highlight effect
        el.classList.add("updated");

        setTimeout(() => {
            el.classList.remove("updated");
        }, 1000);
    }
} // End of updateField function
