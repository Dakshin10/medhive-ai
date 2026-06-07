"use client"

import * as React from "react"
import { Sidebar, MobileBottomNav } from "@/components/Sidebar"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
}

type ToggleProps = {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}
function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-start gap-4 py-3 text-xs">
      <div className="flex-1">
        <p className="font-bold text-on-surface">{label}</p>
        {description && <p className="text-[10px] text-on-surface-variant opacity-75 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0 cursor-pointer ${checked ? "bg-primary" : "bg-outline-variant"}`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 700, damping: 35 }}
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md ${checked ? "left-5" : "left-0.5"}`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [notifications, setNotifications] = React.useState(true)
  const [aiInsights, setAiInsights] = React.useState(true)
  const [voiceEnabled, setVoiceEnabled] = React.useState(true)
  const [saveHistory, setSaveHistory] = React.useState(true)
  const [twoFactor, setTwoFactor] = React.useState(false)
  const [biometrics, setBiometrics] = React.useState(false)
  const [dataSharing, setDataSharing] = React.useState(false)
  const [compactMode, setCompactMode] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState("profile")
  const [saved, setSaved] = React.useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const sections = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "ai", label: "AI Preferences", icon: "smart_toy" },
    { id: "security", label: "Security", icon: "security" },
    { id: "privacy", label: "Privacy", icon: "privacy_tip" },
    { id: "appearance", label: "Appearance", icon: "palette" },
    { id: "integrations", label: "Integrations", icon: "extension" },
  ]

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-sans">
      <Sidebar />

      <main className="flex-1 min-h-screen overflow-y-auto custom-scrollbar pb-20 md:pb-0">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring" as const, stiffness: 120 }}
          className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl px-6 py-4 border-b border-outline-variant/30 shadow-sm flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">Manage your MedHive AI preferences</p>
          </div>
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 bg-tertiary text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
              >
                <i className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}>check_circle</i>
                Settings saved!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 max-w-5xl mx-auto w-full">
          <div className="flex gap-6 items-start">
            {/* Sidebar nav for settings */}
            <motion.div variants={cardVariants} className="w-52 shrink-0 hidden md:block">
              <Card className="p-2 sticky top-24">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 text-left cursor-pointer ${
                      activeSection === s.id
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <i className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: activeSection === s.id ? "'FILL' 1" : "'FILL' 0", fontSize: "18px" }}>{s.icon}</i>
                    {s.label}
                  </button>
                ))}
                <div className="border-t border-outline-variant/10 my-2 pt-2" />
                <a
                  href="https://github.com/Dakshin10/medhive-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
                >
                  <i className="material-symbols-outlined shrink-0" style={{ fontSize: "18px" }}>code</i>
                  GitHub Repository
                </a>
              </Card>
            </motion.div>

            {/* Mobile section tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:hidden mb-4 -mx-6 px-6 w-full">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                    activeSection === s.id
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-outline-variant text-on-surface-variant"
                  }`}
                >
                  <i className="material-symbols-outlined" style={{ fontSize: "14px" }}>{s.icon}</i>
                  {s.label}
                </button>
              ))}
              <a
                href="https://github.com/Dakshin10/medhive-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer bg-white border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary"
              >
                <i className="material-symbols-outlined" style={{ fontSize: "14px" }}>code</i>
                GitHub
              </a>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-5">

              <AnimatePresence mode="wait">
                {/* PROFILE */}
                {activeSection === "profile" && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                    <motion.div variants={cardVariants}>
                      <Card className="p-6">
                        <h2 className="font-bold text-base mb-5 flex items-center gap-2">
                          <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>person</i>
                          Personal Information
                        </h2>
                        
                        {/* Removed the profile picture element and updated name headers */}
                        <div className="mb-6 pb-4 border-b border-outline-variant/15">
                          <h3 className="font-bold text-lg text-on-surface">Dakshin</h3>
                          <p className="text-xs text-on-surface-variant mt-0.5">Patient Account · dakshin@medhive.ai</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "First Name", value: "Dakshin", icon: "person" },
                            { label: "Last Name", value: "", icon: "person", placeholder: "Optional" },
                            { label: "Email Address", value: "dakshin@medhive.ai", icon: "email" },
                            { label: "Phone Number", value: "+1 (555) 389-2810", icon: "phone" },
                            { label: "Emergency Contact Name", value: "Priya Patel", icon: "contact_emergency" },
                            { label: "Emergency Contact Phone", value: "+1 (555) 478-2910", icon: "call" },
                          ].map((field) => (
                            <div key={field.label}>
                              <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">{field.label}</label>
                              <div className="relative">
                                <i className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "16px" }}>{field.icon}</i>
                                <input
                                  defaultValue={field.value}
                                  placeholder={field.placeholder}
                                  className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>

                    <motion.div variants={cardVariants}>
                      <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border border-outline-variant/30 grid grid-cols-1 md:grid-cols-4 gap-4 items-start md:items-center">
                        <div className="space-y-1 md:col-span-3 w-full">
                          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                            <i className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>code</i>
                            Project Information
                          </h3>
                          <p className="text-xs text-on-surface-variant leading-relaxed font-medium max-w-2xl">
                            MedHive AI is a production-grade Multi-Agent Healthcare Copilot. Explore the codebase, review issues, or star the project on GitHub.
                          </p>
                        </div>
                        <div className="md:justify-self-end flex">
                          <a
                            href="https://github.com/Dakshin10/medhive-ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-primary-container shrink-0 transition-colors flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
                          >
                            <i className="material-symbols-outlined" style={{ fontSize: "16px" }}>star</i>
                            View on GitHub
                          </a>
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}

                {/* NOTIFICATIONS */}
                {activeSection === "notifications" && (
                  <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <Card className="p-6">
                      <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                        <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>notifications</i>
                        Notification Preferences
                      </h2>
                      <div className="divide-y divide-outline-variant/30">
                        <Toggle checked={notifications} onChange={setNotifications} label="Push Notifications" description="Receive real-time alerts for medication reminders and goal updates" />
                        <Toggle checked={aiInsights} onChange={setAiInsights} label="AI Insight Alerts" description="Get notified when AI processes new logs or wellness trends" />
                        <Toggle checked={true} onChange={() => {}} label="Medication Reminders" description="Reminders to record your daily medication checklists" />
                        <Toggle checked={true} onChange={() => {}} label="Lab Result Notifications" description="Immediate alert when new lab reports are explained" />
                        <Toggle checked={false} onChange={() => {}} label="Wellness Tips" description="Weekly health summaries and wellness suggestions" />
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* AI PREFERENCES */}
                {activeSection === "ai" && (
                  <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <Card className="p-6">
                      <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                        <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>smart_toy</i>
                        AI Engine Settings
                      </h2>
                      <div className="divide-y divide-outline-variant/30">
                        <Toggle checked={aiInsights} onChange={setAiInsights} label="Proactive AI Analysis" description="AI automatically parses wearable updates and flags concerns" />
                        <Toggle checked={voiceEnabled} onChange={setVoiceEnabled} label="Voice Assistant" description="Enable voice interactions with MedHive AI" />
                        <Toggle checked={saveHistory} onChange={setSaveHistory} label="Save Conversation History" description="Store AI chat logs for personal health continuity" />
                        <Toggle checked={true} onChange={() => {}} label="Evidence-Based Suggestions" description="AI references standard wellness guides in responses" />
                        <Toggle checked={false} onChange={() => {}} label="Experimental Features" description="Try new health companion capabilities early" />
                      </div>

                      <div className="mt-5 pt-5 border-t border-outline-variant/30">
                        <label className="text-xs font-bold text-on-surface-variant mb-2 block">AI Confidence Threshold</label>
                        <div className="flex items-center gap-4">
                          <input type="range" min="50" max="99" defaultValue="80" className="flex-1 accent-primary cursor-pointer" />
                          <span className="text-sm font-bold text-primary w-10">80%</span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-1">AI only presents insights above this confidence level</p>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* SECURITY */}
                {activeSection === "security" && (
                  <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <Card className="p-6">
                      <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                        <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>security</i>
                        Security Settings
                      </h2>
                      <div className="divide-y divide-outline-variant/30 mb-5 text-xs">
                        <Toggle checked={twoFactor} onChange={setTwoFactor} label="Two-Factor Authentication" description="Add extra code layer to secure your wellness records" />
                        <Toggle checked={biometrics} onChange={setBiometrics} label="Biometric Login" description="Use fingerprint or Face ID to sign in" />
                      </div>

                      <div className="space-y-3 text-xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Password</h3>
                        {["Current Password", "New Password", "Confirm Password"].map((label) => (
                          <div key={label}>
                            <label className="text-xs font-semibold text-on-surface-variant mb-1 block">{label}</label>
                            <input type="password" className="w-full px-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••••" />
                          </div>
                        ))}
                        <button className="mt-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-container transition-colors cursor-pointer">
                          Update Password
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* PRIVACY */}
                {activeSection === "privacy" && (
                  <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <Card className="p-6">
                      <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                        <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>privacy_tip</i>
                        Privacy & Data Controls
                      </h2>
                      <div className="divide-y divide-outline-variant/30 mb-5">
                        <Toggle checked={dataSharing} onChange={setDataSharing} label="Anonymous Data Sharing" description="Help refine wellness models using encrypted de-identified logs" />
                        <Toggle checked={saveHistory} onChange={setSaveHistory} label="Retain Chat History" description="Store AI conversation history securely" />
                      </div>
                      <div className="p-4 bg-surface-container-low rounded-2xl text-xs text-on-surface-variant space-y-2">
                        <p className="font-bold text-on-surface">Data Compliance Status</p>
                        <div className="flex items-center gap-2">
                          <i className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}>verified_user</i>
                          <span>End-to-end data encryption: Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}>verified_user</i>
                          <span>Device local synchronization: Active</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* APPEARANCE */}
                {activeSection === "appearance" && (
                  <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <Card className="p-6">
                      <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                        <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>palette</i>
                        Appearance
                      </h2>
                      <div className="divide-y divide-outline-variant/30 mb-5">
                        <Toggle checked={compactMode} onChange={setCompactMode} label="Compact Mode" description="Reduce padding for higher information density" />
                        <Toggle checked={true} onChange={() => {}} label="Animations" description="Enable smooth page entries and micro-animations" />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-on-surface-variant">Theme Color</label>
                        <div className="flex gap-3">
                          {[
                            { color: "#b20028", label: "Rose (Default)" },
                            { color: "#1a6b8a", label: "Ocean" },
                            { color: "#2d7d46", label: "Forest" },
                            { color: "#5c35b5", label: "Violet" },
                          ].map((t) => (
                            <button
                              key={t.label}
                              title={t.label}
                              className="w-10 h-10 rounded-full border-2 transition-all hover:scale-110 cursor-pointer"
                              style={{ backgroundColor: t.color, borderColor: t.color === "#b20028" ? "white" : "transparent", outline: t.color === "#b20028" ? `3px solid ${t.color}` : "none" }}
                            />
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* INTEGRATIONS */}
                {activeSection === "integrations" && (
                  <motion.div key="integrations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <Card className="p-6">
                      <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                        <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>extension</i>
                        Connected Health Sources
                      </h2>
                      <div className="space-y-3">
                        {[
                          { name: "Apple Health", status: "connected", icon: "monitor_heart", desc: "Wearable vitals, recovery indexes, and activity streams" },
                          { name: "Quest Diagnostics", status: "connected", icon: "science", desc: "Lab result automatic imports" },
                          { name: "Personal Pharmacy Sync", status: "connected", icon: "medication", desc: "Sync active prescription checks" },
                          { name: "Fitbit Integration", status: "disconnected", icon: "watch", desc: "Backup wearable step & calorie logging" },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 text-xs">
                            <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
                              <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>{integration.icon}</i>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm">{integration.name}</p>
                              <p className="text-[10px] text-on-surface-variant mt-0.5">{integration.desc}</p>
                            </div>
                            <button
                              className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                                integration.status === "connected"
                                  ? "text-tertiary bg-tertiary/10 border-tertiary/20 hover:bg-error/10 hover:text-error hover:border-error/20"
                                  : "text-primary bg-primary/10 border-primary/20 hover:bg-primary hover:text-white"
                              }`}
                            >
                              {integration.status === "connected" ? "Connected" : "Connect"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save Button */}
              <motion.div variants={cardVariants} className="flex justify-end gap-3 pt-2">
                <button className="px-6 py-2 border border-outline-variant rounded-xl text-xs font-bold hover:bg-surface-container transition-colors cursor-pointer">
                  Discard Changes
                </button>
                <motion.button
                  onClick={handleSave}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Save Changes
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      <MobileBottomNav />
    </div>
  )
}
