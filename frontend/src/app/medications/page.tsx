"use client"

import * as React from "react"
import { Sidebar, MobileBottomNav } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { API_URL } from "@/config"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 16 },
  },
}

// Interaction rules
const interactionDatabase: Record<string, { risk: "High" | "Moderate" | "None"; alert: string; recommendation: string }> = {
  "ibuprofen": {
    risk: "Moderate",
    alert: "Interaction with Lisinopril: Combining Ibuprofen and blood pressure support medications like Lisinopril can decrease kidney efficiency and increase blood pressure.",
    recommendation: "Try Acetaminophen (Tylenol) for temporary pain relief, and ensure you drink plenty of water."
  },
  "aspirin": {
    risk: "Moderate",
    alert: "Interaction with Lisinopril: Concomitant usage can place mild strain on kidneys, especially if dehydrated.",
    recommendation: "Ensure daily hydration goals (at least 2.5L) are met, and monitor for changes in urination."
  },
  "metformin": {
    risk: "None",
    alert: "No known adverse interactions with your active supplements (Magnesium, Vitamin D3, Omega-3).",
    recommendation: "Take daily as guided, preferably with your morning meal to minimize stomach sensitivity."
  },
}

export default function MedicationsPage() {
  const [activeMeds, setActiveMeds] = React.useState([
    { name: "Lisinopril", dosage: "10mg", type: "Daily", purpose: "Heart & Blood Pressure" },
    { name: "Magnesium Glycinate", dosage: "400mg", type: "Nightly", purpose: "Sleep & Recovery" },
    { name: "Vitamin D3", dosage: "5000 IU", type: "Daily", purpose: "Immunity" },
    { name: "Omega-3 Fish Oil", dosage: "1000mg", type: "Daily", purpose: "Cardiovascular Health" },
  ])
  
  const [newMed, setNewMed] = React.useState("")
  const [newDosage, setNewDosage] = React.useState("1 Tablet")
  const [interactionResult, setInteractionResult] = React.useState<{
    medName: string
    risk: "High" | "Moderate" | "None"
    alert: string
    recommendation: string
  } | null>(null)
  const [checking, setChecking] = React.useState(false)

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMed.trim()) return

    const name = newMed.trim()
    setChecking(true)
    setInteractionResult(null)

    try {
      const activeMedNames = activeMeds.map((med) => med.name)
      const res = await fetch(`${API_URL}/medications/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medication: name,
          active_medications: activeMedNames,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setInteractionResult({
          medName: name,
          risk: data.risk,
          alert: data.alert,
          recommendation: data.recommendation,
        })
      } else {
        setInteractionResult({
          medName: name,
          risk: "None",
          alert: "Could not analyze interactions. Server returned an error.",
          recommendation: "Ensure MedHive AI backend is running and healthy.",
        })
      }
    } catch (err) {
      console.error(err)
      setInteractionResult({
        medName: name,
        risk: "None",
        alert: "Could not reach the medication check server. Please verify the MedHive backend is active.",
        recommendation: "Please ensure the backend server is running.",
      })
    } finally {
      // Add to list
      setActiveMeds((prev) => [
        { name, dosage: newDosage, type: "Daily", purpose: "General Wellness" },
        ...prev,
      ])

      setNewMed("")
      setNewDosage("1 Tablet")
      setChecking(false)
    }
  }

  const handleRemoveMed = (index: number) => {
    setActiveMeds((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-sans">
      <Sidebar />

      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto custom-scrollbar pb-20 md:pb-0">
        
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring" as const, stiffness: 120 }}
          className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl px-6 py-4 flex justify-between items-center border-b border-outline-variant/30 shadow-sm"
        >
          <div>
            <h1 className="text-xl font-bold">Medication Safety Check</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">Understand potential interactions and safety guidelines for your medications.</p>
          </div>
        </motion.header>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Column 1 & 2: Medications Management */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add Medication form */}
            <motion.div variants={cardVariants}>
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <i className="material-symbols-outlined text-primary">add_circle</i>
                    Add Medication or Supplement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <form onSubmit={handleAddMed} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newMed}
                      onChange={(e) => setNewMed(e.target.value)}
                      placeholder="Type e.g., Ibuprofen, Aspirin..."
                      className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="text"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      placeholder="Dosage (e.g., 200mg)"
                      className="w-full sm:w-36 bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <Button 
                      type="submit" 
                      disabled={checking || !newMed.trim()}
                      className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-primary-container shrink-0 disabled:opacity-50"
                    >
                      {checking ? "Verifying Safety..." : "Check & Add"}
                    </Button>
                  </form>
                  <p className="text-[10px] text-on-surface-variant mt-3 leading-relaxed">
                    💡 Tip: Try typing **Ibuprofen** or **Aspirin** to check for potential interaction rules with Lisinopril.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interactions Report overlay */}
            <AnimatePresence>
              {interactionResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  <Card className={`border-l-4 overflow-hidden ${
                    interactionResult.risk === "High" ? "border-l-error bg-red-50/20" :
                    interactionResult.risk === "Moderate" ? "border-l-amber-500 bg-amber-50/20" :
                    "border-l-tertiary bg-green-50/20"
                  }`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-on-surface">Safety Report: {interactionResult.medName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          interactionResult.risk === "High" ? "bg-red-50 text-red-700 border-red-200" :
                          interactionResult.risk === "Moderate" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-green-50 text-green-700 border-green-200"
                        }`}>
                          {interactionResult.risk} Risk
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs leading-relaxed">
                      <p className="text-on-surface-variant font-medium">
                        ⚠️ {interactionResult.alert}
                      </p>
                      <div className="p-3 bg-white border border-outline-variant/20 rounded-xl">
                        <span className="font-bold text-primary flex items-center gap-1 mb-1">
                          <i className="material-symbols-outlined text-sm">check_circle</i> Recommendations
                        </span>
                        <p className="text-on-surface-variant">{interactionResult.recommendation}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* My Active Medications List */}
            <motion.div variants={cardVariants}>
              <Card className="p-6">
                <CardHeader className="p-0 pb-4 border-b border-outline-variant/10">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <i className="material-symbols-outlined text-primary">medication</i>
                    My Active Medications ({activeMeds.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4 divide-y divide-outline-variant/15">
                  {activeMeds.map((med, index) => (
                    <div key={index} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                          <i className="material-symbols-outlined text-lg">pill</i>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">{med.name}</h4>
                          <p className="text-xs text-on-surface-variant mt-0.5">{med.dosage} · {med.type} · <span className="italic opacity-85">{med.purpose}</span></p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMed(index)}
                        className="text-on-surface-variant/40 hover:text-error transition-colors p-1 rounded-lg cursor-pointer"
                        title="Remove medication"
                      >
                        <i className="material-symbols-outlined text-lg">delete</i>
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Column 3: Safety Guidelines & Reminders */}
          <div className="space-y-6">
            <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold">General Safety Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs leading-relaxed text-on-surface-variant">
                  <div className="flex gap-2">
                    <i className="material-symbols-outlined text-primary text-base shrink-0">info</i>
                    <p>Always space supplement ingestion (like **Magnesium**) at least 2 hours apart from antibiotics or target prescription items.</p>
                  </div>
                  <div className="flex gap-2">
                    <i className="material-symbols-outlined text-primary text-base shrink-0">info</i>
                    <p>Avoid taking multiple pain relief medications (like Ibuprofen and Naproxen) simultaneously to protect stomach lining.</p>
                  </div>
                  <div className="flex gap-2">
                    <i className="material-symbols-outlined text-primary text-base shrink-0">info</i>
                    <p>Always verify with a certified pharmacist when adding prescription elements not logged in your copilot database.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={cardVariants}>
              <Card className="bg-primary/5 border border-primary/15 p-6 rounded-3xl">
                <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                  <i className="material-symbols-outlined text-base">emergency_home</i>
                  Emergency Information
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  MedHive AI is a personal health guide designed to optimize wellness. If you experience critical pain, breathing difficulty, or adverse allergic responses, please dial emergency services immediately.
                </p>
              </Card>
            </motion.div>
          </div>
        </motion.div>

      </main>

      <MobileBottomNav />
    </div>
  )
}
