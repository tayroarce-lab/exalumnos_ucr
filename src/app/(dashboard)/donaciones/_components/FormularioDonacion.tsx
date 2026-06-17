'use client';

import React, { useState } from 'react';
import { EstudianteDirectorio } from '@/types/estudiantes';
import { crearDonacion, uploadComprobante } from '@/actions/donations';
import { createClient } from '@/lib/supabase/client';
import { Heart, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function FormularioDonacion({ estudiante }: { estudiante: EstudianteDirectorio | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    monto: '',
    moneda: 'CRC',
    metodo_pago: 'SINPE',
    fecha_transferencia: new Date().toISOString().split('T')[0],
    numero_referencia: '',
    mensaje_estudiante: '',
  });

  const [file, setFile] = useState<File | null>(null);

  const primerNombre = estudiante ? estudiante.nombre.split(' ')[0] : '';
  const tituloProyecto = estudiante?.proyecto_titulo || (estudiante ? `Proyecto TFG ${primerNombre}` : 'Fondo General');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!file) throw new Error("Debes adjuntar el comprobante de transferencia.");
      if (!formData.monto || isNaN(Number(formData.monto))) throw new Error("Monto inválido.");
      if (!formData.numero_referencia) throw new Error("Número de referencia es requerido.");

      // 1. Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("No estás autenticado.");

      // 2. Subir el archivo usando Server Action (evita el problema de RLS)
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('userId', user.id);

      const result = await uploadComprobante(uploadData);

      if (!result.success || !result.filePath) {
        throw new Error(`Error subiendo comprobante: ${result.error || 'Error desconocido'}`);
      }

      // 3. Crear donación
      await crearDonacion({
        proyecto_destino: estudiante ? estudiante.user_id : 'general',
        monto: Number(formData.monto),
        moneda: formData.moneda as 'CRC' | 'USD',
        metodo_pago: formData.metodo_pago as 'SINPE' | 'Transferencia',
        fecha_transferencia: new Date(formData.fecha_transferencia).toISOString(),
        numero_referencia: formData.numero_referencia,
        comprobante_url: result.filePath,
        mensaje_estudiante: formData.mensaje_estudiante,
        estudiante_id: estudiante ? estudiante.user_id : undefined,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-[#003B4F] mb-3">¡Gracias por tu apoyo!</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-8">
          Hemos recibido la información de tu donación y está en proceso de validación. 
          En breve recibirás un correo electrónico de confirmación con los siguientes pasos.
        </p>
        <button
          onClick={() => router.push('/directorio/estudiantes')}
          className="bg-[#003B4F] hover:bg-[#1A5B75] text-white font-bold py-3 px-8 rounded-xl transition-all duration-200"
        >
          Volver al Directorio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-10">
      {estudiante && (
        <div className="flex items-center gap-4 p-4 mb-8 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl border border-blue-100">
          <div className="w-16 h-16 rounded-full bg-white p-1 shadow-sm flex-shrink-0">
            {estudiante.foto_url ? (
              <img src={getAvatarUrl(estudiante.foto_url) as string} alt={estudiante.nombre} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#003B4F] flex items-center justify-center text-white font-bold text-xl">
                {estudiante.nombre.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-[#B43B06] uppercase tracking-wide">Proyecto Seleccionado</p>
            <h3 className="font-black text-lg text-[#003B4F] leading-tight">{tituloProyecto}</h3>
            <p className="text-sm font-medium text-slate-500">De: {estudiante.nombre}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 border-b pb-2">Datos de la Transferencia</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="monto" className="block text-xs font-bold text-slate-500 mb-1">Monto</label>
              <input 
                id="monto"
                type="number" 
                name="monto"
                required
                min="1"
                step="0.01"
                value={formData.monto}
                onChange={handleInputChange}
                className="w-full rounded-xl border-slate-200 focus:border-[#54BCEB] focus:ring-[#54BCEB] text-slate-800"
                placeholder="Ej. 10000"
              />
            </div>
            <div>
              <label htmlFor="moneda" className="block text-xs font-bold text-slate-500 mb-1">Moneda</label>
              <select 
                id="moneda"
                name="moneda"
                value={formData.moneda}
                onChange={handleInputChange}
                className="w-full rounded-xl border-slate-200 focus:border-[#54BCEB] focus:ring-[#54BCEB] text-slate-800"
              >
                <option value="CRC">Colones (CRC)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="metodo_pago" className="block text-xs font-bold text-slate-500 mb-1">Método de Pago</label>
              <select 
                id="metodo_pago"
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleInputChange}
                className="w-full rounded-xl border-slate-200 focus:border-[#54BCEB] focus:ring-[#54BCEB] text-slate-800"
              >
                <option value="SINPE">SINPE Móvil</option>
                <option value="Transferencia">Transferencia Bancaria</option>
              </select>
            </div>
            <div>
              <label htmlFor="fecha_transferencia" className="block text-xs font-bold text-slate-500 mb-1">Fecha de Transf.</label>
              <input 
                id="fecha_transferencia"
                type="date" 
                name="fecha_transferencia"
                required
                value={formData.fecha_transferencia}
                onChange={handleInputChange}
                className="w-full rounded-xl border-slate-200 focus:border-[#54BCEB] focus:ring-[#54BCEB] text-slate-800"
              />
            </div>
          </div>

          <div>
            <label htmlFor="numero_referencia" className="block text-xs font-bold text-slate-500 mb-1">Número de Referencia</label>
            <input 
              id="numero_referencia"
              type="text" 
              name="numero_referencia"
              required
              value={formData.numero_referencia}
              onChange={handleInputChange}
              className="w-full rounded-xl border-slate-200 focus:border-[#54BCEB] focus:ring-[#54BCEB] text-slate-800"
              placeholder="Ej. 123456789"
            />
          </div>
        </div>

        <div className="space-y-4 flex flex-col">
          <h4 className="font-bold text-slate-800 border-b pb-2">Comprobante</h4>
          
          <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-6 relative hover:bg-slate-100 transition-colors group">
            <UploadCloud className="w-10 h-10 text-[#54BCEB] mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-slate-600 mb-1 text-center">
              {file ? file.name : 'Sube tu comprobante (PDF, JPG, PNG)'}
            </p>
            <p className="text-xs text-slate-400 text-center">Máximo 5MB</p>
            <input 
              aria-label="Subir comprobante"
              type="file" 
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {estudiante && (
        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-500 mb-2">Mensaje para el estudiante (Opcional)</label>
          <textarea 
            name="mensaje_estudiante"
            value={formData.mensaje_estudiante}
            onChange={handleInputChange}
            rows={3}
            className="w-full rounded-xl border-slate-200 focus:border-[#54BCEB] focus:ring-[#54BCEB] text-slate-800 resize-none"
            placeholder={`Déjale unas palabras de aliento a ${estudiante.nombre}...`}
            maxLength={300}
          />
          <p className="text-xs text-slate-400 mt-1 text-right">{formData.mensaje_estudiante.length}/300</p>
        </div>
      )}

      <div className="pt-6 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
        <p className="text-xs text-slate-500">
          Al enviar esta información, confirmas que has realizado la transferencia a la cuenta oficial de la Fundación UCR.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E84F26] hover:bg-[#D43D15] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-[#E84F26]/30 transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5" />
              Enviar Comprobante
            </>
          )}
        </button>
      </div>
    </form>
  );
}
