export const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon size={16} className="text-gray-400" />
      </div>
      <input
        {...props}
        className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${error
            ? "border-red-400 bg-red-50 focus:ring-red-400"
            : "border-gray-300 bg-white hover:border-gray-400"
          }`}
      />
    </div>
    {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
  </div>
);