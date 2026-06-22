'use client'

import React, { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { updateProfileImage } from '../actions'

interface ProfileAvatarProps {
  avatarUrl: string | null | undefined
  initials: string
  isOwner: boolean
}

export default function ProfileAvatar({ avatarUrl, initials, isOwner }: ProfileAvatarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await updateProfileImage(formData)
      if (!res.success) {
        alert(res.error || 'Error al subir la foto de perfil')
      }
    } catch (error) {
      console.error(error)
      alert('Ocurrió un error inesperado al subir la foto')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="relative group shrink-0 -mt-12 md:-mt-16 ml-6 md:ml-10 z-10">
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-4 ring-white overflow-hidden bg-[#F34B26]/10 flex items-center justify-center relative">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profile Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-bold text-[#F34B26] text-3xl md:text-5xl">{initials}</span>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {isOwner && !isUploading && (
        <>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 md:bottom-2 md:right-2 p-2 bg-[#F34B26] hover:bg-[#C82A08] transition-colors rounded-full text-white shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100"
            title="Actualizar foto"
          >
            <Camera className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
