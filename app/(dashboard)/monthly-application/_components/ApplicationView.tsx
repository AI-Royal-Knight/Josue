"use client"

export default function ApplicationView() {
  return (
    <div className="max-w-[880px] border border-white/10 bg-[#0a1730]">
      <div className="border-b border-white/10 px-6 py-5 text-center">
        <h3 className="text-3xl font-semibold tracking-wide text-slate-100">
          COMPANY NAME
        </h3>
        <p className="mt-2 text-xs text-slate-400">
          7-8 Stratford Place, London, W1C 1AY
        </p>
        <p className="text-xs text-slate-400">Tel: 0203922477</p>
      </div>

      <div className="bg-[#1f3571] px-6 py-2 text-center text-sm font-semibold text-slate-100">
        Application For Payment
      </div>

      <div className="grid grid-cols-3 border-b border-white/10 text-xs">
        <div className="border-r border-white/10 px-3 py-2 text-slate-300">
          Application Number:
        </div>
        <div className="border-r border-white/10 px-3 py-2 text-slate-300">
          Date: 15/01/2026
        </div>
        <div className="px-3 py-2 text-slate-300">Ref No:</div>
      </div>

      <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr] border-b border-white/10 text-xs">
        <div className="border-r border-white/10 px-3 py-2 text-slate-200">
          Client
        </div>
        <div className="border-r border-white/10 px-3 py-2 text-slate-200">
          Contract Site
        </div>
        <div className="px-3 py-2 text-slate-200">Contacts</div>
      </div>

      <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr] border-b border-white/10">
        <div className="h-20 border-r border-white/10"></div>
        <div className="h-20 border-r border-white/10"></div>
        <div className="h-20"></div>
      </div>
    </div>
  )
}
