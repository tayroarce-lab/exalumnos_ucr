'use client';

import React, { useState, useEffect } from 'react';
import { SaveState, SaveIndicator } from './SaveIndicator';
import { AcademicInfoForm } from '@/components/cv/forms/AcademicInfoForm';
import { ExperienceForm } from '@/components/cv/forms/ExperienceForm';
import { SkillsForm } from '@/components/cv/forms/SkillsForm';
import { CertificationsForm } from '@/components/cv/forms/CertificationsForm';
import { CheckCircle2, Eye, EyeOff, FileText } from 'lucide-react';
import { useCVLive } from './CVLiveContext';
import { VistaPreviaCV } from './VistaPreviaCV';
import { validarDatosCompletos } from './utils';
import { ModalGenerarCV } from './ModalGenerarCV';

const steps = [
  { id: 1, title: 'Información Académica' },
  { id: 2, title: 'Experiencia y Proyectos' },
  { id: 3, title: 'Habilidades e Idiomas' },
  { id: 4, title: 'Certificaciones y Logros' }
];

export function CVStepper({ initialData }: { initialData: any }) {
  const { liveData } = useCVLive();
  const [currentStep, setCurrentStep] = useState(1);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const isComplete = validarDatosCompletos(liveData);
  
  const handleSaveStateChange = React.useCallback((s: SaveState, msg?: string) => {
    setSaveState(s);
    if (msg) setSaveMessage(msg);
  }, []);

  // Event bus para disparar guardado manual en onStepChange
  const [flushSaveSignal, setFlushSaveSignal] = useState(0);

  const handleStepChange = (newStep: number) => {
    // Si hay un debounce pendiente en el formulario activo, forzamos su guardado
    setFlushSaveSignal(prev => prev + 1);
    
    // Cambiamos de paso después de dar un pequeñísimo delay para que el form reaccione a la señal
    setTimeout(() => {
      setCurrentStep(newStep);
    }, 50);
  };

  return (
    <>
      <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        
        {/* Header con Stepper Visual y Save Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8 mb-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#003B4F] font-display">
            Editor de CV ATS
          </h1>
          <p className="text-base font-medium text-slate-600">
            Optimizado para sistemas de reclutamiento (Applicant Tracking Systems).
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <SaveIndicator state={saveState} message={saveMessage} />
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-blanco shadow-sm hover:bg-slate-50 text-slate-700 h-10 px-4 py-2 text-sm font-semibold transition-all"
          >
            {showPreview ? <><EyeOff className="w-4 h-4" /> Ocultar vista previa</> : <><Eye className="w-4 h-4" /> Mostrar vista previa</>}
          </button>

          {isComplete && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naranja bg-[#E84F26] hover:bg-[#c93f1a] text-white shadow-[0_4px_12px_rgba(232,79,38,0.35)] hover:shadow-[0_6px_18px_rgba(232,79,38,0.45)] hover:-translate-y-0.5 h-10 px-6 py-2"
            >
              <FileText className="w-4 h-4" />
              Generar mi CV
            </button>
          )}
        </div>
      </div>

      <div className={`flex flex-col ${showPreview ? 'xl:flex-row' : ''} gap-8 xl:gap-12`}>
        
        {/* Lado izquierdo: Formularios */}
        <div className={`flex flex-col md:flex-row gap-8 xl:gap-12 ${showPreview ? 'xl:w-[calc(100%-420px-3rem)]' : 'w-full'} min-w-0 w-full`}>
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isPast = step.id < currentStep; 
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(step.id)}
                  className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap text-left overflow-hidden ${
                    isActive 
                      ? 'bg-blanco shadow-md shadow-slate-200/50 text-[#003B4F] ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-negro-base hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full transition-colors ${
                    isActive 
                      ? 'bg-celeste/20 text-[#003B4F]' 
                      : isPast 
                        ? 'bg-[#003B4F]/10 text-[#003B4F]'
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isActive ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-current" />
                    ) : (
                      <span className="text-xs">{step.id}</span>
                    )}
                  </div>
                  <span className="tracking-wide font-bold">{step.title}</span>
                  {isActive && (
                    <div className="absolute inset-0 border-2 border-celeste/30 rounded-2xl pointer-events-none" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Formulario Activo */}
        <div className="flex-1 bg-blanco rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xl shadow-slate-200/50">
          {currentStep === 1 && (
            <AcademicInfoForm 
              initialData={initialData.academic} 
              onSaveStateChange={handleSaveStateChange}
              flushSignal={flushSaveSignal}
            />
          )}
          {currentStep === 2 && (
            <ExperienceForm 
              initialData={initialData.experiences} 
              onSaveStateChange={handleSaveStateChange}
              flushSignal={flushSaveSignal}
            />
          )}
          {currentStep === 3 && (
            <SkillsForm 
              initialData={initialData.skills} 
              onSaveStateChange={handleSaveStateChange}
            />
          )}
          {currentStep === 4 && (
            <CertificationsForm 
              initialData={initialData.certifications} 
              onSaveStateChange={handleSaveStateChange}
            />
          )}

          {/* Stepper Footer Buttons */}
          <div className="flex justify-between items-center mt-10 pt-8 border-t border-slate-200">
            <button
              onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 border border-slate-300 bg-blanco shadow-sm hover:bg-slate-100 text-negro-base h-11 px-6 py-2 whitespace-nowrap min-w-[140px]"
            >
              Paso Anterior
            </button>
            {currentStep === steps.length ? (
              <button
                onClick={() => setShowModal(true)}
                disabled={!isComplete}
                className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 bg-[#003B4F] hover:bg-[#002b3a] text-white shadow-[0_4px_12px_rgba(0,59,79,0.35)] hover:shadow-[0_6px_18px_rgba(0,59,79,0.45)] hover:-translate-y-0.5 h-11 px-6 py-2 whitespace-nowrap min-w-[140px]"
              >
                <FileText className="w-4 h-4" />
                {isComplete ? 'Generar mi CV' : 'Faltan datos'}
              </button>
            ) : (
              <button
                onClick={() => handleStepChange(currentStep + 1)}
                className="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amarillo disabled:pointer-events-none disabled:opacity-50 bg-[#E84F26] hover:bg-[#c93f1a] text-white shadow-[0_4px_12px_rgba(232,79,38,0.35)] hover:shadow-[0_6px_18px_rgba(232,79,38,0.45)] hover:-translate-y-0.5 h-11 px-8 py-2 whitespace-nowrap min-w-[140px]"
              >
                Siguiente Paso
              </button>
            )}
          </div>
        </div>
        </div>

        {/* Lado derecho: Vista Previa */}
        {showPreview && (
          <div className="hidden xl:block w-full max-w-[420px] shrink-0">
            <VistaPreviaCV />
          </div>
        )}
        
        {/* Mobile Preview (Overlay Modal) */}
        {showPreview && (
          <div className="xl:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
            <div className="w-full max-w-[420px] max-h-[90vh] overflow-y-auto relative rounded-3xl bg-slate-50 border border-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-slate-500 hover:text-slate-900 shadow-sm transition-all border border-slate-200">
                <span className="sr-only">Cerrar vista previa</span>
                <EyeOff className="w-5 h-5" />
              </button>
              <div className="p-4">
                <VistaPreviaCV />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    
    {showModal && <ModalGenerarCV onClose={() => setShowModal(false)} />}
    </>
  );
}
