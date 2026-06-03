export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl border shadow-sm">
        <h2 className="text-2xl font-bold text-center text-gray-900">Iniciar Sesión</h2>
        <p className="text-center text-gray-500">Ingresa a tu cuenta para continuar</p>
        <div className="space-y-4 mt-6">
          <div className="p-4 border rounded-lg bg-gray-50 text-sm text-gray-600 text-center">
            Formulario de inicio de sesión pendiente
          </div>
        </div>
      </div>
    </div>
  );
}
