'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`w-full h-11 px-4 bg-white border ${
          error ? 'border-rose-500 bg-rose-50 focus:ring-rose-500/20' : 'border-slate-200 focus:border-brand-emerald focus:ring-brand-emerald/10'
        } rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:ring-4 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className={`w-full min-h-[100px] p-4 bg-white border ${
          error ? 'border-rose-500 bg-rose-50 focus:ring-rose-500/20' : 'border-slate-200 focus:border-brand-emerald focus:ring-brand-emerald/10'
        } rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:ring-4 resize-y ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  )
}

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full h-11 pl-4 pr-10 bg-white border ${
            error ? 'border-rose-500 bg-rose-50 focus:ring-rose-500/20' : 'border-slate-200 focus:border-brand-emerald focus:ring-brand-emerald/10'
          } rounded-xl text-sm text-slate-600 font-medium appearance-none transition-all focus:outline-none focus:ring-4 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown className="w-4.5 h-4.5" />
        </span>
      </div>
      {error && (
        <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  )
}

