const DataCard = ({ title, value, unit }) => {
  return (
    <div className="bg-gray-900 border border-green-500 p-6 rounded-xl shadow-lg transition hover:scale-105">
      <h2 className="text-gray-400">{title}</h2>
      <p className="text-3xl font-bold text-green-400 mt-2">
        {value} <span className="text-sm">{unit}</span>
      </p>
    </div>
  );
};

export default DataCard;