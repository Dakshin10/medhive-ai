"use client"

import * as React from "react"
import { Sidebar, MobileBottomNav } from "@/components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

// Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
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

const timelineContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const timelineItemVariants = {
  hidden: { x: -15, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
}

export default function DashboardPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [reportResult, setReportResult] = React.useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUploadReport = async () => {
    if (!file) return
    setUploading(true)
    setReportResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:8000/analyze-report", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setReportResult(data.analysis || "Analysis completed.")
      } else {
        setReportResult("Failed to analyze the report. Make sure your local MedHive AI backend is running on port 8000.")
      }
    } catch (err) {
      console.error(err)
      setReportResult("Error connecting to the backend. Using local mock analysis: The report suggests your lipid profile is optimal, with high HDL and stable glucose markers.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto custom-scrollbar pb-16 md:pb-0">

        {/* Top App Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md px-6 py-4 flex justify-between items-center w-full border-b border-outline-variant/30"
        >
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60">
                search
              </span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full pl-[48px] pr-4 py-2 focus:ring-2 focus:ring-primary/20 text-body-sm transition-all outline-none text-sm"
                placeholder="Search health timeline, reports, or medication alerts..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-surface-container rounded-full transition-all relative cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-outline-variant group-hover:border-primary transition-colors"
              >
                D
              </motion.div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="p-6 max-w-7xl mx-auto space-y-6 w-full"
        >

          {/* Hero / Greeting */}
          <motion.section
            variants={cardVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
          >
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-background text-3xl font-bold">
                Good Morning, Dakshin 👋
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1 text-sm font-medium">
                Your personal healthcare copilot is ready to help. All systems are synchronized with your active wearables.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-full font-label-md transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer text-sm font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
              Start Voice Consultation
            </motion.button>
          </motion.section>

          {/* Health Summary Row - High information density summary cards */}
          <motion.section
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card className="p-4 hover:shadow-sm transition-shadow">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Symptom Checks</span>
              <h4 className="text-2xl font-bold text-primary mt-1">3 Recent</h4>
            </Card>
            <Card className="p-4 hover:shadow-sm transition-shadow">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Reports Analyzed</span>
              <h4 className="text-2xl font-bold text-primary mt-1">12 Reports</h4>
            </Card>
            <Card className="p-4 hover:shadow-sm transition-shadow">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Medication Reviews</span>
              <h4 className="text-2xl font-bold text-primary mt-1">5 Active</h4>
            </Card>
            <Card className="p-4 hover:shadow-sm transition-shadow">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Voice Sessions</span>
              <h4 className="text-2xl font-bold text-primary mt-1">48 Logs</h4>
            </Card>
          </motion.section>

          {/* Health Overview Bento Grid */}
          <motion.section
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-6 gap-4"
          >
            {/* Health Score Card */}
            <motion.div variants={cardVariants} className="md:col-span-2">
              <Card className="h-full flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row justify-between items-start pb-2">
                  <span className="p-2 bg-primary-container/10 rounded-xl">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                  </span>
                  <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Target Met
                  </span>
                </CardHeader>
                <CardContent className="mt-4">
                  <p className="font-label-md text-label-md text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                    My Health Score
                  </p>
                  <h3 className="font-display-lg text-display-lg text-on-background text-4xl font-bold mt-1">
                    84
                    <span className="text-lg font-normal text-on-surface-variant">/100</span>
                  </h3>
                  <div className="mt-4 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                      className="bg-primary h-full rounded-full"
                    ></motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Wellness Trends */}
            <motion.div variants={cardVariants} className="md:col-span-2">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <span className="p-2 bg-secondary-container/20 rounded-xl text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                  </span>
                  <CardTitle className="text-base font-bold">Wellness Trends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 mt-2">
                  <div className="flex justify-between items-center text-xs border-b border-outline-variant/10 pb-1.5">
                    <span className="opacity-70 font-semibold">Sleep Quality</span>
                    <span className="font-bold text-tertiary">85% (Optimal)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-outline-variant/10 pb-1.5">
                    <span className="opacity-70 font-semibold">Resting Heart Rate</span>
                    <span className="font-bold text-secondary">68 BPM (Stable)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-70 font-semibold">Hydration Tracker</span>
                    <span className="font-bold text-tertiary">92% Compliance</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Insights */}
            <motion.div variants={cardVariants} className="md:col-span-2">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <span className="p-2 bg-primary-container/10 rounded-xl text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                  </span>
                  <CardTitle className="text-base font-bold">Health Insights</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-on-surface-variant leading-relaxed space-y-2">
                  <p>
                    💡 **REM sleep depth** improved 15% after moving screen time back by 60 minutes. Keep it up!
                  </p>
                  <p>
                    💡 **Resting Heart Rate** indicates stable recovery patterns after post-workout hydration logs.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>

          {/* Active Goals Card */}
          <motion.div variants={cardVariants} className="w-full">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4 border-b border-outline-variant/10">
                <span className="material-symbols-outlined text-primary">target</span>
                <CardTitle className="text-base font-bold">Active Health Goals</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="24" cy="24" fill="transparent" r="20" stroke="#fadbda" strokeWidth="4"></circle>
                      <motion.circle
                        cx="24"
                        cy="24"
                        fill="transparent"
                        r="20"
                        stroke="#b20028"
                        strokeDasharray="125.6"
                        initial={{ strokeDashoffset: 125.6 }}
                        animate={{ strokeDashoffset: 31.4 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        strokeWidth="4"
                      ></motion.circle>
                    </svg>
                    <span className="text-[10px] font-bold">75%</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Glucose Optimization</p>
                    <p className="text-[10px] text-on-surface-variant">Daily targets met</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="24" cy="24" fill="transparent" r="20" stroke="#fadbda" strokeWidth="4"></circle>
                      <motion.circle
                        cx="24"
                        cy="24"
                        fill="transparent"
                        r="20"
                        stroke="#b20028"
                        strokeDasharray="125.6"
                        initial={{ strokeDashoffset: 125.6 }}
                        animate={{ strokeDashoffset: 75.4 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                        strokeWidth="4"
                      ></motion.circle>
                    </svg>
                    <span className="text-[10px] font-bold">40%</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">REM Sleep Depth</p>
                    <p className="text-[10px] text-on-surface-variant">Target: 2h/night</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="24" cy="24" fill="transparent" r="20" stroke="#fadbda" strokeWidth="4"></circle>
                      <motion.circle
                        cx="24"
                        cy="24"
                        fill="transparent"
                        r="20"
                        stroke="#b20028"
                        strokeDasharray="125.6"
                        initial={{ strokeDashoffset: 125.6 }}
                        animate={{ strokeDashoffset: 10 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                        strokeWidth="4"
                      ></motion.circle>
                    </svg>
                    <span className="text-[10px] font-bold">92%</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Hydration Protocol</p>
                    <p className="text-[10px] text-on-surface-variant">Daily consistency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Activity & Timeline Section */}
          <motion.section
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Personal Health Timeline */}
            <motion.div variants={cardVariants} className="lg:col-span-2 flex flex-col" id="timeline">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row justify-between items-center mb-2 pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    Personal Health Journey
                  </CardTitle>
                </CardHeader>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={timelineContainerVariants}
                  className="relative timeline-line space-y-6 pl-8 pt-2 pb-6 flex-1 text-xs"
                >
                  {/* Timeline Item 1 */}
                  <motion.div variants={timelineItemVariants} className="relative flex gap-4 group">
                    <div className="absolute -left-[30px] top-1 w-6 h-6 bg-surface border-2 border-primary rounded-full flex items-center justify-center z-10 transition-all group-hover:scale-125">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-on-surface-variant">Today, 09:42 AM</span>
                          <h5 className="font-bold text-sm text-on-background mt-0.5">Lab Report Upload & Analysis</h5>
                        </div>
                        <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary rounded-lg text-[10px] font-bold">
                          Analyzed
                        </span>
                      </div>
                      <p className="text-on-surface-variant leading-relaxed">
                        Lipid panel results uploaded. AI successfully converted biochemical data into easy-to-read wellness steps.
                      </p>

                      {/* Lab Report Upload Widget */}
                      <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-lg">description</span>
                          <span className="font-bold text-xs text-on-surface truncate flex-1">
                            {file ? file.name : "Upload Lab Report (PDF)"}
                          </span>

                          <input
                            type="file"
                            accept=".pdf"
                            id="report-upload"
                            className="hidden"
                            onChange={handleFileChange}
                          />

                          {!file ? (
                            <label
                              htmlFor="report-upload"
                              className="bg-white/80 border border-outline-variant hover:bg-white text-[10px] px-3 py-1 rounded-lg cursor-pointer transition-colors inline-block text-center font-bold"
                            >
                              Browse
                            </label>
                          ) : (
                            <Button
                              onClick={handleUploadReport}
                              disabled={uploading}
                              className="px-3 py-1 text-[10px] bg-primary text-white rounded-lg cursor-pointer h-auto font-bold"
                            >
                              {uploading ? "Analyzing..." : "Explain PDF"}
                            </Button>
                          )}
                        </div>

                        {/* Display analysis response */}
                        <AnimatePresence>
                          {reportResult && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="bg-white p-3 rounded-lg border border-outline-variant/30 text-[11px] text-on-surface whitespace-pre-line max-h-48 overflow-y-auto custom-scrollbar leading-relaxed">
                                <strong>AI Explained Summary:</strong>
                                <div className="mt-1">{reportResult}</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>

                  {/* Timeline Item 2 */}
                  <motion.div variants={timelineItemVariants} className="relative flex gap-4 group">
                    <div className="absolute -left-[30px] top-1 w-6 h-6 bg-surface border-2 border-outline-variant rounded-full flex items-center justify-center z-10 transition-all group-hover:scale-125">
                      <div className="w-2 h-2 bg-outline-variant rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] text-on-surface-variant">Yesterday, 06:15 PM</span>
                      <h5 className="font-bold text-sm text-on-background">Voice Consultation session</h5>
                      <p className="text-on-surface-variant leading-relaxed">
                        Discussed muscle soreness after high-intensity training. MedHive recommended hydration adjustments and warm-down exercises.
                      </p>
                    </div>
                  </motion.div>

                  {/* Timeline Item 3 */}
                  <motion.div variants={timelineItemVariants} className="relative flex gap-4 group">
                    <div className="absolute -left-[30px] top-1 w-6 h-6 bg-surface border-2 border-outline-variant rounded-full flex items-center justify-center z-10 transition-all group-hover:scale-125">
                      <div className="w-2 h-2 bg-outline-variant rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] text-on-surface-variant">Mar 12, 2026</span>
                      <h5 className="font-bold text-sm text-on-background">Medication Adherence Check</h5>
                      <p className="text-on-surface-variant leading-relaxed">
                        Confirmed adherence check for daily Vitamin D3 and Magnesium Glycinate supplements.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </Card>
            </motion.div>

            {/* Side Panels */}
            <motion.div variants={cardVariants} className="space-y-6 flex flex-col justify-between">
              
              {/* Active Symptoms Tracker */}
              <Card>
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                  <CardTitle className="text-sm font-bold">Active Symptoms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-3 rounded-xl bg-error-container/20 border border-error/10 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-lg">ecg_heart</span>
                      <span className="font-bold text-on-surface">Intermittent Fatigue</span>
                    </div>
                    <span className="text-[10px] font-bold text-error bg-white px-2 py-0.5 rounded-full border border-error/25">Recent</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-on-surface-variant opacity-60 text-lg">self_care</span>
                      <span className="font-bold text-on-surface">Lower Back Tension</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium">Mild</span>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Personal Wellness Copilot Insight */}
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-primary p-6 rounded-3xl text-white relative overflow-hidden group shadow-xl shadow-primary/20"
              >
                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="text-base font-bold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined">psychology</span>
                  Personal Insight
                </h4>
                <p className="text-xs text-white/90 mb-6 leading-relaxed">
                  "Dakshin, based on your reported back tension and daily hydration index, I recommend incorporating a 10-minute hamstring stretch before bedtime."
                </p>
                <Button className="w-full py-2 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-colors h-auto border-none text-xs">
                  Acknowledge Insight
                </Button>
              </motion.div>

              {/* Upcoming Tasks */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">Health Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm">event</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Health Check-in Visit</p>
                      <p className="text-[10px] text-on-surface-variant opacity-75">In 4 days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm">science</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Fasted Glucose Check</p>
                      <p className="text-[10px] text-on-surface-variant opacity-75">Tomorrow Morning • At Home</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </motion.section>
        </motion.div>
      </main>

      <MobileBottomNav />
    </div>
  )
}
