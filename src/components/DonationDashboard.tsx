'use client';

// =============================================================================
// COMPONENTE: DonationDashboard
// Descripción : Panel principal de donaciones para el exalumno. Divide
//               la vista en Formulario (sin <form>) e Historial.
// =============================================================================

import { useState, useEffect } from 'react';
import { Upload, DollarSign, Clock, CheckCircle, XCircle, ChevronDown, Activity, Info } from 'lucide-react';
import { crearDonacion, obtenerHistorialDonaciones, DatosDonacion, DonacionHistorial, EstadoDonacion } from '@/services/donationService';

// [VERDE - FUNCION: obtenerColorEstado]
const obtenerColorEstado = (estado: EstadoDonacion) => {
  switch (estado) {
    case 'pendiente': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'confirmada': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'rechazada': return 'bg-red-500/10 text-red-400 border-red-500/20';
  }
};

// [VERDE - FUNCION: DonationDashboard]
export default function DonationDashboard() {
  const [historial, setHistorial] = useState<DonacionHistorial[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  
  // Estado del formulario (Sin <form>)
  const [fondoGeneral, setFondoGeneral] = useState(true);
  const [proyectoId, setProyectoId] = useState('');
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState<'CRC' | 'USD'>('CRC');
  const [metodoPago, setMetodoPago] = useState<'SINPE' | 'Transferencia'>('SINPE');
  const [fechaTransferencia, setFechaTransferencia] = useState('');
  const [numeroReferencia, setNumeroReferencia] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  
  const [guardando, setGuardando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [exitoEnvio, setExitoEnvio] = useState(false);

  // [VERDE - FUNCION: cargarDatos]
  useEffect(() => {
    const cargarDatos = async () => {
      const data = await obtenerHistorialDonaciones();
      setHistorial(data);
      setCargandoHistorial(false);
    };
    cargarDatos();
  }, []);

  // [VERDE - FUNCION: manejarArchivo]
  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorEnvio('El archivo no debe superar los 5MB');
        return;
      }
      setArchivo(file);
      setErrorEnvio('');
    }
  };

  // [VERDE - FUNCION: enviarDonacion]
  const enviarDonacion = async () => {
    setErrorEnvio('');
    
    // Validaciones
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      setErrorEnvio('Ingrese un monto válido');
      return;
    }
    if (!fondoGeneral && !proyectoId) {
      setErrorEnvio('Seleccione un proyecto o Fondo General');
      return;
    }
    if (!fechaTransferencia) {
      setErrorEnvio('Seleccione la fecha y hora de la transferencia');
      return;
    }
    if (!archivo) {
      setErrorEnvio('El comprobante es obligatorio');
      return;
    }

    setGuardando(true);
    
    const datos: DatosDonacion = {
      fondo_general: fondoGeneral,
      proyecto_id: fondoGeneral ? undefined : proyectoId,
      monto: Number(monto),
      moneda,
      metodo_pago: metodoPago,
      fecha_transferencia: new Date(fechaTransferencia).toISOString(),
      numero_referencia: numeroReferencia,
      mensaje_estudiante: mensaje,
      comprobante: archivo
    };

    const respuesta = await crearDonacion(datos);
    
    if (respuesta.exito) {
      setExitoEnvio(true);
      // Limpiar formulario
      setMonto('');
      setNumeroReferencia('');
      setMensaje('');
      setArchivo(null);
      
      // Recargar historial
      const nuevoHistorial = await obtenerHistorialDonaciones();
      setHistorial(nuevoHistorial);
    } else {
      setErrorEnvio(respuesta.mensaje);
    }
    setGuardando(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Aportes y Donaciones</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Su contribución ayuda a estudiantes con beca socioeconómica a finalizar sus proyectos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECCIÓN 1: PANEL INTERACTIVO DE REGISTRO */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Registrar Donación
          </h2>

          {exitoEnvio && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Registro Exitoso</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Su donación está en estado pendiente. Recibirá confirmación en un máximo de 48 horas hábiles.
                </p>
                <button 
                  onClick={() => setExitoEnvio(false)}
                  className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Registrar otra donación
                </button>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Destino */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Destino</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={fondoGeneral} onChange={() => setFondoGeneral(true)} className="accent-emerald-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Fondo General</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!fondoGeneral} onChange={() => setFondoGeneral(false)} className="accent-emerald-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Proyecto Específico</span>
                </label>
              </div>
              {!fondoGeneral && (
                <input 
                  type="text" 
                  placeholder="ID del Proyecto..." 
                  value={proyectoId} 
                  onChange={e => setProyectoId(e.target.value)} 
                  className="mt-2 w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              )}
            </div>

            {/* Monto y Moneda */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monto</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={monto} 
                  onChange={e => setMonto(e.target.value)} 
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Moneda</label>
                <div className="relative">
                  <select 
                    value={moneda} 
                    onChange={e => setMoneda(e.target.value as 'CRC' | 'USD')} 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="CRC">CRC</option>
                    <option value="USD">USD</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Método y Fecha */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Método</label>
                <div className="relative">
                  <select 
                    value={metodoPago} 
                    onChange={e => setMetodoPago(e.target.value as 'SINPE' | 'Transferencia')} 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="SINPE">SINPE Móvil</option>
                    <option value="Transferencia">Transferencia IBAN</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fecha/Hora</label>
                <input 
                  type="datetime-local" 
                  value={fechaTransferencia} 
                  onChange={e => setFechaTransferencia(e.target.value)} 
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              </div>
            </div>

            {/* Instrucciones dinámicas */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Instrucciones</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {metodoPago === 'SINPE' 
                  ? 'Realice su SINPE al número 8888-8888 a nombre de Fundación Exalumnos UCR.' 
                  : 'Transfiera a la cuenta IBAN CR0000000000000000 a nombre de Fundación Exalumnos UCR.'}
              </p>
            </div>

            {/* Ref y Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Número Referencia (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ej: 12345678" 
                  value={numeroReferencia} 
                  onChange={e => setNumeroReferencia(e.target.value)} 
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  Comprobante
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">Obligatorio</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    onChange={manejarArchivo} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {archivo ? archivo.name : 'Click o arrastre el comprobante (Max 5MB)'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mensaje al Estudiante (Opcional)</label>
                <textarea 
                  rows={3} 
                  maxLength={300}
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                  placeholder="Unas palabras de apoyo..." 
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" 
                />
                <span className="text-xs text-slate-500 mt-1 block text-right">{mensaje.length}/300</span>
              </div>
            </div>

            {errorEnvio && (
              <p className="text-sm text-red-500 font-medium">{errorEnvio}</p>
            )}

            <button 
              onClick={enviarDonacion} 
              disabled={guardando}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {guardando ? (
                <>Enviando... <Activity className="w-4 h-4 animate-spin" /></>
              ) : 'Registrar Donación'}
            </button>
          </div>
        </section>

        {/* SECCIÓN 2: HISTORIAL */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-500" />
            Mi Historial
          </h2>

          <div className="flex-1 overflow-auto pr-2">
            {cargandoHistorial ? (
              <div className="h-40 flex items-center justify-center text-sm text-slate-500">
                <Activity className="w-5 h-5 animate-spin mr-2" /> Cargando historial...
              </div>
            ) : historial.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-500 gap-2">
                <DollarSign className="w-8 h-8 opacity-20" />
                <p className="text-sm">Aún no tiene donaciones registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historial.map((donacion) => (
                  <div key={donacion.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">
                          {donacion.moneda} {donacion.monto.toLocaleString()}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(donacion.fecha_transferencia).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${obtenerColorEstado(donacion.estado)}`}>
                        {donacion.estado}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                      <span>{donacion.metodo_pago}</span>
                      <span>{donacion.fondo_general ? 'Fondo General' : 'Proyecto Específico'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
