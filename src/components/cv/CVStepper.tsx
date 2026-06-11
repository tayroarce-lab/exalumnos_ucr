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
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4 md:p-6">
      
      {/* Header con Stepper Visual y Save Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editor de CV ATS</h1>
          <p className="text-sm text-slate-500">Optimizado para sistemas de reclutamiento (Applicant Tracking Systems).</p>
        </div>
        
        <div className="flex items-center gap-4">
          <SaveIndicator state={saveState} message={saveMessage} />
          
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-600/90 h-9 px-4 py-2"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              // Simplificación: Podríamos calcular si cada paso está "completo"
              const isPast = step.id < currentStep; 
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(step.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap text-left ${
                    isActive 
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-slate-300 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : isActive ? (
                    <Circle className="w-4 h-4 fill-slate-900 text-slate-900 dark:fill-slate-50 dark:text-slate-50" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  {step.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Formulario Activo */}
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-xl border p-6 shadow-sm">
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
              // flushSignal no es tan vital aquí porque los tags se guardan al hacer add/remove
            />
          )}
          {currentStep === 4 && (
            <CertificationsForm 
              initialData={initialData.certifications} 
              onSaveStateChange={(s: SaveState, msg?: string) => { setSaveState(s); if(msg) setSaveMessage(msg); }}
            />
          )}

          {/* Stepper Footer Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 h-9 px-4 py-2"
            >
              Anterior
            </button>
            <button
              onClick={() => handleStepChange(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 h-9 px-4 py-2"
            >
              Siguiente Paso
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
