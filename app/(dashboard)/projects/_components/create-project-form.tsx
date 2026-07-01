"use client"

import { useState, useTransition } from "react"
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
import { createProject } from "@/lib/api/project-admin"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { VAT_OPTIONS, CURRENCY_OPTIONS } from "@/constants/projects"

export default function CreateProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [vatRate, setVatRate] = useState<string>("")
  const [currency, setCurrency] = useState<string>("GBP")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [completionDate, setCompletionDate] = useState<Date | undefined>(
    undefined
  )
  const [monthlyApplicationDate, setMonthlyApplicationDate] = useState<
    Date | undefined
  >(undefined)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Construct payload for API
    const payload = {
      project_name: formData.get("projectName"),
      job_code: formData.get("jobCode"),
      vat_rate: vatRate,
      address: formData.get("address"),
      project_value: formData.get("projectValue") || 0,
      material_estimate: formData.get("materialEstimate") || 0,
      labour_estimate: formData.get("labourEstimate") || 0,
      prelims_estimate: formData.get("prelimsEstimate") || 0,
      start_date: startDate ? startDate.toISOString().split("T")[0] : null,
      completion_date: completionDate ? completionDate.toISOString().split("T")[0] : null,
    }

    setIsPending(true)
    setMessage(null)

    try {
      await createProject(payload)
      setMessage("Project created successfully.")
      form.reset()
      setVatRate("")
      setCurrency("GBP")
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setMessage(err.message || "Failed to create project")
    } finally {
      setIsPending(false)
    }
  }

  const selectedOption = VAT_OPTIONS.find((o) => o.value === vatRate)

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="projectName">Project Name</FieldLabel>
          <FieldContent>
            <Input id="projectName" name="projectName" required />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="jobCode">Job Code</FieldLabel>
          <FieldContent>
            <Input id="jobCode" name="jobCode" />
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
            <Input id="address" name="address" />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="description">Developer/Client Name</FieldLabel>
          <FieldContent>
            <Input id="description" name="description" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="description">
            Developer/Client Address
          </FieldLabel>
          <FieldContent>
            <Input id="description" name="description" />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="projectValue">Project Value</FieldLabel>
          <FieldContent>
            <Input id="projectValue" name="projectValue" type="number" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="materialEstimate">Material Estimate</FieldLabel>
          <FieldContent>
            <Input
              id="materialEstimate"
              name="materialEstimate"
              type="number"
            />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Field>
          <FieldLabel htmlFor="labourEstimate">Labour Estimate</FieldLabel>
          <FieldContent>
            <Input id="labourEstimate" name="labourEstimate" type="number" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="prelimsEstimate">Prelims Estimate</FieldLabel>
          <FieldContent>
            <Input id="prelimsEstimate" name="prelimsEstimate" type="number" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="estimateProfit">Estimate Profit</FieldLabel>
          <FieldContent>
            <Input id="estimateProfit" name="estimateProfit" type="number" />
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
            Monthly Application Date :
          </FieldLabel>
          <FieldContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !monthlyApplicationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {monthlyApplicationDate ? format(monthlyApplicationDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={monthlyApplicationDate}
                  onSelect={setMonthlyApplicationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FieldContent>
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create Project"}
        </Button>
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}
    </form>
  )
}
