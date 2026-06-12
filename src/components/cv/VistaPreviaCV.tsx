'use client';

import React from 'react';
import { useCVLive } from './CVLiveContext';
import { motion } from 'framer-motion';

export function VistaPreviaCV() {
  const { liveData } = useCVLive();
  const { academic, experiences, skills, certifications } = liveData;

  const techSkills = skills.filter(s => s.skill_type === 'technical');
  const softSkills = skills.filter(s => s.skill_type === 'soft');
  const langSkills = skills.filter(s => s.skill_type === 'language');

  return (
    <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 font-sans min-h-[800px] text-sm overflow-hidden sticky top-8 scale-[0.85] sm:scale-90 origin-top">
      
      {/* Header */}
      <motion.div 
        key={`academic-${JSON.stringify(academic)}`}
        initial={{ backgroundColor: 'rgba(255,255,255,0)' }}
        animate={{ backgroundColor: ['rgba(253,230,138,0.5)', 'rgba(255,255,255,0)'] }}
        transition={{ duration: 1 }}
        className="mb-8 border-b border-slate-300 pb-6"
      >
        <h1 className="text-3xl font-black uppercase font-display mb-1 text-slate-900">CURRICULUM VITAE</h1>
        {academic ? (
          <div>
            <p className="text-xl font-bold font-display text-[#0D4091]">{academic.career || 'Carrera Profesional'}</p>
            <p className="text-slate-500 font-medium text-xs mt-1">
              {academic.university} • Nivel: {academic.academic_level} • Año de ingreso: {academic.entry_year}
            </p>
          </div>
        ) : (
          <p className="text-slate-400 italic">Completa tu información académica para verla aquí.</p>
        )}
      </motion.div>

      {/* Experiencia */}
      {experiences?.length > 0 && (
        <div className="mb-6">
           <h2 className="text-sm font-bold border-b border-slate-200 mb-4 uppercase font-sans text-[#0D4091] pb-1 w-full tracking-wide">Experiencia</h2>
           <div className="space-y-4">
             {experiences.map((exp, i) => (
               <motion.div 
                 key={`exp-${i}-${JSON.stringify(exp)}`}
                 initial={{ backgroundColor: 'rgba(255,255,255,0)' }}
                 animate={{ backgroundColor: ['rgba(253,230,138,0.5)', 'rgba(255,255,255,0)'] }}
                 transition={{ duration: 1 }}
               >
                 <div className="flex justify-between items-baseline mb-0.5">
                   <h3 className="font-bold text-slate-900 text-sm">{exp.title || 'Rol sin título'}</h3>
                   <span className="text-[11px] font-medium text-slate-500">
                     {exp.start_month}/{exp.start_year} - {(!exp.end_month || !exp.end_year) ? 'Presente' : `${exp.end_month}/${exp.end_year}`}
                   </span>
                 </div>
                 <p className="italic text-slate-800 text-sm mb-1.5">{exp.organization || 'Organización'}</p>
                 {exp.bullets && exp.bullets.length > 0 && (
                   <ul className="text-slate-700 list-inside leading-relaxed text-xs space-y-0.5">
                     {exp.bullets.map((b, bIdx) => <li key={bIdx}>• {b}</li>)}
                   </ul>
                 )}
               </motion.div>
             ))}
           </div>
        </div>
      )}

      {/* Certificaciones */}
      {certifications?.length > 0 && (
        <div className="mb-6">
           <h2 className="text-sm font-bold border-b border-slate-200 mb-4 uppercase font-sans text-[#0D4091] pb-1 w-full tracking-wide">Certificaciones y Logros</h2>
           <div className="space-y-4">
             {certifications.map((cert, i) => (
               <motion.div 
                 key={`cert-${i}-${JSON.stringify(cert)}`}
                 initial={{ backgroundColor: 'rgba(255,255,255,0)' }}
                 animate={{ backgroundColor: ['rgba(253,230,138,0.5)', 'rgba(255,255,255,0)'] }}
                 transition={{ duration: 1 }}
               >
                 <div className="flex justify-between items-baseline mb-0.5">
                   <h3 className="font-bold text-slate-900 text-sm">{cert.name || 'Certificación sin título'}</h3>
                   <span className="text-[11px] font-medium text-slate-500">
                     {cert.issued_month}/{cert.issued_year}
                   </span>
                 </div>
                 <p className="italic text-slate-800 text-sm">{cert.institution}</p>
                 {cert.verification_url && (
                   <a href={cert.verification_url} target="_blank" rel="noopener noreferrer" className="text-[#2A8BF6] hover:underline text-xs mt-1 block">
                     Ver Credencial
                   </a>
                 )}
               </motion.div>
             ))}
           </div>
        </div>
      )}

      {/* Habilidades */}
      {skills?.length > 0 && (
        <div className="mb-6">
           <h2 className="text-sm font-bold border-b border-slate-200 mb-4 uppercase font-sans text-[#0D4091] pb-1 w-full tracking-wide">Habilidades e Idiomas</h2>
           <motion.div
             key={`skills-${JSON.stringify(skills)}`}
             initial={{ backgroundColor: 'rgba(255,255,255,0)' }}
             animate={{ backgroundColor: ['rgba(253,230,138,0.5)', 'rgba(255,255,255,0)'] }}
             transition={{ duration: 1 }}
             className="grid grid-cols-2 gap-x-8 gap-y-4"
           >
             <div className="space-y-4">
               {techSkills.length > 0 && (
                 <div>
                   <h3 className="font-bold text-xs text-slate-900 mb-1.5 uppercase">Técnicas</h3>
                   <ul className="text-slate-700 text-xs space-y-0.5">
                     {techSkills.map((s, i) => <li key={i}>• {s.name}</li>)}
                   </ul>
                 </div>
               )}
             </div>

             <div className="space-y-4">
               {langSkills.length > 0 && (
                 <div>
                   <h3 className="font-bold text-xs text-slate-900 mb-1.5 uppercase">Idiomas</h3>
                   <ul className="text-slate-700 text-xs space-y-0.5">
                     {langSkills.map((s, i) => <li key={i}>• {s.name} - {s.level}</li>)}
                   </ul>
                 </div>
               )}
               {softSkills.length > 0 && (
                 <div>
                   <h3 className="font-bold text-xs text-slate-900 mb-1.5 uppercase">Blandas</h3>
                   <ul className="text-slate-700 text-xs space-y-0.5">
                     {softSkills.map((s, i) => <li key={i}>• {s.name}</li>)}
                   </ul>
                 </div>
               )}
             </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
