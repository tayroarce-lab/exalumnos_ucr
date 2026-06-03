export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel Principal</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <h3 className="font-medium text-gray-900">Resumen</h3>
          <p className="mt-2 text-sm text-gray-500">Aquí se mostrarán las estadísticas principales.</p>
        </div>
      </div>
    </div>
  );
}
