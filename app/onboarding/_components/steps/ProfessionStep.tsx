"use client"

import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import ErrorMessage from "@/components/shared/form-error-message"
import type { OnboardingFormValues } from "../onboarding-schemas"

type ProfessionCategory = {
  label: string
  options: string[]
}

const professionCategories: ProfessionCategory[] = [
  {
    label: "Electrical",
    options: [
      "Electrician",
      "Electrical manager",
      "Electrician Mate",
      "Electrical QA",
      "Electrical Tester",
      "Electrical Switchrooms",
      "BMS Engineer",
    ],
  },
  {
    label: "Mechanical",
    options: [
      "Plumber",
      "Plumbing Manager",
      "Plumbing Supervisor",
      "Plumber Mate",
      "Brazing",
      "Pipe Fitter Dry Risers",
      "Pipe Fitter Sprinklers",
    ],
  },
  {
    label: "Labourers",
    options: [
      "Electrical Storeman",
      "Plumbing Storeman",
      "Electrical Labourer",
      "Plumbing Labourer",
      "Logistics",
    ],
  },
  {
    label: "Office staff",
    options: [
      "Buying assistant",
      "Buyer Manager",
      "Electrical Estimator",
      "Mechanical Estimator",
      "Electrical QS",
      "Mechanical QS",
      "Secretary",
      "Others",
    ],
  },
]

export default function ProfessionStep() {
  const {
    setValue,
    register,
    clearErrors,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  const selected = useWatch<OnboardingFormValues>({ name: "professions" }) ?? []
  const [search, setSearch] = useState("")

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return professionCategories

    return professionCategories
      .map((cat) => ({
        ...cat,
        options: cat.options.filter((opt) => opt.toLowerCase().includes(term)),
      }))
      .filter((cat) => cat.options.length > 0)
  }, [search])

  const toggle = (name: string) => {
    const next = selected.includes(name)
      ? selected.filter((v) => v !== name)
      : [...selected, name]

    setValue("professions", next, { shouldValidate: true, shouldDirty: true })
    clearErrors("professions")
  }

  const clearAll = () => {
    setValue("professions", [], { shouldValidate: true, shouldDirty: true })
    setValue("otherProfession", "", { shouldDirty: true })
    clearErrors(["professions", "otherProfession"])
  }

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel htmlFor="profession-search">Search professions…</FieldLabel>
        <FieldContent>
          <Input
            id="profession-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search professions..."
          />
        </FieldContent>
      </Field>

      <div className="flex items-center justify-between gap-3 rounded-none border border-input px-3 py-2">
        <div className="text-xs text-muted-foreground">
          {selected.length} profession{selected.length === 1 ? "" : "s"}{" "}
          selected
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
          Clear all
        </Button>
      </div>

      {errors.professions && (
        <ErrorMessage message={errors.professions.message} />
      )}

      <div className="grid grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div key={cat.label} className="space-y-2">
            <div className="text-xs font-medium text-foreground">
              {cat.label}
            </div>
            <div className="space-y-2">
              {cat.options.map((opt) => {
                const isSelected = selected.includes(opt)
                return (
                  <Button
                    key={opt}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className="h-auto w-full justify-between px-2.5 py-2 text-left"
                    onClick={() => toggle(opt)}
                  >
                    <span className="text-xs">{opt}</span>
                    {isSelected && <X className="size-3" />}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selected.includes("Others") && (
        <Field>
          <FieldLabel htmlFor="otherProfession">Other</FieldLabel>
          <FieldContent>
            <Input
              id="otherProfession"
              placeholder="Type here..."
              {...register("otherProfession")}
            />
            {errors.otherProfession && (
              <ErrorMessage message={errors.otherProfession.message} />
            )}
          </FieldContent>
        </Field>
      )}
    </div>
  )
}
