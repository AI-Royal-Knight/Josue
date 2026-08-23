"use client"

import { useRouter } from "next/navigation"
import { Building2, LogIn, ArrowRight, Lock, ShieldCheck, Search, Bell, LayoutDashboard, Briefcase, Users, FileText, Settings, Plus, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function Page() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#071324] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-[10%] right-[10%] -z-10 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] -z-10 w-[500px] h-[500px] bg-blue-800/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-3 border-b border-white/5 z-10 bg-[#071324]/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/logo.png"
            alt="Tresta Logo"
            width={140}
            height={70}
            className="object-contain h-12 md:h-16 w-auto brightness-0 invert drop-shadow-md transition-transform hover:scale-105"
          />
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#" className="hover:text-white transition-colors">Features</Link>
          <Link href="#" className="hover:text-white transition-colors">Industries</Link>
          <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-white transition-colors">Resources</Link>
        </div>

        <div>
          <Button
            onClick={() => router.push("/sign-in")}
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white bg-transparent h-9 px-6 rounded-md"
          >
            Sign in
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center pt-8 md:pt-12 px-4 text-center z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300 mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
          Welcome to Tresta
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Streamline Your <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Project Management
          </span>
        </h1>

        <p className="mt-6 text-slate-300 text-base md:text-lg max-w-3xl leading-relaxed">
          A comprehensive, cloud-based platform meticulously designed for construction and commercial managers. Empower teams, optimize resource allocation, and gain real-time visibility into project health.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <Button
            onClick={() => router.push("/request")}
            className="h-12 px-6 rounded-md bg-[#1e293b] border border-slate-700 text-white hover:bg-slate-800 transition-colors flex items-center shadow-md w-full sm:w-auto"
          >
            <Lock className="mr-2 h-4 w-4 text-slate-400" />
            Apply as a Company <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            onClick={() => router.push("/sign-in")}
            className="h-12 px-6 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold hover:opacity-90 transition-opacity flex items-center border-none shadow-[0_4px_14px_rgba(6,182,212,0.4)] w-full sm:w-auto"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In to Dashboard
          </Button>
        </div>

        {/* Trust Section */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-sm text-slate-400">
            <span className="font-medium text-right leading-tight">Trusted by leading<br />UK contractors</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-slate-500" />
              <div className="flex flex-col items-start leading-tight">
                <span className="font-bold text-slate-300 text-base">GDPR</span>
                <span className="text-[10px] uppercase tracking-wider">Compliant</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-lg">
              <Building2 className="h-6 w-6 text-slate-500" /> Building-R-Us
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-lg">
              <Building2 className="h-6 w-6 text-slate-500" /> Building Bros
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Built by industry professionals, for industry professionals.
          </p>
        </div>

        {/* Dashboard Mockup (Clean CSS Mockup) */}
        <div className="mt-16 w-full max-w-5xl px-4 md:px-0 mb-16">
          <div className="bg-[#0f172a] rounded-t-2xl border border-slate-700/50 p-2 sm:p-3 shadow-2xl relative mx-auto">

            {/* Window Controls */}
            <div className="h-8 flex items-center relative mb-2">
              <div className="absolute left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
              </div>
              <div className="w-full text-center text-xs text-slate-400 font-medium tracking-wide">Experience the Tresta Advantage</div>
            </div>

            {/* App UI */}
            <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200/50 relative flex h-[500px] text-slate-800 shadow-inner text-left mx-auto">

              {/* Sidebar */}
              <div className="w-16 md:w-56 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
                  <Image
                    src="/logo.png"
                    alt="Tresta Logo"
                    width={150}
                    height={50}
                    className="object-contain h-6 md:h-8 w-auto"
                  />
                </div>
                <div className="flex-1 py-6 px-3 space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer">
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden md:block font-medium text-sm">Dashboard</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-md cursor-pointer">
                    <Briefcase className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden md:block font-medium text-sm">Projects</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-md cursor-pointer">
                    <Users className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden md:block font-medium text-sm">Team</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-md cursor-pointer">
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden md:block font-medium text-sm">Reports</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-md cursor-pointer">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden md:block font-medium text-sm">Settings</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* Topbar */}
                <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                  <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-3 py-1.5 rounded-md w-full max-w-[200px] md:max-w-xs">
                    <Search className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">Search projects...</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Bell className="w-5 h-5 text-slate-400 hidden sm:block" />
                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 shadow-sm overflow-hidden flex justify-center items-center flex-shrink-0">
                      <span className="text-xs font-bold">AD</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Area */}
                <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-slate-800">Project Overview</h2>
                      <p className="text-xs md:text-sm text-slate-500">Commercial Management Dashboard</p>
                    </div>
                    <div className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 shadow-sm cursor-pointer hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Project</span>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Active Projects</div>
                      <div className="text-xl md:text-2xl font-bold text-slate-800">12</div>
                      <div className="text-xs text-emerald-500 flex items-center mt-1 font-medium">↑ 2 from last month</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Pending Approvals</div>
                      <div className="text-xl md:text-2xl font-bold text-slate-800">5</div>
                      <div className="text-xs text-amber-500 flex items-center mt-1 font-medium">Needs attention</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Total Value</div>
                      <div className="text-xl md:text-2xl font-bold text-slate-800">£2.4M</div>
                      <div className="text-xs text-emerald-500 flex items-center mt-1 font-medium">↑ 15% from last month</div>
                    </div>
                  </div>

                  {/* Gantt / Task List */}
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800 text-sm">
                      Recent Projects Timeline
                    </div>
                    <div className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto">
                      {/* Row 1 */}
                      <div className="flex items-center">
                        <div className="w-24 md:w-48 text-xs md:text-sm font-medium text-slate-700 truncate pr-2 md:pr-4 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="truncate">Riverside Complex</span>
                        </div>
                        <div className="flex-1 bg-slate-50 h-8 rounded-md relative flex items-center px-1 border border-slate-100">
                          <div className="absolute left-[10%] w-[30%] h-5 bg-emerald-400 rounded-sm shadow-sm transition-all hover:brightness-110 cursor-pointer"></div>
                        </div>
                      </div>
                      {/* Row 2 */}
                      <div className="flex items-center">
                        <div className="w-24 md:w-48 text-xs md:text-sm font-medium text-slate-700 truncate pr-2 md:pr-4 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex-shrink-0"></div>
                          <span className="truncate">City Center Mall</span>
                        </div>
                        <div className="flex-1 bg-slate-50 h-8 rounded-md relative flex items-center px-1 border border-slate-100">
                          <div className="absolute left-[35%] w-[45%] h-5 bg-blue-500 rounded-sm shadow-sm transition-all hover:brightness-110 cursor-pointer"></div>
                        </div>
                      </div>
                      {/* Row 3 */}
                      <div className="flex items-center">
                        <div className="w-24 md:w-48 text-xs md:text-sm font-medium text-slate-700 truncate pr-2 md:pr-4 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex-shrink-0"></div>
                          <span className="truncate">Tech Park Phase 2</span>
                        </div>
                        <div className="flex-1 bg-slate-50 h-8 rounded-md relative flex items-center px-1 border border-slate-100">
                          <div className="absolute left-[50%] w-[25%] h-5 bg-amber-400 rounded-sm shadow-sm transition-all hover:brightness-110 cursor-pointer"></div>
                        </div>
                      </div>
                      {/* Row 4 */}
                      <div className="flex items-center">
                        <div className="w-24 md:w-48 text-xs md:text-sm font-medium text-slate-700 truncate pr-2 md:pr-4 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0"></div>
                          <span className="truncate">Harbor Extension</span>
                        </div>
                        <div className="flex-1 bg-slate-50 h-8 rounded-md relative flex items-center px-1 border border-slate-100">
                          <div className="absolute left-[70%] w-[20%] h-5 bg-slate-300 rounded-sm shadow-sm transition-all hover:brightness-110 cursor-pointer"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-6 md:px-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 z-10 bg-[#071324]">
        <div>&copy; {new Date().getFullYear()} Tresta. All rights reserved.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="#" className="hover:text-slate-300 transition-colors">Contact Support</Link>
        </div>
      </footer>
    </main>
  )
}
