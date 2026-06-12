'use client';

import React, { useState, useEffect } from 'react';
import { SaveState, SaveIndicator } from './SaveIndicator';
import { AcademicInfoForm } from './forms/AcademicInfoForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { SkillsForm } from './forms/SkillsForm';
import { CertificationsForm } from './forms/CertificationsForm';
import { CheckCircle2, Circle } from 'lucide-react';

const steps = [
  { id: 1, title: 'Información Académica' },
  { id: 2, title: 'Experiencia y Proyectos' },
  { id: 3, title: 'Habilidades e Idiomas' },
  { id: 4, title: 'Certificaciones y Logros' }
];

export function CVStepper({ initialData }: { initialData: any }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  
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

  const handleExportPDF = async () => {
    window.open('/api/cv/export', '_blank');
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 relative z-10">
      
      {/* Header con Stepper Visual y Save Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 dark:border-white/10 pb-8 mb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Editor de CV ATS
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Optimizado para sistemas de reclutamiento (Applicant Tracking Systems).
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <SaveIndicator state={saveState} message={saveMessage} />
          
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 h-10 px-6 py-2"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isPast = step.id < currentStep; 
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(step.id)}
                  className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap text-left overflow-hidden ${
                    isActive 
                      ? 'bg-white shadow-md shadow-slate-200/50 text-indigo-700 dark:bg-white/10 dark:shadow-none dark:text-white ring-1 ring-slate-200 dark:ring-white/20' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full transition-colors ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300' 
                      : isPast 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500'
                  }`}>
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isActive ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-current" />
                    ) : (
                      <span className="text-xs">{step.id}</span>
                    )}
                  </div>
                  <span className="tracking-wide">{step.title}</span>
                  {isActive && (
                    <div className="absolute inset-0 border-2 border-indigo-500/10 dark:border-white/5 rounded-2xl pointer-events-none" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Formulario Activo */}
        <div className="flex-1 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 sm:p-8 shadow-2xl shadow-slate-200/40 dark:shadow-black/40">
          {currentStep === 1 && (
            <AcademicInfoForm 
              initialData={initialData.academic} 
              onSaveStateChange={(s: SaveState, msg?: string) => { setSaveState(s); if(msg) setSaveMessage(msg); }}
              flushSignal={flushSaveSignal}
            />
          )}
          {currentStep === 2 && (
            <ExperienceForm 
              initialData={initialData.experiences} 
              onSaveStateChange={(s: SaveState, msg?: string) => { setSaveState(s); if(msg) setSaveMessage(msg); }}
              flushSignal={flushSaveSignal}
            />
          )}
          {currentStep === 3 && (
            <SkillsForm 
              initialData={initialData.skills} 
              onSaveStateChange={(s: SaveState, msg?: string) => { setSaveState(s); if(msg) setSaveMessage(msg); }}
            />
          )}
          {currentStep === 4 && (
            <CertificationsForm 
              initialData={initialData.certifications} 
              onSaveStateChange={(s: SaveState, msg?: string) => { setSaveState(s); if(msg) setSaveMessage(msg); }}
            />
          )}

          {/* Stepper Footer Buttons */}
          <div className="flex justify-between items-center mt-10 pt-8 border-t border-slate-200/60 dark:border-white/10">
            <button
              onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-sm hover:bg-slate-100 dark:hover:bg-white/10 dark:text-slate-200 hover:-translate-y-0.5 h-11 px-6 py-2"
            >
              Paso Anterior
            </button>
            <button
              onClick={() => handleStepChange(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
              className="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 h-11 px-8 py-2"
            >
              Siguiente Paso
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
