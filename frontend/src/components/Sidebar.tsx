"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

interface NavItem {
  name: string
  href: string
  icon: string
  badge?: number
}

const navSections = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { name: "AI Chat", href: "/chat", icon: "chat_bubble", badge: 3 },
      { name: "Voice Assistant", href: "/voice", icon: "mic" },
    ]
  },
  {
    label: "Health Tracker",
    items: [
      { name: "Lab Reports", href: "/lab-reports", icon: "biotech" },
      { name: "Medication Check", href: "/medications", icon: "pill" },
      { name: "Health Timeline", href: "/health-timeline", icon: "timeline" },
    ]
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/settings", icon: "settings" },
    ]
  },
]

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 20,
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 24 },
  },
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className={cn(
        "hidden md:flex flex-col h-screen py-5 bg-white/90 backdrop-blur-xl shadow-lg border-r border-outline-variant/30 w-64 shrink-0 sticky top-0 z-50",
        className
      )}
    >
      {/* Brand Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 px-5 mb-8">
        <motion.div
          whileHover={{ rotate: 12, scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg shadow-primary/25 cursor-pointer shrink-0"
        >
          <i className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>
            health_and_safety
          </i>
        </motion.div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-base text-primary leading-tight tracking-tight">MedHive AI</h1>
          <p className="text-xs text-on-surface-variant opacity-70 font-medium">Personal Health Copilot</p>
        </div>
      </motion.div>

      {/* Navigation Sections */}
      <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.label} className="mb-3">
            <motion.p
              variants={itemVariants}
              className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 px-3 mb-1.5"
            >
              {section.label}
            </motion.p>
            {section.items.map((item) => {
              const active = isActive(item.href)
              return (
                <motion.div key={item.name} variants={itemVariants}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative",
                      active
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                    )}
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ zIndex: -1 }}
                      />
                    )}

                    {/* Icon */}
                    <span
                      className={cn(
                        "shrink-0 transition-all duration-200",
                        active ? "text-white" : "text-on-surface-variant group-hover:text-primary"
                      )}
                    >
                      <i
                        className="material-symbols-outlined"
                        style={{
                          fontVariationSettings: active ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                          fontSize: "20px",
                          display: "block",
                        }}
                      >
                        {item.icon}
                      </i>
                    </span>

                    {/* Label */}
                    <span className={cn("flex-1 leading-none", active ? "text-white" : "")}>
                      {item.name}
                    </span>

                    {/* Badge */}
                    {item.badge && !active && (
                      <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-5 my-3 h-px bg-outline-variant/40" />

      {/* Profile Card */}
      <motion.div variants={itemVariants} className="px-3 pb-2">
        <Link
          href="/settings"
          className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container transition-all duration-200"
        >
          <div className="relative shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-outline-variant/30 group-hover:border-primary transition-colors">
            D
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tertiary border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate leading-tight">
              Dakshin
            </p>
            <p className="text-[11px] text-on-surface-variant opacity-60 truncate mt-0.5">Patient</p>
          </div>
          <i
            className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors shrink-0"
            style={{ fontSize: "16px" }}
          >
            chevron_right
          </i>
        </Link>
      </motion.div>
    </motion.aside>
  )
}

/* Mobile Bottom Nav */
export function MobileBottomNav() {
  const pathname = usePathname()

  const items = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Chat", href: "/chat", icon: "chat_bubble" },
    { name: "Voice", href: "/voice", icon: "mic" },
    { name: "Reports", href: "/lab-reports", icon: "biotech" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-outline-variant/30 flex justify-around py-2 z-50 shadow-lg shadow-black/10">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors",
              active ? "text-primary" : "text-on-surface-variant"
            )}
          >
            <i
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
                fontSize: "22px",
                display: "block",
              }}
            >
              {item.icon}
            </i>
            <span className={cn("text-[10px]", active ? "font-bold" : "font-medium")}>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
