import { useEffect, useState } from "react";
import socket from "./socket";
import DataCard from "./components/DataCard.jsx";

function App() {
  const [data, setData] = useState({
    depth: 0,
    rpm: 0,
    hookload: 0,
    pressure: 0,
  });

  useEffect(() => {
    // ✅ Connect event
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    // ✅ Receive data
    socket.on("rigDataUpdate", (incomingData) => {
      console.log("📡 Received:", incomingData);
      setData(incomingData);
    });

    return () => {
      socket.off("rigDataUpdate");
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-green-400 p-8">
      <h1 className="text-3xl font-bold mb-8">
        🚀 Rig SCADA Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DataCard title="Depth" value={data.depth} unit="ft" />
        <DataCard title="RPM" value={data.rpm} unit="rpm" />
        <DataCard title="Hookload" value={data.hookload} unit="klbs" />
        <DataCard title="Pressure" value={data.pressure} unit="psi" />
      </div>
    </div>
  );
}

export default App;