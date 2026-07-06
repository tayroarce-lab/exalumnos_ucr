import React from 'react'
import ProfileBanner from './ProfileBanner'
import ProfileAvatar from './ProfileAvatar'
import { MapPin, Mail } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/button'

interface ProfileHeaderProps {
  bannerUrl?: string | null
  avatarUrl?: string | null
  initials: string
  name: string
  headline: string
  location: string
  email: string
  isOwner: boolean
}

export default function ProfileHeader({
  bannerUrl,
  avatarUrl,
  initials,
  name,
  headline,
  location,
  email,
  isOwner
}: ProfileHeaderProps) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl relative mb-6">
      <ProfileBanner bannerUrl={bannerUrl} isOwner={isOwner} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end px-4 md:px-0 pb-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6 w-full">
          <ProfileAvatar avatarUrl={avatarUrl} initials={initials} isOwner={isOwner} />
          
          <div className="mt-4 md:mt-0 flex-1 space-y-1 w-full md:w-auto px-2 md:px-0 md:pb-2">
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-wider">
              {name}
            </h1>
            <p className="text-sm text-slate-600 font-semibold">{headline}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {email}
              </span>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="mt-6 md:mt-0 px-6 md:pb-4 shrink-0 w-full md:w-auto flex justify-start md:justify-end">
            <Link href="/profile/edit">
              <Button variant="primary" className="bg-[#F34B26] hover:bg-[#C82A08] hover:scale-105 active:scale-95 transition-all duration-300 font-bold tracking-wider text-xs px-6 py-2 border-0 shadow-md">
                Editar Perfil
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
