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
import { createProject } from "../actions"
import { Calendar } from "@/components/ui/calendar"
import { VAT_OPTIONS, CURRENCY_OPTIONS } from "@/constants/projects"

export default function CreateProjectForm() {
  const [isPending, startTransition] = useTransition()
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Inject controlled values since Select isn't a native input
    formData.set("vatRate", vatRate)
    formData.set("currency", currency)

    startTransition(async () => {
      const result = await createProject(null, formData)
      if (result.success) {
        setMessage(result.message)
        e.currentTarget.reset()
        setVatRate("")
        setCurrency("GBP")
      } else {
        setMessage(result.error)
      }
    })
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
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="completionDate">Completion Date :</FieldLabel>
          <FieldContent>
            <Calendar
              mode="single"
              selected={completionDate}
              onSelect={setCompletionDate}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="monthlyApplicationDate">
            Monthly Application Date :
          </FieldLabel>
          <FieldContent>
            <Calendar
              mode="single"
              selected={monthlyApplicationDate}
              onSelect={setMonthlyApplicationDate}
            />
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
