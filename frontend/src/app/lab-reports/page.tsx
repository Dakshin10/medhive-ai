"use client"

import * as React from "react"
import { Sidebar, MobileBottomNav } from "@/components/Sidebar"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

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

interface Biomarker {
  name: string
  value: string
  unit: string
  range: string
  status: "optimal" | "borderline" | "high" | "low"
  trend?: "up" | "down" | "stable"
  trendNote?: string
}

interface LabReport {
  id: string
  name: string
  date: string
  status: "analyzed" | "pending" | "processing"
  risk: "normal" | "moderate" | "high"
  source: string
  physician?: string
  orderNumber?: string
  highlights: string[]
  icon: string
  biomarkers?: Biomarker[]
  summary?: string
  nextTest?: string
}

const mockReports: LabReport[] = [
  {
    id: "RPT-001",
    name: "Complete Blood Count (CBC)",
    date: "2026-06-05",
    status: "analyzed",
    risk: "normal",
    source: "Quest Diagnostics",
    physician: "Dr. Sarah Thompson",
    orderNumber: "QD-2026-88271",
    highlights: ["Red Blood Cells: Normal", "White Blood Cells: Normal", "Platelets: Normal"],
    icon: "water_drop",
    summary: "All CBC parameters fall within healthy reference ranges. Hemoglobin and hematocrit values are optimal, indicating good oxygen-carrying capacity. No signs of anemia or infection.",
    nextTest: "6 months",
    biomarkers: [
      { name: "Hemoglobin", value: "14.8", unit: "g/dL", range: "13.5–17.5", status: "optimal", trend: "stable" },
      { name: "Hematocrit", value: "44.2", unit: "%", range: "41–53", status: "optimal", trend: "stable" },
      { name: "RBC Count", value: "4.9", unit: "M/µL", range: "4.7–6.1", status: "optimal", trend: "up", trendNote: "+0.2 since last test" },
      { name: "WBC Count", value: "6.8", unit: "K/µL", range: "4.5–11.0", status: "optimal", trend: "stable" },
      { name: "Platelets", value: "245", unit: "K/µL", range: "150–400", status: "optimal", trend: "stable" },
      { name: "MCV", value: "88", unit: "fL", range: "80–100", status: "optimal", trend: "stable" },
    ],
  },
  {
    id: "RPT-002",
    name: "Lipid Panel",
    date: "2026-06-03",
    status: "analyzed",
    risk: "moderate",
    source: "LabCorp",
    physician: "Dr. James Rivera",
    orderNumber: "LC-2026-45922",
    highlights: ["LDL Cholesterol: 128 mg/dL (Borderline High)", "HDL Cholesterol: 52 mg/dL (Normal)", "Triglycerides: 168 mg/dL (Borderline)"],
    icon: "favorite",
    summary: "Your lipid panel shows borderline values for LDL and Triglycerides. These are manageable with dietary modifications — reducing saturated fats and increasing omega-3 intake is recommended. Follow-up in 3 months.",
    nextTest: "3 months",
    biomarkers: [
      { name: "Total Cholesterol", value: "201", unit: "mg/dL", range: "<200", status: "borderline", trend: "down", trendNote: "-12 mg/dL since last" },
      { name: "LDL Cholesterol", value: "128", unit: "mg/dL", range: "<100 optimal", status: "borderline", trend: "down", trendNote: "-8 mg/dL since last" },
      { name: "HDL Cholesterol", value: "52", unit: "mg/dL", range: ">40", status: "optimal", trend: "up", trendNote: "+4 mg/dL since last" },
      { name: "Triglycerides", value: "168", unit: "mg/dL", range: "<150", status: "borderline", trend: "down", trendNote: "Improving" },
      { name: "VLDL", value: "33.6", unit: "mg/dL", range: "<30", status: "borderline", trend: "stable" },
      { name: "Non-HDL Cholesterol", value: "149", unit: "mg/dL", range: "<130", status: "high", trend: "down" },
    ],
  },
  {
    id: "RPT-003",
    name: "Thyroid Function Panel",
    date: "2026-05-28",
    status: "analyzed",
    risk: "normal",
    source: "Quest Diagnostics",
    physician: "Dr. Angela Patel",
    orderNumber: "QD-2026-79104",
    highlights: ["TSH: 2.1 mIU/L (Optimal)", "T3 & T4: Balanced", "No Thyroid Antibodies Detected"],
    icon: "psychology",
    summary: "Thyroid function is well-regulated. TSH is in the optimal zone (1–3 mIU/L). Free T3 and T4 are balanced with no signs of hypothyroidism or hyperthyroidism. No thyroid antibodies detected.",
    nextTest: "12 months",
    biomarkers: [
      { name: "TSH", value: "2.1", unit: "mIU/L", range: "0.4–4.0", status: "optimal", trend: "stable" },
      { name: "Free T4", value: "1.18", unit: "ng/dL", range: "0.8–1.8", status: "optimal", trend: "stable" },
      { name: "Free T3", value: "3.2", unit: "pg/mL", range: "2.3–4.2", status: "optimal", trend: "stable" },
      { name: "Anti-TPO Antibodies", value: "<5", unit: "IU/mL", range: "<35", status: "optimal", trend: "stable" },
    ],
  },
  {
    id: "RPT-004",
    name: "Comprehensive Metabolic Panel",
    date: "2026-05-20",
    status: "analyzed",
    risk: "high",
    source: "BioReference",
    physician: "Dr. Michael Chen",
    orderNumber: "BR-2026-31820",
    highlights: ["Fasting Glucose: 112 mg/dL (Pre-diabetic)", "ALT: Slightly Elevated", "Kidney Function: Normal"],
    icon: "science",
    summary: "Two markers require attention: fasting glucose is in the pre-diabetic range (100–125 mg/dL) and liver enzyme ALT is slightly elevated. Lifestyle modifications including reduced sugar intake, increased physical activity, and reduced alcohol consumption are strongly recommended.",
    nextTest: "6 weeks",
    biomarkers: [
      { name: "Fasting Glucose", value: "112", unit: "mg/dL", range: "70–99 normal", status: "high", trend: "up", trendNote: "+8 mg/dL since last" },
      { name: "HbA1c", value: "5.9", unit: "%", range: "<5.7 normal", status: "borderline", trend: "up", trendNote: "Pre-diabetic threshold" },
      { name: "Creatinine", value: "0.92", unit: "mg/dL", range: "0.74–1.35", status: "optimal", trend: "stable" },
      { name: "BUN", value: "18", unit: "mg/dL", range: "7–25", status: "optimal", trend: "stable" },
      { name: "ALT (SGPT)", value: "52", unit: "U/L", range: "7–40", status: "high", trend: "down", trendNote: "Improving, was 68" },
      { name: "AST (SGOT)", value: "38", unit: "U/L", range: "10–40", status: "optimal", trend: "down" },
      { name: "Sodium", value: "141", unit: "mEq/L", range: "136–145", status: "optimal", trend: "stable" },
      { name: "Potassium", value: "4.1", unit: "mEq/L", range: "3.5–5.1", status: "optimal", trend: "stable" },
    ],
  },
  {
    id: "RPT-005",
    name: "HbA1c & Glucose Panel",
    date: "2026-05-15",
    status: "analyzed",
    risk: "moderate",
    source: "Quest Diagnostics",
    physician: "Dr. Sarah Thompson",
    orderNumber: "QD-2026-71643",
    highlights: ["HbA1c: 5.9% (Pre-diabetic Range)", "Average Glucose: 123 mg/dL", "Trend: Improving"],
    icon: "glucose",
    summary: "HbA1c of 5.9% places you in the pre-diabetic range. This is a warning sign to take action now. With targeted dietary changes and a consistent exercise routine, many patients successfully reverse pre-diabetes within 3–6 months.",
    nextTest: "3 months",
    biomarkers: [
      { name: "HbA1c", value: "5.9", unit: "%", range: "<5.7 normal", status: "borderline", trend: "up", trendNote: "Monitor closely" },
      { name: "Estimated Average Glucose", value: "123", unit: "mg/dL", range: "<117", status: "borderline", trend: "stable" },
      { name: "Fasting Glucose", value: "108", unit: "mg/dL", range: "70–99 normal", status: "high", trend: "stable" },
      { name: "Insulin (fasting)", value: "9.2", unit: "µIU/mL", range: "2.6–24.9", status: "optimal", trend: "stable" },
    ],
  },
]

const riskConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: string; barColor: string }> = {
  normal: {
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    label: "Optimal",
    icon: "check_circle",
    barColor: "#006264",
  },
  moderate: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Review Needed",
    icon: "warning",
    barColor: "#d97706",
  },
  high: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Action Recommended",
    icon: "priority_high",
    barColor: "#ba1a1a",
  },
}

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
  optimal: { color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200", label: "Optimal", icon: "check_circle" },
  borderline: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Borderline", icon: "warning" },
  high: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "Elevated", icon: "arrow_upward" },
  low: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", label: "Low", icon: "arrow_downward" },
}

const trendConfig = {
  up: { color: "text-red-600", icon: "trending_up" },
  down: { color: "text-teal-600", icon: "trending_down" },
  stable: { color: "text-on-surface-variant", icon: "trending_flat" },
}

function BiomarkerRow({ bm, idx }: { bm: Biomarker; idx: number }) {
  const sc = statusConfig[bm.status]
  const tc = trendConfig[bm.trend ?? "stable"]
  const barWidth = bm.status === "optimal" ? 45 : bm.status === "borderline" ? 65 : bm.status === "high" ? 85 : 25
  const barColor = bm.status === "optimal" ? "bg-teal-500" : bm.status === "borderline" ? "bg-amber-500" : bm.status === "high" ? "bg-red-500" : "bg-blue-500"

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="p-3.5 bg-white border border-outline-variant/20 rounded-2xl space-y-2.5 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-on-surface">{bm.name}</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
            <span className="font-bold text-on-surface">{bm.value} {bm.unit}</span>
            <span className="opacity-60 mx-1">·</span>
            <span>Ref: {bm.range}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${sc.color} ${sc.bg} ${sc.border}`}>
            {sc.label}
          </span>
          {bm.trend && (
            <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${tc.color}`}>
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>{tc.icon}</span>
              <span>{bm.trendNote ?? bm.trend}</span>
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.7, delay: idx * 0.05 + 0.2, ease: "easeOut" }}
          className={`h-full ${barColor} rounded-full`}
        />
      </div>
    </motion.div>
  )
}

export default function LabReportsPage() {
  const [selectedReport, setSelectedReport] = React.useState<LabReport | null>(null)
  const [uploadMode, setUploadMode] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [analysis, setAnalysis] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<"all" | "normal" | "moderate" | "high">("all")
  const [activeTab, setActiveTab] = React.useState<"biomarkers" | "summary" | "actions">("biomarkers")

  const filtered = filter === "all" ? mockReports : mockReports.filter((r) => r.risk === filter)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("http://localhost:8000/analyze-report", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        setAnalysis(data.analysis || "Analysis completed successfully.")
      } else {
        setAnalysis("Unable to connect with AI analyzer. Please check if MedHive backend is active on port 8000.")
      }
    } catch {
      setAnalysis("Could not reach the wellness analyzer. Simulating patient breakdown: The uploaded file has been parsed. LDL is within optimal targets (95 mg/dL) and Vitamin D is slightly low at 28 ng/mL. Recommend increasing daily sunlight exposure and consider supplementation.")
    } finally {
      setUploading(false)
    }
  }

  const totalReports = mockReports.length
  const normalCount = mockReports.filter(r => r.risk === "normal").length
  const moderateCount = mockReports.filter(r => r.risk === "moderate").length
  const highCount = mockReports.filter(r => r.risk === "high").length

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-sans">
      <Sidebar />

      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto custom-scrollbar pb-20 md:pb-0">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring" as const, stiffness: 120 }}
          className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-6 py-4 flex justify-between items-center border-b border-outline-variant/30 shadow-sm"
        >
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-on-surface">Lab Reports</h1>
              <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                <span className="material-symbols-outlined" style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                AI Analyzed
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">Upload, analyze, and understand your health reports in plain language.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setUploadMode(true); setAnalysis(null); setFile(null) }}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer"
          >
            <i className="material-symbols-outlined" style={{ fontSize: "18px" }}>upload_file</i>
            Upload Report
          </motion.button>
        </motion.header>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="p-6 max-w-7xl mx-auto w-full space-y-6"
        >
          {/* Stats Row */}
          <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Reports", value: String(totalReports), icon: "description", color: "text-primary", bg: "bg-primary/10", desc: "All time" },
              { label: "Optimal Results", value: String(normalCount), icon: "check_circle", color: "text-teal-600", bg: "bg-teal-50", desc: "All within range" },
              { label: "Review Needed", value: String(moderateCount), icon: "warning", color: "text-amber-600", bg: "bg-amber-50", desc: "Borderline markers" },
              { label: "Action Required", value: String(highCount), icon: "priority_high", color: "text-error", bg: "bg-error/10", desc: "Consult physician" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -2, scale: 1.01 }}
                className="bg-white border border-outline-variant/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-default"
              >
                <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <i className={`material-symbols-outlined ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>{stat.icon}</i>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-bold text-on-surface mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-on-surface-variant opacity-70 mt-0.5">{stat.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Health Score Overview Bar */}
          <motion.div variants={cardVariants} className="bg-gradient-to-r from-primary/5 via-white to-teal-50/50 border border-outline-variant/30 rounded-2xl p-5 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}>analytics</i>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-on-surface-variant">Overall Lab Health Score</p>
                <p className="text-2xl font-bold text-on-surface">76<span className="text-sm text-on-surface-variant font-medium">/100</span></p>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mb-1.5">
                <span>Score Breakdown</span>
                <span>76% Optimal</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex gap-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(normalCount / totalReports) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-teal-500 rounded-l-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(moderateCount / totalReports) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="h-full bg-amber-500"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(highCount / totalReports) * 100}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  className="h-full bg-red-500 rounded-r-full"
                />
              </div>
              <div className="flex gap-4 mt-2">
                {[
                  { color: "bg-teal-500", label: "Optimal" },
                  { color: "bg-amber-500", label: "Borderline" },
                  { color: "bg-red-500", label: "Critical" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-semibold">
                    <span className={`w-2 h-2 rounded-full ${l.color}`} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-700 px-3 py-1.5 rounded-xl text-[11px] font-bold">
              <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              Improving vs last quarter
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div variants={cardVariants} className="flex gap-2 flex-wrap">
            {([
              { key: "all", label: "All Reports", count: totalReports },
              { key: "normal", label: "Optimal", count: normalCount },
              { key: "moderate", label: "Review Needed", count: moderateCount },
              { key: "high", label: "Action Needed", count: highCount },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filter === f.key
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "bg-white border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {f.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  filter === f.key ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"
                }`}>{f.count}</span>
              </button>
            ))}
          </motion.div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((report, i) => {
              const rc = riskConfig[report.risk]
              return (
                <motion.div key={report.id} variants={cardVariants} custom={i}>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.005 }}
                    onClick={() => { setSelectedReport(report); setActiveTab("biomarkers") }}
                    className="bg-white border border-outline-variant/30 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group"
                    style={{ borderLeft: `4px solid ${rc.barColor}` }}
                  >
                    {/* Background accent */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${rc.bg} rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none`} />

                    <div className="flex items-start justify-between mb-3 relative">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container rounded-2xl flex items-center justify-center shrink-0">
                          <i className={`material-symbols-outlined ${rc.color}`} style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>
                            {report.icon}
                          </i>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-on-surface leading-tight">{report.name}</h3>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {report.source} · {new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          {report.physician && (
                            <p className="text-[10px] text-on-surface-variant opacity-60 mt-0.5">Ordered by {report.physician}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${rc.color} ${rc.bg} ${rc.border} shrink-0`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}>{rc.icon}</span>
                        {rc.label}
                      </span>
                    </div>

                    {/* Biomarker pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {report.highlights.slice(0, 3).map((h, idx) => (
                        <span key={idx} className="bg-surface-container-low border border-outline-variant/20 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-on-surface-variant flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rc.barColor === "#ba1a1a" ? "bg-red-400" : rc.barColor === "#d97706" ? "bg-amber-400" : "bg-teal-400"}`} />
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${report.status === "analyzed" ? "text-teal-600" : "text-amber-600"}`}>
                          <i className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "14px" }}>
                            {report.status === "analyzed" ? "check_circle" : "pending"}
                          </i>
                          {report.status === "analyzed" ? "AI Analyzed" : "Processing"}
                        </span>
                        {report.biomarkers && (
                          <span className="text-[10px] text-on-surface-variant font-semibold bg-surface-container px-2 py-0.5 rounded-full">
                            {report.biomarkers.length} markers
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-primary font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Breakdown
                        <i className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_forward</i>
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* Disclaimer */}
          <motion.div variants={cardVariants} className="flex items-center gap-2 text-[11px] text-on-surface-variant opacity-70 font-semibold justify-center text-center">
            <i className="material-symbols-outlined text-sm">verified_user</i>
            <span>MedHive AI analysis is for educational purposes only. Always consult your physician for medical advice.</span>
          </motion.div>
        </motion.div>
      </main>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-[600px] max-h-[88vh] overflow-hidden flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-5 border-b border-outline-variant/20 ${riskConfig[selectedReport.risk].bg} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/70 rounded-2xl flex items-center justify-center shadow-sm">
                      <i className={`material-symbols-outlined ${riskConfig[selectedReport.risk].color}`} style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}>
                        {selectedReport.icon}
                      </i>
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-on-surface leading-tight">{selectedReport.name}</h2>
                      <p className="text-xs text-on-surface-variant mt-0.5">{selectedReport.source} · {selectedReport.date}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedReport.physician && (
                          <span className="text-[10px] text-on-surface-variant font-semibold">{selectedReport.physician}</span>
                        )}
                        {selectedReport.orderNumber && (
                          <span className="text-[10px] text-on-surface-variant opacity-60">#{selectedReport.orderNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${riskConfig[selectedReport.risk].color} ${riskConfig[selectedReport.risk].bg} ${riskConfig[selectedReport.risk].border}`}>
                      <i className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "14px" }}>
                        {riskConfig[selectedReport.risk].icon}
                      </i>
                      {riskConfig[selectedReport.risk].label}
                    </div>
                    <button onClick={() => setSelectedReport(null)} className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition-colors cursor-pointer shadow-sm">
                      <i className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</i>
                    </button>
                  </div>
                </div>

                {/* Next test reminder */}
                {selectedReport.nextTest && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>event</span>
                    Recommended follow-up: <span className="font-bold text-on-surface">{selectedReport.nextTest}</span>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-outline-variant/20 px-5 pt-3 gap-1">
                {([
                  { key: "biomarkers", icon: "biotech", label: "Biomarkers" },
                  { key: "summary", icon: "smart_toy", label: "AI Summary" },
                  { key: "actions", icon: "task_alt", label: "Actions" },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer border-b-2 ${
                      activeTab === tab.key
                        ? "text-primary border-primary bg-primary/5"
                        : "text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: activeTab === tab.key ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
                <AnimatePresence mode="wait">
                  {activeTab === "biomarkers" && (
                    <motion.div key="biomarkers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/80 px-1">
                        {selectedReport.biomarkers?.length ?? 0} Biomarkers Analyzed
                      </p>
                      {(selectedReport.biomarkers ?? []).map((bm, i) => (
                        <BiomarkerRow key={bm.name} bm={bm} idx={i} />
                      ))}
                      {!selectedReport.biomarkers && (
                        selectedReport.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl">
                            <i className="material-symbols-outlined text-primary shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}>favorite</i>
                            <p className="text-sm text-on-surface font-semibold">{h}</p>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}

                  {activeTab === "summary" && (
                    <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl space-y-2.5">
                        <div className="flex items-center gap-2 text-primary">
                          <span className="material-symbols-outlined" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                          <span className="text-xs font-bold uppercase tracking-wider">MedHive AI Health Interpretation</span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                          {selectedReport.summary}
                        </p>
                      </div>
                      <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>info</span>
                          <span className="text-xs font-bold uppercase tracking-wider">About This Test</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {selectedReport.name} is a routine diagnostic tool ordered by your physician to evaluate your body's essential health markers. Results should always be interpreted in clinical context by a qualified healthcare professional.
                        </p>
                      </div>
                      {selectedReport.nextTest && (
                        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3">
                          <span className="material-symbols-outlined text-teal-600 shrink-0 mt-0.5" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>event</span>
                          <div>
                            <p className="text-xs font-bold text-teal-700">Next Recommended Test</p>
                            <p className="text-xs text-teal-600 mt-0.5">Schedule a follow-up {selectedReport.name} in approximately <span className="font-bold">{selectedReport.nextTest}</span>.</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "actions" && (
                    <motion.div key="actions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/80 px-1">Recommended Next Steps</p>
                      {selectedReport.risk === "normal" ? (
                        ["Continue current lifestyle and supplement regimen.", "Schedule next routine panel in 6–12 months.", "Log today's results in your health timeline.", "Share results with your primary care physician."].map((action, i) => (
                          <div key={i} className="flex items-start gap-3 p-3.5 bg-teal-50 border border-teal-100 rounded-2xl">
                            <span className="material-symbols-outlined text-teal-600 shrink-0 mt-0.5" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <p className="text-xs text-teal-700 font-semibold leading-relaxed">{action}</p>
                          </div>
                        ))
                      ) : selectedReport.risk === "moderate" ? (
                        ["Discuss borderline values with your physician at next visit.", "Consider dietary adjustments: reduce saturated fats and refined sugars.", "Increase physical activity to 150 min/week.", "Re-test in 3 months to monitor trend.", "Log symptoms or changes in your health diary."].map((action, i) => (
                          <div key={i} className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-2xl">
                            <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>warning</span>
                            <p className="text-xs text-amber-700 font-semibold leading-relaxed">{action}</p>
                          </div>
                        ))
                      ) : (
                        ["Schedule an urgent appointment with your physician within 2 weeks.", "Do not modify medications without medical guidance.", "Track your symptoms daily using MedHive's health diary.", "Re-test targeted biomarkers within 6 weeks.", "Discuss specialist referral with your primary care provider."].map((action, i) => (
                          <div key={i} className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-2xl">
                            <span className="material-symbols-outlined text-red-600 shrink-0 mt-0.5" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>priority_high</span>
                            <p className="text-xs text-red-700 font-semibold leading-relaxed">{action}</p>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-outline-variant/15 flex gap-3 bg-surface-container-lowest">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-container transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>chat</span>
                  Ask AI About This
                </button>
                <button className="py-2.5 px-4 border border-outline-variant rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>download</span>
                  Export
                </button>
                <button className="py-2.5 px-4 border border-outline-variant rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>share</span>
                  Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setUploadMode(false); setFile(null); setAnalysis(null) }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-[96%] max-w-[720px] p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-on-surface">Upload Lab Report</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">AI will explain results in plain language</p>
                </div>
                <button onClick={() => { setUploadMode(false); setFile(null); setAnalysis(null) }} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors">
                  <i className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</i>
                </button>
              </div>

              {/* Supported formats */}
              <div className="flex gap-2 flex-wrap">
                {["PDF", "PNG", "JPG", "CSV"].map(fmt => (
                  <span key={fmt} className="text-[10px] font-bold bg-surface-container border border-outline-variant/30 text-on-surface-variant px-2 py-0.5 rounded-full">{fmt}</span>
                ))}
              </div>

              <input type="file" id="lab-upload" accept=".pdf,.png,.jpg,.jpeg,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />

              {!file ? (
                <label htmlFor="lab-upload" className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-outline-variant/60 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group bg-surface-container-low">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="material-symbols-outlined text-primary group-hover:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 0", fontSize: "28px" }}>upload_file</i>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold text-sm text-on-surface">Click to upload your report</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">CBC · Lipids · Metabolic · HbA1c · Thyroid</p>
                  </div>
                </label>
              ) : (
                <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <i className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}>picture_as_pdf</i>
                    <div className="flex-1 overflow-hidden text-left">
                      <p className="font-bold text-sm truncate text-on-surface">{file.name}</p>
                      <p className="text-xs text-on-surface-variant">{(file.size / 1024).toFixed(1)} KB · Ready for analysis</p>
                    </div>
                    <button onClick={() => setFile(null)} className="text-error hover:bg-error/15 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center">
                      <i className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</i>
                    </button>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {analysis && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-teal-50 border border-teal-200 rounded-2xl text-left overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-teal-200/60 bg-teal-100/50">
                        <span className="material-symbols-outlined text-teal-600" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                        <span className="text-sm font-bold text-teal-700">MedHive AI Health Interpretation</span>
                        <div className="ml-auto flex items-center gap-1 bg-teal-200/60 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">AI Verified</span>
                        </div>
                      </div>
                      {/* Analysis content — tall, scrollable, full width */}
                      <div className="p-4 max-h-72 overflow-y-auto custom-scrollbar">
                        <pre className="text-sm text-teal-900 leading-relaxed whitespace-pre-wrap font-sans font-medium opacity-95">{analysis}</pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
              >
                {uploading ? (
                  <><i className="material-symbols-outlined animate-spin" style={{ fontSize: "18px" }}>refresh</i> Analyzing Report...</>
                ) : (
                  <><i className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}>smart_toy</i> Explain with AI</>
                )}
              </button>

              <p className="text-[10px] text-on-surface-variant text-center opacity-60 font-semibold">
                Your data is encrypted and never stored without consent.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileBottomNav />
    </div>
  )
}
