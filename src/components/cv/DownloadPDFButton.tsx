'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PlantillaPDFCV } from './PlantillaPDFCV';
import { Download } from 'lucide-react';
import { DatosCV } from './CVLiveContext';

export default function DownloadPDFButton({ liveData }: { liveData: DatosCV }) {
  return (
    <PDFDownloadLink
      document={<PlantillaPDFCV datos={liveData} />}
      fileName="Mi_Curriculum_ATS.pdf"
      className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-gradient-to-r from-naranja to-amarillo hover:from-[#E03F1E] hover:to-[#E68A14] text-white shadow-lg shadow-naranja/30 hover:shadow-naranja/50 hover:-translate-y-0.5 h-10 px-6 py-2"
    >
      {/* @ts-ignore */}
      {({ loading }) => (
        <>
          <Download className="w-4 h-4" />
          {loading ? 'Generando PDF...' : 'Descargar PDF'}
        </>
      )}
    </PDFDownloadLink>
  );
}
