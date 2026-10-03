"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateProject } from "@/lib/api/project-admin"
import { apiRequest } from "@/lib/api/client"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { VAT_OPTIONS, CURRENCY_OPTIONS } from "@/constants/projects"
import { toast } from "sonner"

export default function UpdateProjectForm({ projectId }: { projectId: string }) {
  const [isPending, setIsPending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [projectName, setProjectName] = useState("")
  const [jobCode, setJobCode] = useState("")
  const [address, setAddress] = useState("")
  const [projectValue, setProjectValue] = useState("")
  const [materialEstimate, setMaterialEstimate] = useState("")
  const [labourEstimate, setLabourEstimate] = useState("")
  const [prelimsEstimate, setPrelimsEstimate] = useState("")
  // Note: estimate_profit is a computed @property on the backend model, not editable
  
  const [vatRate, setVatRate] = useState<string>("")
  const [currency, setCurrency] = useState<string>("GBP")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [completionDate, setCompletionDate] = useState<Date | undefined>(
    undefined
  )
  const [monthlyApplicationDate, setMonthlyApplicationDate] = useState<string>("")

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true)
      try {
        const project = await apiRequest<any>(`/project-admin/projects/${projectId}/`)
        setProjectName(project.project_name || "")
        setJobCode(project.job_code || "")
        setAddress(project.address || "")
        setVatRate(project.vat_rate || "")
        setCurrency(project.currency || "GBP")
        setProjectValue(project.project_value || "")
        setMaterialEstimate(project.material_estimate || "")
        setLabourEstimate(project.labour_estimate || "")
        setPrelimsEstimate(project.prelims_estimate || "")
        // estimate_profit is computed server-side, not editable
        setMonthlyApplicationDate(project.monthly_application_date?.toString() || "")
        if (project.start_date) setStartDate(new Date(project.start_date))
        if (project.completion_date) setCompletionDate(new Date(project.completion_date))
      } catch (err) {
        toast.error("Failed to load project details")
      } finally {
        setIsLoading(false)
      }
    }
    loadProject()
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const payload = {
      project_name: projectName,
      job_code: jobCode,
      vat_rate: vatRate,
      currency: currency,
      address: address,
      project_value: projectValue || 0,
      material_estimate: materialEstimate || 0,
      labour_estimate: labourEstimate || 0,
      prelims_estimate: prelimsEstimate || 0,
      ...(monthlyApplicationDate ? { monthly_application_date: parseInt(monthlyApplicationDate) } : {}),
      start_date: startDate ? startDate.toISOString().split("T")[0] : null,
      completion_date: completionDate ? completionDate.toISOString().split("T")[0] : null,
    }

    setIsPending(true)

    try {
      await updateProject(projectId, payload)
      toast.success("Project updated successfully.")
    } catch (err: any) {
      toast.error(err.message || "Failed to update project")
    } finally {
      setIsPending(false)
    }
  }

  const selectedOption = VAT_OPTIONS.find((o) => o.value === vatRate)

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center text-slate-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading project details...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 max-w-4xl p-6 bg-card rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="projectName">Project Name</FieldLabel>
          <FieldContent>
            <Input id="projectName" name="projectName" value={projectName} onChange={e => setProjectName(e.target.value)} required />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="jobCode">Job Code</FieldLabel>
          <FieldContent>
            <Input id="jobCode" name="jobCode" value={jobCode} onChange={e => setJobCode(e.target.value)} />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="vatRate">VAT Rate</FieldLabel>
          <FieldContent>
            <Select value={vatRate} onValueChange={setVatRate}>
              <SelectTrigger id="vatRate">
                <SelectValue placeholder="Select VAT rate" />
              </SelectTrigger>
              <SelectContent>
                {VAT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOption && (
              <p className="mt-1 text-xs text-slate-400">
                Effective rate:{" "}
                <span
                  className={
                    selectedOption.rate === 20
                      ? "font-semibold text-amber-400"
                      : "font-semibold text-green-400"
                  }
                >
                  {selectedOption.rate}%
                </span>
                {selectedOption.rate === 20
                  ? " — VAT will be added to monthly applications and suppliers may charge VAT."
                  : " — No VAT charged on monthly applications or supplier invoices."}
              </p>
            )}
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <FieldContent>
            <Input id="address" name="address" value={address} onChange={e => setAddress(e.target.value)} />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="projectValue">Project Value</FieldLabel>
          <FieldContent>
            <Input id="projectValue" name="projectValue" type="number" value={projectValue} onChange={e => setProjectValue(e.target.value)} />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="materialEstimate">Material Estimate</FieldLabel>
          <FieldContent>
            <Input
              id="materialEstimate"
              name="materialEstimate"
              type="number"
              value={materialEstimate} onChange={e => setMaterialEstimate(e.target.value)}
            />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Field>
          <FieldLabel htmlFor="labourEstimate">Labour Estimate</FieldLabel>
          <FieldContent>
            <Input id="labourEstimate" name="labourEstimate" type="number" value={labourEstimate} onChange={e => setLabourEstimate(e.target.value)} />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="prelimsEstimate">Prelims Estimate</FieldLabel>
          <FieldContent>
            <Input id="prelimsEstimate" name="prelimsEstimate" type="number" value={prelimsEstimate} onChange={e => setPrelimsEstimate(e.target.value)} />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel>Estimate Profit (auto-calculated)</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              readOnly
              disabled
              value={
                (parseFloat(projectValue || "0") -
                  parseFloat(materialEstimate || "0") -
                  parseFloat(labourEstimate || "0") -
                  parseFloat(prelimsEstimate || "0")).toFixed(2)
              }
              className="opacity-60 cursor-not-allowed"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="currency">Currency</FieldLabel>
          <FieldContent>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <Field>
          <FieldLabel htmlFor="startDate">Start Date :</FieldLabel>
          <FieldContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="completionDate">Completion Date :</FieldLabel>
          <FieldContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !completionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {completionDate ? format(completionDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={completionDate}
                  onSelect={setCompletionDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="monthlyApplicationDate">
            Monthly Application Date (1-31)
          </FieldLabel>
          <FieldContent>
            <Input
              id="monthlyApplicationDate"
              name="monthlyApplicationDate"
              type="number"
              min={1}
              max={31}
              placeholder="1"
              value={monthlyApplicationDate}
              onChange={e => setMonthlyApplicationDate(e.target.value)}
            />
          </FieldContent>
        </Field>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/10 mt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Updating…" : "Update Project"}
        </Button>
      </div>
    </form>
  )
}
