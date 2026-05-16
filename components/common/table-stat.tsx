type StatRow = {
  label: string
  value: string
}

type TableStatProps = {
  summaryRows: StatRow[]
}

export default function TableStat({ summaryRows = [] }: TableStatProps) {
  return (
    <div className="max-w-[500px] overflow-hidden border border-[#0a5f4d]">
      {Array.isArray(summaryRows) && summaryRows.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[1fr_190px] border-b border-[#0a5f4d] last:border-b-0"
        >
          <div className="bg-blue-900 px-3 py-2 text-xs font-semibold text-slate-100">
            {item.label}
          </div>
          <div className="bg-[#16663f] px-3 py-2 text-xs font-semibold text-slate-100">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
