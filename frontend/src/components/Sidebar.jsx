const Sidebar = ({ items, active, onSelect }) => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">Exam System</h2>
      </div>
      <nav className="mt-6">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full text-left px-6 py-3 transition ${
              active === item.id
                ? 'bg-blue-600 border-l-4 border-blue-400'
                : 'hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
