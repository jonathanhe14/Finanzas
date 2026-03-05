export default function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-2xl">⚠</span>
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Error al cargar datos
          </h3>
          <p className="text-sm text-gray-500 max-w-md">{message}</p>
        </div>
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                     transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
