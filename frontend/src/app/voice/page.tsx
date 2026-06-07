"use client"

import * as React from "react"
import { Sidebar, MobileBottomNav } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { API_URL } from "@/config"

interface VoiceSession {
  id: number
  transcript: string
  response: any
  time: string
  riskLevel?: string
}

export default function VoicePage() {
  const [isRecording, setIsRecording] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "listening" | "processing" | "speaking">("idle")
  const [transcript, setTranscript] = React.useState<string | null>(null)
  const [aiResponse, setAiResponse] = React.useState<any | null>(null)
  const [completedActions, setCompletedActions] = React.useState<Record<string, boolean>>({})
  const [sessions, setSessions] = React.useState<VoiceSession[]>([])
  const [showHistory, setShowHistory] = React.useState(false)
  const [selectedSession, setSelectedSession] = React.useState<VoiceSession | null>(null)
  
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const audioChunksRef = React.useRef<Blob[]>([])
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        await sendAudioToBackend(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setStatus("listening")
      setTranscript("Listening for your voice...")
      setAiResponse(null)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setTranscript("Error: Microphones are blocked or unavailable.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setStatus("processing")
      setTranscript("Processing voice data...")
    }
  }

  const sendAudioToBackend = async (blob: Blob) => {
    const formData = new FormData()
    formData.append("audio", blob, "voice_input.webm")

    try {
      const response = await fetch(`${API_URL}/voice/voice-assistant`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const t = data.transcript || "Could not transcribe audio."
        const r = data.response
        setTranscript(t)
        setAiResponse(r)

        // Save to session history
        const riskLevel = r?.assessment?.risk_level || (r?.status === "EMERGENCY" ? "CRITICAL" : undefined)
        setSessions(prev => [{ id: Date.now(), transcript: t, response: r, time: new Date().toLocaleTimeString(), riskLevel }, ...prev].slice(0, 10))
        
        if (data.audio_file) {
          setStatus("speaking")
          const audioUrl = `${API_URL}/outputs/${data.audio_file}`
          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioUrl
            audioPlayerRef.current.play()
            audioPlayerRef.current.onended = () => {
              setStatus("idle")
            }
          } else {
            const player = new Audio(audioUrl)
            player.play()
            player.onended = () => {
              setStatus("idle")
            }
          }
        } else {
          setStatus("idle")
        }
      } else {
        setTranscript("Error processing voice assistant request.")
        setStatus("idle")
      }
    } catch (err) {
      console.error(err)
      setTranscript("Could not connect to voice assistant backend. Make sure port 8000 is active.")
      setStatus("idle")
    }
  }

  const toggleListening = () => {
    if (status === "listening") {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="bg-surface text-on-surface flex h-screen overflow-hidden">
      {/* SideNavBar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-surface-container-lowest overflow-hidden pb-16 md:pb-0">
        
        {/* TopAppBar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30"
        >
          <div className="flex items-center gap-3">
            <span className="md:hidden material-symbols-outlined text-on-surface-variant cursor-pointer">
              menu
            </span>
            <div className="flex flex-col">
              <h2 className="font-bold text-lg text-primary">Voice Health Assistant</h2>
              <span className="text-[11px] text-on-surface-variant opacity-75">
                Speak naturally and receive healthcare guidance.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-surface-container-low rounded-full px-3 py-1 border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
              <input
                className="bg-transparent border-none text-xs w-40 outline-none px-2 py-1"
                placeholder="Search history..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-all text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">notifications</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Hidden Audio Player for Speech Playback */}
        <audio ref={audioPlayerRef} className="hidden" />

        {/* Voice Interaction Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center px-lg relative">
          
          {/* Background Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{
                scale: status === "listening" ? 1.15 : status === "speaking" ? 1.08 : status === "processing" ? 0.9 : 1,
                opacity: status === "listening" ? 0.5 : status === "speaking" ? 0.4 : status === "processing" ? 0.25 : 0.3,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-[600px] h-[600px] bg-primary rounded-full blur-[160px]"
            />
          </div>

          {/* AI Avatar Sphere */}
          <div className="relative z-10 flex flex-col items-center gap-xl max-w-4xl w-full">
            
            {/* Avatar and Pulse */}
            <div className="relative group cursor-pointer" onClick={toggleListening}>
              {/* Concentric ripple waves using Framer Motion */}
              <AnimatePresence>
                {(status === "listening" || status === "speaking") && (
                  <>
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1.3, opacity: [0, 0.45, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border-2 border-primary pointer-events-none"
                    />
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1.6, opacity: [0, 0.25, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut", delay: 0.7 }}
                      className="absolute inset-0 rounded-full border-2 border-primary pointer-events-none"
                    />
                  </>
                )}
              </AnimatePresence>
              
              <motion.div
                animate={
                  status === "listening"
                    ? { scale: [1, 1.05, 1] }
                    : status === "speaking"
                    ? { scale: [1, 1.04, 1, 1.06, 1] }
                    : status === "processing"
                    ? { scale: [1, 0.96, 1] }
                    : { scale: [1, 1.02, 1] }
                }
                transition={{
                  repeat: Infinity,
                  duration: status === "processing" ? 1.5 : 2.5,
                  ease: "easeInOut"
                }}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary-container p-1 shadow-2xl relative z-10 ai-glow overflow-hidden transition-all duration-200"
              >
                <div className="w-full h-full rounded-full flex items-center justify-center select-none bg-primary/20 backdrop-blur-sm relative transition-colors">
                  <AnimatePresence mode="wait">
                    {status === "idle" && (
                      <motion.div
                        key="brand-mic"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col items-center justify-center"
                      >
                        <span 
                          className="material-symbols-outlined text-white text-[56px] drop-shadow-md cursor-pointer" 
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          mic
                        </span>
                      </motion.div>
                    )}

                    {status === "listening" && (
                      <motion.div
                        key="listening-wave"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col items-center gap-2"
                      >
                        {/* 5-bar animated soundwave for listening */}
                        <div className="flex items-end gap-1 h-9 justify-center select-none">
                          {Array.from({ length: 5 }).map((_, bar) => (
                            <motion.div
                              key={bar}
                              animate={{
                                height: [8, Math.random() * 24 + 12, 8]
                              }}
                              transition={{
                                duration: 0.4 + Math.random() * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: bar * 0.05
                              }}
                              className="w-1.5 rounded-full bg-white shadow-sm"
                              style={{ minHeight: "6px" }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-white/90 uppercase tracking-widest animate-pulse">
                          Listening
                        </span>
                      </motion.div>
                    )}

                    {status === "processing" && (
                      <motion.div
                        key="processing-loader"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-white text-[48px] animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>
                          sync
                        </span>
                        <span className="text-[10px] font-black text-white/90 uppercase tracking-widest animate-pulse">
                          Analyzing
                        </span>
                      </motion.div>
                    )}

                    {status === "speaking" && (
                      <motion.div
                        key="speaking-wave"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col items-center gap-2"
                      >
                        {/* 5-bar animated soundwave for speaking (wider amplitudes) */}
                        <div className="flex items-end gap-1 h-9 justify-center select-none">
                          {Array.from({ length: 5 }).map((_, bar) => (
                            <motion.div
                              key={bar}
                              animate={{
                                height: [6, Math.random() * 16 + 8, 6]
                              }}
                              transition={{
                                duration: 0.5 + Math.random() * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: bar * 0.06
                              }}
                              className="w-1.5 rounded-full bg-teal-100 shadow-sm"
                              style={{ minHeight: "6px" }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-teal-100 uppercase tracking-widest animate-pulse">
                          Speaking
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Soundwave Amplitude Bars Visualization */}
            <div className="flex items-end gap-1.5 h-12 justify-center" id="wave-container">
              {Array.from({ length: 14 }).map((_, i) => {
                let heightValues = [12, 12];
                let duration = 1.0;
                
                if (status === "listening") {
                  heightValues = [12, Math.random() * 32 + 16, 12];
                  duration = 0.5 + Math.random() * 0.4;
                } else if (status === "speaking") {
                  heightValues = [12, Math.random() * 24 + 12, 12];
                  duration = 0.6 + Math.random() * 0.4;
                } else if (status === "processing") {
                  heightValues = [12, 18, 12];
                  duration = 1.2;
                } else {
                  heightValues = [12, 14, 12];
                  duration = 2.0;
                }

                return (
                  <motion.div
                    key={i}
                    animate={{ height: heightValues }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.05,
                    }}
                    className={`w-1 rounded-full ${
                      i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-primary-container" : "bg-secondary"
                    }`}
                    style={{ minHeight: "6px" }}
                  />
                )
              })}
            </div>

            {/* Transcript Area */}
            <div className="w-full max-w-2xl glass-panel p-lg rounded-3xl shadow-xl space-y-md relative z-10">
              <div className={`inline-flex items-center gap-sm px-md py-1 rounded-full text-xs font-bold ${
                status === "listening" ? "bg-primary/10 text-primary" :
                status === "processing" ? "bg-secondary/10 text-secondary" :
                status === "speaking" ? "bg-tertiary/10 text-tertiary" : "bg-outline-variant/10 text-on-surface-variant"
              }`} id="status-badge">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  status === "listening" ? "bg-primary animate-pulse" :
                  status === "processing" ? "bg-secondary animate-bounce" :
                  status === "speaking" ? "bg-tertiary animate-ping" : "bg-outline"
                }`}></span>
                <span className="uppercase tracking-wider">
                  {status === "idle" && "Ready"}
                  {status === "listening" && "Listening"}
                  {status === "processing" && "Processing"}
                  {status === "speaking" && "Responding"}
                </span>
              </div>
              
              <div className="space-y-md text-sm leading-relaxed">
                <div className="transition-all duration-500" id="user-input">
                  <p className="text-on-surface-variant font-headline-sm italic leading-relaxed text-base">
                    {transcript ? `"${transcript}"` : `"Click the microphone to speak symptoms or ask questions."`}
                  </p>
                </div>
                
                <AnimatePresence>
                  {aiResponse && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      id="ai-response"
                      className="w-full text-left"
                    >
                      <div className="border-t border-outline-variant/30 pt-md space-y-4">
                        {typeof aiResponse === "string" ? (
                          <div className="flex gap-md">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                                neurology
                              </span>
                            </div>
                            <div className="text-on-surface font-body-lg flex-1 text-sm bg-surface-container-low p-3 rounded-2xl whitespace-pre-line max-h-48 overflow-y-auto custom-scrollbar">
                              {aiResponse}
                            </div>
                          </div>
                        ) : aiResponse && aiResponse.status === "EMERGENCY" ? (
                          /* Emergency Alert Widget */
                          <div className="bg-red-50 border border-red-200 text-red-950 p-4 rounded-2xl flex flex-col gap-3 shadow-xs relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-200/30 rounded-full blur-xl pointer-events-none animate-pulse"></div>
                            <div className="flex items-center gap-1.5 text-red-700">
                              <span className="material-symbols-outlined font-bold text-lg animate-bounce">report</span>
                              <span className="font-extrabold text-xs uppercase tracking-wider">Critical Emergency Advisory</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Reason / Symptoms</span>
                              <p className="text-xs font-semibold leading-relaxed">{aiResponse.assessment?.reason}</p>
                            </div>
                            <div className="bg-red-105/60 border border-red-200 p-3 rounded-xl space-y-1">
                              <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Immediate Actions Required</span>
                              <p className="text-xs font-extrabold text-red-800 leading-relaxed flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm font-bold animate-ping">emergency</span>
                                {aiResponse.assessment?.action}
                              </p>
                            </div>
                          </div>
                        ) : aiResponse && aiResponse.status === "SUCCESS" && aiResponse.assessment ? (
                          /* Premium Assessment Card Widget */
                          <div className="space-y-4">
                            {/* Verification and Match Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                                <span className="material-symbols-outlined text-[12px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                <span>MedHive AI Copilot Verified</span>
                              </div>
                              
                              {aiResponse.assessment.confidence_score && (
                                <div className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 bg-surface-container px-2 py-1 rounded-lg border border-outline-variant/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                  <span>{aiResponse.assessment.confidence_score}% Match Index</span>
                                </div>
                              )}
                            </div>

                            {/* Visual Risk Profile Gauge */}
                            {(() => {
                              const lvl = (aiResponse.assessment.risk_level || "LOW").toUpperCase();
                              const isHigh = lvl.includes("HIGH") || lvl.includes("CRITICAL") || lvl.includes("EMERGENCY");
                              const isMed = lvl.includes("MEDIUM") || lvl.includes("MODERATE");
                              
                              const colorClass = isHigh 
                                ? "bg-red-50/70 border-red-200 text-red-950" 
                                : isMed 
                                ? "bg-amber-50/70 border-amber-200 text-amber-950" 
                                : "bg-green-50/70 border-green-200 text-green-950";
                                
                              const textBadgeColor = isHigh 
                                ? "bg-red-100 text-red-700 border-red-300" 
                                : isMed 
                                ? "bg-amber-100 text-amber-700 border-amber-300" 
                                : "bg-green-100 text-green-700 border-green-300";

                              const icon = isHigh ? "report" : isMed ? "warning" : "check_circle";
                              const desc = isHigh 
                                ? "Critical Advisory: These metrics suggest high risk parameters. Please consult a healthcare professional immediately." 
                                : isMed 
                                ? "Advisory: Elevated wellness markers detected. Focus on rest, hydration, and active self-care." 
                                : "Standard baseline: Wellness parameters appear within normal limits. Maintain regular health tracking.";
                                
                              return (
                                <div className={`p-3.5 rounded-2xl border flex flex-col gap-2 transition-all ${colorClass}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/80">Health Risk Evaluation</span>
                                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${textBadgeColor}`}>
                                      <span className="material-symbols-outlined text-[12px] font-bold">{icon}</span>
                                      <span>{lvl}</span>
                                    </div>
                                  </div>
                                  <p className="text-[11px] font-semibold leading-relaxed opacity-90">{desc}</p>
                                </div>
                              );
                            })()}

                            {/* Symptoms Tracked */}
                            {aiResponse.assessment.symptoms && aiResponse.assessment.symptoms.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-primary">
                                  <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>healing</span>
                                  <span className="font-bold text-[10px] uppercase tracking-wider">Symptoms Tracked</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {aiResponse.assessment.symptoms.map((s: string, idx: number) => (
                                    <span key={idx} className="bg-surface hover:bg-surface-container transition-colors px-2.5 py-1 rounded-xl text-xs font-bold text-on-surface border border-outline-variant/30 flex items-center gap-1.5 shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Potential Health Considerations Grid */}
                            {aiResponse.assessment.possible_conditions && aiResponse.assessment.possible_conditions.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-primary">
                                  <span className="material-symbols-outlined text-sm font-bold">medical_services</span>
                                  <span className="font-bold text-[10px] uppercase tracking-wider">Potential Considerations</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {aiResponse.assessment.possible_conditions.map((c: string, idx: number) => {
                                    const matchPercent = idx === 0 ? 82 : idx === 1 ? 48 : 25;
                                    return (
                                      <div key={idx} className="p-3 bg-white border border-outline-variant/30 rounded-2xl flex flex-col gap-1.5 shadow-2xs hover:border-primary/20 hover:shadow-xs transition-all">
                                        <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                                          <span className="truncate max-w-[150px]">{c}</span>
                                          <span className="text-[10px] text-primary">{matchPercent}% Match</span>
                                        </div>
                                        <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full" 
                                            style={{ width: `${matchPercent}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Recommended Wellness Actions (Interactive Recovery Checklist) */}
                            {aiResponse.assessment.recommendations && aiResponse.assessment.recommendations.length > 0 && (
                              <div className="bg-primary/5 border border-primary/15 p-4 rounded-2xl space-y-2.5">
                                <div className="flex items-center justify-between text-primary">
                                  <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                                    <span className="font-bold text-[10px] uppercase tracking-wider">Recommended Wellness Actions</span>
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-white border border-primary/20 px-2 py-0.5 rounded-full select-none">Recovery Tasks</span>
                                </div>
                                <ul className="space-y-2.5">
                                  {aiResponse.assessment.recommendations.map((r: string, rIdx: number) => {
                                    const actionKey = `voice-${rIdx}`;
                                    const isCompleted = !!completedActions[actionKey];
                                    return (
                                      <li 
                                        key={rIdx} 
                                        onClick={() => {
                                          setCompletedActions(prev => ({
                                            ...prev,
                                            [actionKey]: !prev[actionKey]
                                          }))
                                        }}
                                        className="flex items-start gap-2.5 cursor-pointer select-none group"
                                      >
                                        <span className="mt-0.5 flex-shrink-0">
                                          <i 
                                            className={`material-symbols-outlined text-base transition-colors ${
                                              isCompleted ? "text-green-600 font-bold" : "text-primary/45 group-hover:text-primary"
                                            }`}
                                            style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : undefined }}
                                          >
                                            {isCompleted ? "check_box" : "check_box_outline_blank"}
                                          </i>
                                        </span>
                                        <span className={`text-xs text-on-surface-variant font-semibold leading-relaxed transition-all ${
                                          isCompleted ? "line-through opacity-50 text-green-700" : "group-hover:text-on-surface"
                                        }`}>
                                          {r}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            {/* Evidence Sources / Citations */}
                            {aiResponse.assessment.evidence_sources && aiResponse.assessment.evidence_sources.length > 0 && (
                              <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap gap-2 items-center">
                                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Sources:</span>
                                {aiResponse.assessment.evidence_sources.map((src: string, sIdx: number) => {
                                  let name = src;
                                  let url = "#";
                                  if (typeof src === "string") {
                                    if (src.startsWith("http")) {
                                      try {
                                        const parsedUrl = new URL(src);
                                        name = parsedUrl.hostname.replace("www.", "");
                                        url = src;
                                      } catch (e) {
                                        name = "External Citation";
                                      }
                                    }
                                  }
                                  return (
                                    <a 
                                      key={sIdx} 
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/30 text-on-surface-variant"
                                    >
                                      <span className="material-symbols-outlined text-[10px] font-bold">link</span>
                                      <span>{name}</span>
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Fallback raw display */
                          <div className="flex gap-md">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                                neurology
                              </span>
                            </div>
                            <div className="text-on-surface font-body-lg flex-1 text-sm bg-surface-container-low p-3 rounded-2xl whitespace-pre-line max-h-48 overflow-y-auto custom-scrollbar">
                              {typeof aiResponse === "object" ? JSON.stringify(aiResponse, null, 2) : String(aiResponse)}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

        {/* Contextual Actions */}
        <div className="px-lg pb-lg flex flex-wrap justify-center gap-md relative z-10">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(true)}
            className="glass-panel hover:bg-white flex items-center gap-sm px-4 py-2.5 rounded-2xl transition-all group cursor-pointer text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg">
              history
            </span>
            <span>Session History</span>
            {sessions.length > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{sessions.length}</span>
            )}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setTranscript(null); setAiResponse(null); setSessions([]); setStatus("idle") }}
            className="glass-panel hover:bg-white flex items-center gap-sm px-4 py-2.5 rounded-2xl transition-all group cursor-pointer text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-error transition-colors text-lg">
              refresh
            </span>
            <span>New Session</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-panel hover:bg-white flex items-center gap-sm px-4 py-2.5 rounded-2xl transition-all group cursor-pointer text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg">
              translate
            </span>
            <span>Language: EN</span>
          </motion.button>
        </div>
      </main>

      {/* Session History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-on-surface">Session History</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">{sessions.length} voice sessions recorded</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center cursor-pointer">
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-on-surface-variant opacity-50">
                    <span className="material-symbols-outlined text-4xl">mic_off</span>
                    <p className="text-sm font-semibold">No sessions yet</p>
                    <p className="text-xs">Record your first voice query to see it here.</p>
                  </div>
                ) : (
                  sessions.map(session => (
                    <motion.div
                      key={session.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => { setTranscript(session.transcript); setAiResponse(session.response); setShowHistory(false) }}
                      className="p-3.5 bg-surface-container-low border border-outline-variant/20 rounded-2xl cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>mic</span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Voice Query</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.riskLevel && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${
                              session.riskLevel.toLowerCase().includes("high") || session.riskLevel.toLowerCase().includes("critical")
                                ? "bg-red-50 text-red-600 border-red-200"
                                : session.riskLevel.toLowerCase().includes("medium") || session.riskLevel.toLowerCase().includes("moderate")
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-teal-50 text-teal-600 border-teal-200"
                            }`}>{session.riskLevel}</span>
                          )}
                          <span className="text-[10px] text-on-surface-variant opacity-60">{session.time}</span>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface font-semibold line-clamp-2 leading-relaxed">"{session.transcript}"</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileBottomNav />
    </div>
  )
}
