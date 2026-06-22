'use client'

import React, { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { updateBannerImage } from '../actions'

interface ProfileBannerProps {
  bannerUrl: string | null | undefined
  isOwner: boolean
}

export default function ProfileBanner({ bannerUrl, isOwner }: ProfileBannerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await updateBannerImage(formData)
      if (!res.success) {
        alert(res.error || 'Error al subir el banner')
      } else {
        // La Server Action ya revalida el path
      }
    } catch (error) {
      console.error(error)
      alert('Ocurrió un error inesperado al subir el banner')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="relative w-full h-48 md:h-56 rounded-t-2xl overflow-hidden bg-gradient-to-r from-esmeralda to-celeste">
      {bannerUrl && (
        <img 
          src={bannerUrl} 
          alt="Profile Banner" 
          className="w-full h-full object-cover"
        />
      )}
      
      {isUploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

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
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 transition-colors rounded-full text-white backdrop-blur-sm"
            title="Editar banner"
          >
            <Camera className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )
}
