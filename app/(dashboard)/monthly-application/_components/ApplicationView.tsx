"use client"

export default function ApplicationView() {
  return (
    <div className="w-full max-w-[880px] space-y-6 text-slate-200">
      {/* Top Box: Company Header & Client Info */}
      <div className="border border-white/10 bg-[#0a1730] overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5 text-center bg-[#070f1e]/40">
          <h3 className="text-3xl font-bold tracking-wider text-white">
            COMPANY NAME
          </h3>
          <p className="mt-1.5 text-xs text-slate-400">
            7-8 Stratford Place, London, W1C 1AY
          </p>
          <p className="text-xs text-slate-400">Tel: 0203922477</p>
        </div>

        <div className="bg-[#1f3571] px-6 py-2.5 text-center text-sm font-semibold tracking-wide text-white uppercase">
          Application For Payment
        </div>

        <div className="grid grid-cols-3 border-b border-white/10 text-xs bg-[#070f1e]/80">
          <div className="border-r border-white/10 px-4 py-2.5 text-slate-300">
            <span className="text-slate-500 font-medium">Application Number:</span>
          </div>
          <div className="border-r border-white/10 px-4 py-2.5 text-slate-300">
            <span className="text-slate-500 font-medium">Date:</span> 15/01/2026
          </div>
          <div className="px-4 py-2.5 text-slate-300">
            <span className="text-slate-500 font-medium">Ref No:</span>
          </div>
        </div>

        <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr] border-b border-white/10 text-xs font-semibold bg-[#111c35]/40 text-slate-200">
          <div className="border-r border-white/10 px-4 py-2.5">Client</div>
          <div className="border-r border-white/10 px-4 py-2.5">Contract Site</div>
          <div className="px-4 py-2.5">Contacts</div>
        </div>

        <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr] text-xs bg-[#070f1e]/20">
          <div className="h-24 border-r border-white/10 px-4 py-3"></div>
          <div className="h-24 border-r border-white/10 px-4 py-3"></div>
          <div className="h-24 px-4 py-3"></div>
        </div>
      </div>

      {/* Middle Box: Movement Calculations & Details of Application */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
        {/* Left Table: Movement Calculations */}
        <div className="border border-white/10 bg-[#0a1730] overflow-hidden">
          <div className="bg-[#111c35]/60 border-b border-white/10 px-4 py-2.5 font-semibold text-slate-100 text-sm">
            Movement Calculations
          </div>
          <div className="divide-y divide-white/10 text-xs bg-[#070f1e]/20">
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Current Cumulative
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 17,600.00
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Previous Cumulative
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                —
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center font-bold bg-[#111c35]/20">
              <div className="px-4 py-2.5 text-slate-200 border-r border-white/10 h-9 flex items-center">
                Gross Movement in Period
              </div>
              <div className="px-4 py-2.5 text-right text-slate-100 h-9 flex items-center justify-end">
                £ 17,600.00
              </div>
            </div>

            {/* Separator border */}
            <div className="grid grid-cols-[2fr_1fr] items-center border-t-2 border-white/20">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Projected Final Account
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 10,600.00
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Order No
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                —
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Order Value
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 5,600.00
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Works Valued to Date
              </div>
              <div className="px-4 py-2.5 text-right text-slate-200 h-9 flex items-center justify-end">
                15-Jan-26
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Payment Notice Date
              </div>
              <div className="px-4 py-2.5 text-right text-slate-200 h-9 flex items-center justify-end">
                8-Feb-26
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Final Date for Payment
              </div>
              <div className="px-4 py-2.5 text-right text-slate-200 h-9 flex items-center justify-end">
                22-Feb-26
              </div>
            </div>
          </div>
        </div>

        {/* Right Table: Details of Application */}
        <div className="border border-white/10 bg-[#0a1730] overflow-hidden">
          <div className="bg-[#111c35]/60 border-b border-white/10 px-4 py-2.5 font-semibold text-slate-100 text-sm">
            Details of Application
          </div>
          <div className="divide-y divide-white/10 text-xs bg-[#070f1e]/20">
            <div className="bg-[#070f1e]/40 px-4 py-1.5 italic text-slate-400 text-[10px] h-7 flex items-center">
              Breakdown of Application
            </div>

            {/* Contract Works */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Contract Works
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 5,000.00
              </div>
            </div>

            {/* Variations */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Variations
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 12,000.00
              </div>
            </div>

            {/* Cumulative Gross Total */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center font-bold bg-[#111c35]/20">
              <div className="px-4 py-2.5 text-slate-200 border-r border-white/10 h-9 flex items-center">
                Cumulative Gross Total
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right text-slate-100 h-9 flex items-center justify-end">
                £ 17,600.00
              </div>
            </div>

            {/* Less Retention */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center border-t-2 border-white/20">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Less Retention
              </div>
              <div className="px-4 py-2.5 text-center text-slate-200 border-r border-white/10 h-9 flex items-center justify-center font-medium bg-[#111c35]/15">
                2.5%
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 440.00
              </div>
            </div>

            {/* Less Discount */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Less Discount
              </div>
              <div className="px-4 py-2.5 text-center text-slate-200 border-r border-white/10 h-9 flex items-center justify-center font-medium bg-[#111c35]/15">
                0.0%
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                —
              </div>
            </div>

            {/* Cumulative Net Application */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center font-medium border-t-2 border-white/20">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Cumulative Net Application
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right font-semibold text-slate-100 h-9 flex items-center justify-end">
                £ 17,160.00
              </div>
            </div>

            {/* Cumulative Net Payment Received */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Cumulative Net Payment Received
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                —
              </div>
            </div>

            {/* Net Payment Due */}
            <div className="grid grid-cols-[2.6fr_1fr] items-center font-bold bg-[#1d3571] text-white">
              <div className="px-4 py-2.5 border-r border-white/10 h-9 flex items-center">
                Net Payment Due
              </div>
              <div className="px-4 py-2.5 text-right h-9 flex items-center justify-end">
                £ 17,160.00
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Box: Legal Notes Footer */}
      <div className="border border-white/10 bg-[#0a1730] p-4 text-[10px] md:text-[11px] leading-relaxed text-slate-400 space-y-3">
        <p>
          If you do not agree with any items within our application, please forward
          full details within five days of the date of this Application.
        </p>
        <p>
          Please note that in compliance with the Housing Grants Construction and
          Regeneration Act 1996, it is a statutory requirement that you advise us
          within a period of 5 days from the due date of the Application of any
          amount proposed to be withheld from the gross value applied for, and the
          ground for withholding. If there are more than one ground, each ground
          and the amount attributable to it must be detailed.
        </p>
      </div>
    </div>
  )
}
