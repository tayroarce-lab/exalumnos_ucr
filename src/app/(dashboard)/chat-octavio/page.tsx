import React from 'react';
import { Metadata } from 'next';
import ChatOctavioContainer from '@/components/chat-octavio/ChatOctavioContainer';

export const metadata: Metadata = {
  title: 'Buzón de Chat Privado | Exalumnos UCR',
  description: 'Comunícate de forma segura y privada con otros estudiantes y exalumnos colaboradores del proyecto.',
};

export default function ChatOctavioPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mi Buzón de Chat</h1>
        <p className="text-slate-500 text-sm mt-1">
          Espacio privado de comunicación para colaboración del proyecto.
        </p>
      </div>
      <ChatOctavioContainer />
    </div>
  );
}
