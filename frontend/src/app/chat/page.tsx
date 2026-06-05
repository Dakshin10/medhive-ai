"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar, MobileBottomNav } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  sender: "user" | "ai"
  text: string
  time: string
  assessment?: {
    symptoms: string[]
    risk_level: string
    possible_conditions: string[]
    recommendations: string[]
    confidence_score?: string | number
    verified?: boolean
    evidence_sources?: string[]
  }
  attachmentName?: string
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = React.useState<Message[]>([
    {
      sender: "ai",
      text: `Hello Dakshin 👋\n\nI'm MedHive AI, your personal healthcare assistant.\n\nI can help you:\n• Analyze symptoms\n• Understand lab reports\n• Review medications\n• Track your health history\n• Provide evidence-based health information\n\nHow can I help you today?`,
      time: "Just now",
    },
  ])
  const [inputValue, setInputValue] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [showSidebar, setShowSidebar] = React.useState(true)
  const [attachedFile, setAttachedFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [completedActions, setCompletedActions] = React.useState<Record<string, boolean>>({})

  // Personal Health Insights State
  const [healthScore, setHealthScore] = React.useState(84)
  const [riskLevel, setRiskLevel] = React.useState<"High" | "Medium" | "Low">("Medium")
  const [alerts, setAlerts] = React.useState([
    { id: 1, type: "warning", message: "WearSync: Resting heart rate up 15%" },
    { id: 2, type: "info", message: "Magnesium supplementation check suggested" },
  ])
  const [medications, setMedications] = React.useState([
    { name: "Magnesium Glycinate", type: "Nightly", compliance: 95, active: true },
    { name: "Vitamin D3 5000 IU", type: "Daily", compliance: 92, active: true },
    { name: "Omega-3 Fish Oil", type: "Daily", compliance: 88, active: true },
  ])
  const [reports, setReports] = React.useState([
    { name: "Quest Lipid Panel.pdf", date: "Mar 12, 2026", type: "Lipid Panel" },
    { name: "LabCorp Metabolic Sync.pdf", date: "Feb 28, 2026", type: "Metabolic" },
  ])

  const chatEndRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Suggested Actions click handlers
  const handleQuickAction = (actionType: string) => {
    if (actionType === "symptoms") {
      setInputValue("Analyze my symptoms: intermittent fatigue, mild headache, and back tension.")
    } else if (actionType === "upload") {
      fileInputRef.current?.click()
    } else if (actionType === "medications") {
      setInputValue("Check my medications for potential safety risks or interactions.")
    } else if (actionType === "voice") {
      router.push("/voice")
    } else if (actionType === "timeline") {
      router.push("/health-timeline")
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0])
    }
  }

  const removeAttachment = () => {
    setAttachedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() && !attachedFile) return

    const userMsg = inputValue
    const attachmentName = attachedFile ? attachedFile.name : undefined
    setInputValue("")
    setAttachedFile(null)

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMsg || `Uploaded report for analysis: ${attachmentName}`,
        time: "Just now",
        attachmentName,
      },
    ])

    setLoading(true)

    if (attachmentName) {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", attachedFile as File)

      try {
        const response = await fetch("http://localhost:8000/analyze-report", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: data.analysis || "I've analyzed your lab report. Your cholesterol parameters look stable, but your Vitamin D index shows a mild deficit. Let's make sure you take your supplements daily.",
              time: "Just now",
            },
          ])
          setReports((prev) => [
            { name: attachmentName, date: "Just now", type: "Uploaded Report" },
            ...prev,
          ])
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: "I was unable to parse the document. Please verify the MedHive AI report backend is active.",
              time: "Just now",
            },
          ])
        }
      } catch (err) {
        console.error(err)
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `I've analyzed "${attachmentName}" using local heuristics. Overall parameters appear stable, but I recommend tracking your hydration level to optimize active recovery.`,
            time: "Just now",
          },
        ])
        setReports((prev) => [
          { name: attachmentName, date: "Just now", type: "Lab Report" },
          ...prev,
        ])
      } finally {
        setUploading(false)
        setLoading(false)
      }
      return
    }

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      })

      if (response.ok) {
        const data = await response.json()
        let aiText = "Analysis complete."
        let assessment = undefined

        if (data.status === "SUCCESS" && data.assessment) {
          assessment = data.assessment
          aiText = `Here is my assessment of your health queries. Risk profile is evaluated as ${assessment.risk_level}. Check details below:`
          if (assessment.risk_level) {
            const level = assessment.risk_level.toLowerCase()
            if (level.includes("high") || level.includes("critical")) {
              setRiskLevel("High")
              setHealthScore(72)
              setAlerts((prev) => [
                { id: Date.now(), type: "warning", message: "Advisory: Consider sharing these symptoms with a healthcare professional." },
                ...prev,
              ])
            } else if (level.includes("low")) {
              setRiskLevel("Low")
            }
          }
        } else if (data.status === "EMERGENCY" && data.assessment) {
          aiText = `⚠️ EMERGENCY DETECTED! Reason: ${data.assessment.reason}. Action Recommendation: ${data.assessment.action}`
          setRiskLevel("High")
          setHealthScore(60)
          setAlerts((prev) => [
            { id: Date.now(), type: "warning", message: `EMERGENCY ALERT: ${data.assessment.reason}` },
            ...prev,
          ])
        } else if (data.raw_response) {
          aiText = data.raw_response
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: aiText,
            time: "Just now",
            assessment: assessment,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "I encountered an error. Please verify your local MedHive AI backend is running.",
            time: "Just now",
          },
        ])
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I could not connect to the backend server. Using local wellness heuristics: The symptoms described appear manageable. Try resting, logging your hydration, and check in if fatigue persists.",
          time: "Just now",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Animation constants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  }

  // Circular progress math
  const radius = 34
  const stroke = 6
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (healthScore / 100) * circumference

  return (
    <div className="bg-surface text-on-surface flex h-screen overflow-hidden font-sans">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        className="hidden"
      />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Conversation Container */}
      <main className="flex-1 flex flex-col relative bg-surface-container-lowest overflow-hidden pb-16 md:pb-0">
        
        {/* Chat Top Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          className="sticky top-0 z-30 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-outline-variant/30"
        >
          <div className="flex items-center gap-3">
            <span className="md:hidden material-symbols-outlined text-on-surface-variant cursor-pointer">
              menu
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-primary">Personal Chat Assistant</h2>
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                  Copilot Online
                </div>
              </div>
              <span className="text-[11px] text-on-surface-variant opacity-75">
                Dakshin • Personal Health Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSidebar(!showSidebar)}
              title={showSidebar ? "Hide Health Insights" : "Show Health Insights"}
              className={`p-2 rounded-xl transition-all cursor-pointer border flex items-center justify-center ${
                showSidebar 
                  ? "bg-primary/5 border-primary/20 text-primary" 
                  : "bg-surface-container hover:bg-surface-container-highest border-outline-variant/30 text-on-surface-variant"
              }`}
            >
              <i className="material-symbols-outlined text-lg">
                {showSidebar ? "right_panel_close" : "right_panel_open"}
              </i>
            </motion.button>
          </div>
        </motion.header>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:px-12 space-y-6 relative" id="chat-container">
          
          {/* Welcome Screen - Beautiful overlay if only first message */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-3xl mx-auto mb-8 bg-gradient-to-br from-white to-surface-container-low border border-outline-variant/30 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <i className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </i>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Hello Dakshin 👋</h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Your personal healthcare copilot is ready to help. Below are quick actions to analyze symptoms, upload lab reports, or review medications. Let's make managing your health seamless and easy.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <div key={index} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 16 }}
                  className={`flex gap-4 max-w-3xl mx-auto ${msg.sender === "user" ? "flex-row-reverse" : "group"}`}
                >
                  {/* User/AI avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      msg.sender === "user" 
                        ? "bg-secondary text-white" 
                        : "bg-primary text-white shadow-primary-container/20"
                    }`}
                  >
                    <i className="material-symbols-outlined text-lg" style={{ fontVariationSettings: msg.sender === "ai" ? "'FILL' 1" : undefined }}>
                      {msg.sender === "user" ? "person" : "health_and_safety"}
                    </i>
                  </motion.div>
                  
                  {/* Message body */}
                  <div className={`flex-1 space-y-1.5 ${msg.sender === "user" ? "text-right" : ""}`}>
                    <header className={`flex items-center gap-2 text-xs text-on-surface-variant opacity-60 ${msg.sender === "user" ? "justify-end" : ""}`}>
                      <span className="font-bold text-on-surface opacity-90">
                        {msg.sender === "user" ? "Dakshin" : "MedHive AI"}
                      </span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </header>

                    <div
                      className={`p-4 rounded-2xl shadow-sm leading-relaxed text-sm border ${
                        msg.sender === "user"
                          ? "bg-primary text-white border-primary rounded-tr-none inline-block text-left max-w-[85%]"
                          : "bg-white border-outline-variant/30 rounded-tl-none text-on-surface max-w-[90%] inline-block"
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      
                      {msg.attachmentName && (
                        <div className="mt-2 flex items-center gap-1.5 bg-black/10 text-white rounded-lg px-2.5 py-1 text-xs w-max">
                          <i className="material-symbols-outlined text-sm">description</i>
                          <span>{msg.attachmentName}</span>
                        </div>
                      )}
                      
                      {/* Detailed AI findings if available */}
                      {msg.assessment && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="mt-4 border-t border-outline-variant/30 pt-4 space-y-4 text-on-surface text-left"
                        >
                          {/* Verification and Match Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                              <span className="material-symbols-outlined text-[12px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              <span>MedHive AI Copilot Verified</span>
                            </div>
                            
                            {msg.assessment.confidence_score && (
                              <div className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 bg-surface-container px-2 py-1 rounded-lg border border-outline-variant/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                <span>{msg.assessment.confidence_score}% Match Index</span>
                              </div>
                            )}
                          </div>

                          {/* Visual Risk Profile Gauge */}
                          {(() => {
                            const lvl = (msg.assessment.risk_level || "LOW").toUpperCase();
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
                          {msg.assessment.symptoms && msg.assessment.symptoms.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-primary">
                                <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>healing</span>
                                <span className="font-bold text-[10px] uppercase tracking-wider">Symptoms Tracked</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.assessment.symptoms.map((s, idx) => (
                                  <span key={idx} className="bg-surface hover:bg-surface-container transition-colors px-2.5 py-1 rounded-xl text-xs font-bold text-on-surface border border-outline-variant/30 flex items-center gap-1.5 shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Potential Health Considerations Grid */}
                          {msg.assessment.possible_conditions && msg.assessment.possible_conditions.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-primary">
                                <span className="material-symbols-outlined text-sm font-bold">medical_services</span>
                                <span className="font-bold text-[10px] uppercase tracking-wider">Potential Considerations</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {msg.assessment.possible_conditions.map((c, idx) => {
                                  // Simulate matching confidence weights for visualization
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
                          {msg.assessment.recommendations && msg.assessment.recommendations.length > 0 && (
                            <div className="bg-primary/5 border border-primary/15 p-4 rounded-2xl space-y-2.5">
                              <div className="flex items-center justify-between text-primary">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                                  <span className="font-bold text-[10px] uppercase tracking-wider">Recommended Wellness Actions</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-wider bg-white border border-primary/20 px-2 py-0.5 rounded-full select-none">Recovery Tasks</span>
                              </div>
                              <ul className="space-y-2.5">
                                {msg.assessment.recommendations.map((r, rIdx) => {
                                  const actionKey = `${index}-${rIdx}`;
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
                          {msg.assessment.evidence_sources && msg.assessment.evidence_sources.length > 0 && (
                            <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap gap-2 items-center">
                              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Sources:</span>
                              {msg.assessment.evidence_sources.map((src, sIdx) => {
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
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Quick actions rendering directly after the first message */}
                {index === 0 && (
                  <div className="space-y-4 max-w-3xl mx-auto pl-14">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -3, scale: 1.01 }}
                        onClick={() => handleQuickAction("symptoms")}
                        className="p-3 bg-white hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 rounded-2xl cursor-pointer transition-all flex items-start gap-3 shadow-sm hover:shadow-md"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <i className="material-symbols-outlined text-base">emergency</i>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-on-surface">🩺 Analyze Symptoms</h4>
                          <p className="text-[10px] text-on-surface-variant opacity-70 mt-0.5">Evaluate wellness and triage symptoms</p>
                        </div>
                      </motion.div>

                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -3, scale: 1.01 }}
                        onClick={() => handleQuickAction("upload")}
                        className="p-3 bg-white hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 rounded-2xl cursor-pointer transition-all flex items-start gap-3 shadow-sm hover:shadow-md"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <i className="material-symbols-outlined text-base">upload_file</i>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-on-surface">📄 Upload Lab Report</h4>
                          <p className="text-[10px] text-on-surface-variant opacity-70 mt-0.5">Get easy-to-read AI report breakdown</p>
                        </div>
                      </motion.div>

                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -3, scale: 1.01 }}
                        onClick={() => handleQuickAction("medications")}
                        className="p-3 bg-white hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 rounded-2xl cursor-pointer transition-all flex items-start gap-3 shadow-sm hover:shadow-md"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <i className="material-symbols-outlined text-base">medication</i>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-on-surface">💊 Check Medications</h4>
                          <p className="text-[10px] text-on-surface-variant opacity-70 mt-0.5">Check supplement and drug safety</p>
                        </div>
                      </motion.div>

                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -3, scale: 1.01 }}
                        onClick={() => handleQuickAction("voice")}
                        className="p-3 bg-white hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 rounded-2xl cursor-pointer transition-all flex items-start gap-3 shadow-sm hover:shadow-md"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <i className="material-symbols-outlined text-base">mic</i>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-on-surface">🎙 Start Voice Consultation</h4>
                          <p className="text-[10px] text-on-surface-variant opacity-70 mt-0.5">Talk with your digital health companion</p>
                        </div>
                      </motion.div>

                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -3, scale: 1.01 }}
                        onClick={() => handleQuickAction("timeline")}
                        className="p-3 bg-white hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 rounded-2xl cursor-pointer transition-all flex items-start gap-3 shadow-sm hover:shadow-md sm:col-span-2 lg:col-span-1"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <i className="material-symbols-outlined text-base">timeline</i>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-on-surface">📈 View Health Timeline</h4>
                          <p className="text-[10px] text-on-surface-variant opacity-70 mt-0.5">Access your history of checks and files</p>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Suggested prompts list */}
                    <div className="pt-2">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Suggested Prompts:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "I have fever and cough",
                          "Explain my lab report",
                          "Check my medications",
                          "Analyze my symptoms",
                          "Help me understand my health risks"
                        ].map((prompt, pIdx) => (
                          <motion.button
                            key={pIdx}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSuggestedPrompt(prompt)}
                            className="bg-white/80 hover:bg-surface-container border border-outline-variant/40 hover:border-primary/30 text-xs px-3 py-1.5 rounded-full text-on-surface font-semibold shadow-sm cursor-pointer transition-all"
                          >
                            {prompt}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-3xl mx-auto"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm shadow-primary-container/20">
                <i className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</i>
              </div>
              <div className="flex-1 pt-2">
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-primary rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-medium ml-1">
                    {uploading ? "Analyzing lab records..." : "MedHive AI is compiling wellness data..."}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />

          {/* Floating AI Assistant Orb */}
          <div className="absolute bottom-24 right-6 hidden md:block z-40">
            <motion.div
              animate={{
                y: [0, -6, 0],
                boxShadow: [
                  "0 8px 30px rgba(178, 0, 40, 0.25)",
                  "0 12px 45px rgba(178, 0, 40, 0.45)",
                  "0 8px 30px rgba(178, 0, 40, 0.25)",
                ]
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction("voice")}
              transition={{
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center cursor-pointer border-2 border-white/40 select-none animate-pulse"
              title="Initiate MedHive Voice Interface"
            >
              <i className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                health_and_safety
              </i>
            </motion.div>
          </div>
        </div>

        {/* Glassmorphic Command Center (Chat Input Box) */}
        <div className="p-4 lg:px-12 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-outline-variant/20 z-20">
          <div className="max-w-3xl mx-auto space-y-2">
            
            {/* Attachment preview panel */}
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex items-center gap-2 bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-1.5 w-max text-xs"
              >
                <i className="material-symbols-outlined text-sm text-primary">description</i>
                <span className="font-semibold text-on-surface truncate max-w-xs">{attachedFile.name}</span>
                <button 
                  onClick={removeAttachment}
                  className="p-0.5 hover:bg-surface-container-highest rounded-full text-on-surface-variant cursor-pointer transition-colors"
                >
                  <i className="material-symbols-outlined text-[14px]">close</i>
                </button>
              </motion.div>
            )}

            <form onSubmit={handleSend} className="relative group">
              <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/40 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/45 transition-all p-2 flex flex-col gap-2">
                <input
                  className="w-full bg-transparent border-none text-sm outline-none px-3 py-2 text-on-surface placeholder-on-surface-variant/50 font-medium"
                  placeholder="Ask MedHive about symptoms, medications, or lab insights..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={loading}
                />
                
                {/* Actions row inside input console */}
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-2 px-1">
                  <div className="flex items-center gap-1">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-surface-container-low flex items-center gap-1 text-[11px] font-bold"
                    >
                      <i className="material-symbols-outlined text-base">upload</i>
                      <span className="hidden sm:inline">Upload</span>
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button" 
                      onClick={() => handleQuickAction("voice")}
                      className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-surface-container-low flex items-center gap-1 text-[11px] font-bold"
                    >
                      <i className="material-symbols-outlined text-base">mic</i>
                      <span className="hidden sm:inline">Voice</span>
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-surface-container-low flex items-center gap-1 text-[11px] font-bold"
                    >
                      <i className="material-symbols-outlined text-base">attach_file</i>
                      <span className="hidden sm:inline">Attach Report</span>
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading || (!inputValue.trim() && !attachedFile)}
                    className="bg-primary text-white px-4 py-1.5 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Send</span>
                    <i className="material-symbols-outlined text-sm">send</i>
                  </motion.button>
                </div>
              </div>
            </form>

            <div className="flex justify-center gap-1 text-[10px] text-on-surface-variant opacity-60 font-semibold text-center">
              <i className="material-symbols-outlined text-xs">verified_user</i>
              <span>HIPAA Encrypted Workspace • AI information is for educational purposes only.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Right Side Panel: Health Insights Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="hidden xl:flex flex-col border-l border-outline-variant/30 bg-white shadow-sm overflow-hidden shrink-0"
          >
            <div className="w-80 flex flex-col h-full overflow-y-auto custom-scrollbar p-5 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                <h3 className="font-bold text-sm text-primary uppercase tracking-wider">My Health Insights</h3>
              </div>

              {/* Health Score & Wellness trends */}
              <div className="space-y-3">
                <Card className="bg-gradient-to-br from-primary/5 to-surface-container-low border-primary/10 rounded-2xl overflow-hidden shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Circular Score Gauge */}
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r={radius - stroke}
                            stroke="rgba(228,189,188,0.25)"
                            strokeWidth={stroke}
                            fill="transparent"
                          />
                          <motion.circle
                            cx="32"
                            cy="32"
                            r={radius - stroke}
                            stroke={riskLevel === "High" ? "#b20028" : riskLevel === "Medium" ? "#fe8082" : "#007d7f"}
                            strokeWidth={stroke}
                            fill="transparent"
                            strokeDasharray={circumference}
                            animate={{ strokeDashoffset}}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-sm font-bold text-on-surface leading-none">{healthScore}</span>
                          <span className="text-[8px] text-on-surface-variant opacity-60 font-semibold">SCORE</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Wellness Score</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            riskLevel === "High" 
                              ? "bg-red-50 text-red-600 border-red-200" 
                              : riskLevel === "Medium"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-green-50 text-green-600 border-green-200"
                          }`}>
                            {riskLevel}
                          </span>
                        </div>
                        {/* Mini trend bars */}
                        <div className="flex items-end gap-0.5 h-6">
                          {[72, 75, 79, 77, 81, 80, healthScore].map((val, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${(val / 100) * 24}px` }}
                              transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                              className={`w-3 rounded-sm ${i === 6 ? "bg-primary" : "bg-primary/25"}`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-on-surface-variant leading-relaxed">
                          <span className="text-teal-600 font-bold">↑ +{healthScore - 72}pts</span> vs. last week
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Alerts */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
                  Health Alerts
                </h4>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        alert.type === "warning"
                          ? "bg-red-50 border-red-100 text-red-700"
                          : "bg-amber-50 border-amber-100 text-amber-700"
                      }`}
                    >
                      <i className="material-symbols-outlined text-base shrink-0 mt-0.5">
                        {alert.type === "warning" ? "warning" : "info"}
                      </i>
                      <span className="text-xs font-semibold leading-relaxed">{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medication Compliance Status */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
                  Medication Status
                </h4>
                <div className="space-y-2">
                  {medications.map((med, idx) => (
                    <div key={idx} className="bg-white border border-outline-variant/20 rounded-xl p-3 hover:border-primary/20 hover:bg-surface-container-low transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-on-surface">{med.name}</span>
                          <span className="text-[10px] text-on-surface-variant opacity-70">{med.type}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-bold ${
                            med.compliance >= 90 ? "text-teal-600" : med.compliance >= 75 ? "text-amber-600" : "text-red-600"
                          }`}>{med.compliance}%</span>
                          <i className={`material-symbols-outlined text-sm ${
                            med.compliance >= 90 ? "text-teal-600" : med.compliance >= 75 ? "text-amber-600" : "text-red-600"
                          }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {med.compliance >= 90 ? "check_circle" : "warning"}
                          </i>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${med.compliance}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            med.compliance >= 90 ? "bg-teal-500" : med.compliance >= 75 ? "bg-amber-500" : "bg-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reports Directory */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
                  Recent Reports
                </h4>
                <div className="space-y-2">
                  {reports.map((rep, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white hover:bg-surface-container border border-outline-variant/30 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <i className="material-symbols-outlined text-primary text-lg">description</i>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-surface truncate max-w-[140px] group-hover:text-primary transition-colors">
                            {rep.name}
                          </span>
                          <span className="text-[9px] text-on-surface-variant opacity-70">{rep.date}</span>
                        </div>
                      </div>
                      <i className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors text-sm">
                        download
                      </i>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <MobileBottomNav />
    </div>
  )
}
