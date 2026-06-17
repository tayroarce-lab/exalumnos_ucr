'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Accessibility,
  Type,
  Contrast,
  Droplet,
  Link as LinkIcon,
  Volume2,
  RotateCcw
} from 'lucide-react'

const A11yToolbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [grayscale, setGrayscale] = useState(false)
  const [highlightLinks, setHighlightLinks] = useState(false)
  const [textToSpeech, setTextToSpeech] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Initialization from localStorage (run only on client to avoid hydration errors)
  useEffect(() => {
    setLargeText(JSON.parse(localStorage.getItem('a11y_largeText') || 'false'))
    setHighContrast(JSON.parse(localStorage.getItem('a11y_highContrast') || 'false'))
    setGrayscale(JSON.parse(localStorage.getItem('a11y_grayscale') || 'false'))
    setHighlightLinks(JSON.parse(localStorage.getItem('a11y_highlightLinks') || 'false'))
    setTextToSpeech(JSON.parse(localStorage.getItem('a11y_textToSpeech') || 'false'))
  }, [])

  // Persist state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('a11y_largeText', JSON.stringify(largeText))
    localStorage.setItem('a11y_highContrast', JSON.stringify(highContrast))
    localStorage.setItem('a11y_grayscale', JSON.stringify(grayscale))
    localStorage.setItem('a11y_highlightLinks', JSON.stringify(highlightLinks))
    localStorage.setItem('a11y_textToSpeech', JSON.stringify(textToSpeech))
  }, [largeText, highContrast, grayscale, highlightLinks, textToSpeech])

  // Apply classes dynamically to the DOM
  useEffect(() => {
    const htmlObj = document.documentElement
    const bodyObj = document.body

    // Large text on HTML (so rem scales)
    if (largeText) htmlObj.classList.add('a11y-large-text')
    else htmlObj.classList.remove('a11y-large-text')

    // High Contrast on HTML
    if (highContrast) htmlObj.classList.add('a11y-high-contrast')
    else htmlObj.classList.remove('a11y-high-contrast')

    // Grayscale on HTML
    if (grayscale) htmlObj.classList.add('a11y-grayscale')
    else htmlObj.classList.remove('a11y-grayscale')

    // Highlight links on Body
    if (highlightLinks) bodyObj.classList.add('a11y-highlight-links')
    else bodyObj.classList.remove('a11y-highlight-links')

  }, [largeText, highContrast, grayscale, highlightLinks])

  // Handle Text-to-Speech on hover
  useEffect(() => {
    let speakTimeout: NodeJS.Timeout

    const handleMouseOver = (e: MouseEvent) => {
      if (!textToSpeech) return
      
      const target = e.target as HTMLElement
      const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'SPAN', 'LABEL', 'LI', 'STRONG', 'B', 'INPUT', 'SELECT', 'TEXTAREA']
      
      if (validTags.includes(target.tagName) || target.getAttribute('role') === 'button' || target.getAttribute('role') === 'link') {
        // Prevent reading massive body blocks, get specific text
        let text = target.getAttribute('aria-label') || 
                   (target.getAttribute('data-no-tts-placeholder') ? null : (target as HTMLInputElement).placeholder) || 
                   target.title || 
                   target.innerText
        
        if (text && text.trim().length > 0 && text.length < 300) {
          window.speechSynthesis.cancel() // Stop current speaking
          
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = 'es-ES' // Spanish voice
          utterance.rate = 1.0
          
          speakTimeout = setTimeout(() => {
            window.speechSynthesis.speak(utterance)
          }, 400) // 400ms delay to avoid stuttering on quick movements
        }
      }
    }

    const handleMouseOut = () => {
      clearTimeout(speakTimeout)
    }

    if (textToSpeech) {
      document.body.addEventListener('mouseover', handleMouseOver)
      document.body.addEventListener('mouseout', handleMouseOut)
    } else {
      window.speechSynthesis.cancel()
      document.body.removeEventListener('mouseover', handleMouseOver)
      document.body.removeEventListener('mouseout', handleMouseOut)
    }

    return () => {
      clearTimeout(speakTimeout)
      document.body.removeEventListener('mouseover', handleMouseOver)
      document.body.removeEventListener('mouseout', handleMouseOut)
      window.speechSynthesis.cancel()
    }
  }, [textToSpeech])

  const resetAll = () => {
    setLargeText(false)
    setHighContrast(false)
    setGrayscale(false)
    setHighlightLinks(false)
    setTextToSpeech(false)
  }

  return (
    <div ref={toolbarRef} className={`fixed top-1/2 right-0 -translate-y-1/2 z-[9999] flex items-center transition-all duration-300 ${isOpen ? '' : 'translate-x-[250px]'}`}>
      <button 
        className="bg-cyan-400 hover:bg-cyan-500 text-white border-none w-[50px] h-[50px] rounded-l-xl cursor-pointer shadow-[-2px_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center transition-colors absolute left-[-50px]" 
        onClick={() => setIsOpen(!isOpen)}
        title="Herramientas de Accesibilidad"
        aria-label="Abrir panel de accesibilidad"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      <div className="bg-[#FDF3E7]/95 backdrop-blur-md border border-[#E6D5C3] p-5 rounded-l-2xl text-slate-900 w-[250px] shadow-[-5px_0_15px_rgba(0,0,0,0.3)] flex flex-col gap-4">
        <h3 className="text-lg font-bold m-0 border-b border-[#E6D5C3] pb-2.5 text-center text-slate-900">Accesibilidad</h3>
        
        <button 
          className={`border p-2.5 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors text-sm hover:bg-white/60 ${largeText ? 'bg-cyan-500/20 border-cyan-500 text-cyan-800 font-medium' : 'bg-white/40 border-[#E6D5C3] text-slate-800'}`}
          onClick={() => setLargeText(!largeText)}
        >
          <Type className="w-5 h-5 text-center" /> Texto Grande
        </button>

        <button 
          className={`border p-2.5 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors text-sm hover:bg-white/60 ${highContrast ? 'bg-cyan-500/20 border-cyan-500 text-cyan-800 font-medium' : 'bg-white/40 border-[#E6D5C3] text-slate-800'}`}
          onClick={() => setHighContrast(!highContrast)}
        >
          <Contrast className="w-5 h-5 text-center" /> Alto Contraste
        </button>

        <button 
          className={`border p-2.5 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors text-sm hover:bg-white/60 ${grayscale ? 'bg-cyan-500/20 border-cyan-500 text-cyan-800 font-medium' : 'bg-white/40 border-[#E6D5C3] text-slate-800'}`}
          onClick={() => setGrayscale(!grayscale)}
        >
          <Droplet className="w-5 h-5 text-center" /> Escala de Grises
        </button>

        <button 
          className={`border p-2.5 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors text-sm hover:bg-white/60 ${highlightLinks ? 'bg-cyan-500/20 border-cyan-500 text-cyan-800 font-medium' : 'bg-white/40 border-[#E6D5C3] text-slate-800'}`}
          onClick={() => setHighlightLinks(!highlightLinks)}
        >
          <LinkIcon className="w-5 h-5 text-center" /> Resaltar Enlaces
        </button>

        <button 
          className={`border p-2.5 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors text-sm hover:bg-white/60 ${textToSpeech ? 'bg-cyan-500/20 border-cyan-500 text-cyan-800 font-medium' : 'bg-white/40 border-[#E6D5C3] text-slate-800'}`}
          onClick={() => {
             setTextToSpeech(!textToSpeech)
             if(!textToSpeech) {
               const utterance = new SpeechSynthesisUtterance("Lectura por voz activada.")
               utterance.lang = 'es-ES'
               window.speechSynthesis.speak(utterance)
             } else {
               window.speechSynthesis.cancel()
             }
          }}
        >
          <Volume2 className="w-5 h-5 text-center" /> Lectura por Voz
        </button>

        <button 
          className="bg-white/40 border border-dashed border-slate-400 text-slate-700 p-2.5 rounded-lg flex items-center justify-center gap-2.5 cursor-pointer transition-colors text-sm hover:bg-white/60 mt-2"  
          onClick={resetAll}
        >
          <RotateCcw className="w-5 h-5" /> Restablecer
        </button>
      </div>
    </div>
  )
}

export default A11yToolbar
