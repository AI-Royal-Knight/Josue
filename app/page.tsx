"use client"

import { useRouter } from "next/navigation"
import { Building2, LogIn, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Page() {
  const router = useRouter()

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b1328] px-6 py-10 text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="absolute top-[20%] left-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-4xl space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            Welcome to Tresta
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Streamline Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Project Management
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400 sm:text-xl">
            The ultimate platform for construction and commercial management. Empower your teams, optimize resources, and take control of your projects.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 pt-4">
          <Button
            onClick={() => router.push("/request")}
            className="group h-14 w-full sm:w-auto px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold tracking-wide text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40"
          >
            <Building2 className="mr-2 h-5 w-5" />
            Apply as a Company
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            onClick={() => router.push("/sign-in")}
            variant="outline"
            className="group h-14 w-full sm:w-auto px-8 rounded-xl border-white/20 bg-white/5 text-base font-semibold tracking-wide text-white backdrop-blur-sm transition-all hover:bg-white/10"
          >
            <LogIn className="mr-2 h-5 w-5 text-slate-300 transition-colors group-hover:text-white" />
            Sign In to Dashboard
          </Button>
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Tresta. All rights reserved.
      </div>
    </main>
  )
}
