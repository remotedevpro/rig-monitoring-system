const socket = io("http://localhost:5000");

    socket.on("connect", () => {
        console.log("Connected:", socket.id);
    });

    socket.on("rigDataUpdate", (data) => {
        console.log("Live Data:", data);

        document.getElementById("depth").innerText = data.depth;
        document.getElementById("rpm").innerText = data.rpm;
        document.getElementById("hookload").innerText = data.hookload;
        document.getElementById("pressure").innerText = data.pressure;
    });
