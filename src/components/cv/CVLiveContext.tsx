'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AcademicInfoData, ExperienceData, SkillData, CertificationData } from '@/app/actions/cv/schemas';

export type DatosCV = {
  academic: AcademicInfoData | null;
  experiences: ExperienceData[];
  skills: SkillData[];
  certifications: CertificationData[];
};

interface CVLiveContextType {
  liveData: DatosCV;
  updateAcademic: (data: AcademicInfoData) => void;
  updateExperience: (index: number, data: ExperienceData) => void;
  removeExperience: (index: number) => void;
  updateCertification: (index: number, data: CertificationData) => void;
  removeCertification: (index: number) => void;
  setSkills: (data: SkillData[]) => void;
}

export const CVLiveContext = createContext<CVLiveContextType | null>(null);

export function CVLiveProvider({ children, initialData }: { children: React.ReactNode, initialData: DatosCV }) {
  const [liveData, setLiveData] = useState<DatosCV>({
    academic: initialData?.academic || null,
    experiences: initialData?.experiences || [],
    skills: initialData?.skills || [],
    certifications: initialData?.certifications || []
  });

  const updateAcademic = useCallback((data: AcademicInfoData) => {
    setLiveData(prev => ({ ...prev, academic: data }));
  }, []);

  const updateExperience = useCallback((index: number, data: ExperienceData) => {
    setLiveData(prev => {
      const exp = [...prev.experiences];
      exp[index] = data;
      return { ...prev, experiences: exp };
    });
  }, []);

  const removeExperience = useCallback((index: number) => {
    setLiveData(prev => {
      const exp = [...prev.experiences];
      exp.splice(index, 1);
      return { ...prev, experiences: exp };
    });
  }, []);

  const updateCertification = useCallback((index: number, data: CertificationData) => {
    setLiveData(prev => {
      const cert = [...prev.certifications];
      cert[index] = data;
      return { ...prev, certifications: cert };
    });
  }, []);

  const removeCertification = useCallback((index: number) => {
    setLiveData(prev => {
      const cert = [...prev.certifications];
      cert.splice(index, 1);
      return { ...prev, certifications: cert };
    });
  }, []);

  const setSkills = useCallback((data: SkillData[]) => {
    setLiveData(prev => ({ ...prev, skills: data }));
  }, []);

  return (
    <CVLiveContext.Provider value={{
      liveData, updateAcademic, updateExperience, removeExperience, 
      updateCertification, removeCertification, setSkills
    }}>
      {children}
    </CVLiveContext.Provider>
  );
}

export function useCVLive() {
  const ctx = useContext(CVLiveContext);
  if (!ctx) throw new Error('useCVLive must be used within CVLiveProvider');
  return ctx;
}
