import { z } from "zod"

const isBrowserFile = (val: unknown): val is File =>
  typeof File !== "undefined" && val instanceof File

const browserFileSchema = z
  .custom<File | null | undefined>((val) => val == null || isBrowserFile(val), {
    message: "Upload document",
  })
  .optional()

const requiredBrowserFileSchema = z.custom<File>((val) => isBrowserFile(val), {
  message: "Upload document",
})

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    (val) => /[A-Z]/.test(val),
    "Password must contain 1 uppercase letter"
  )
  .refine((val) => /\d/.test(val), "Password must contain 1 number")

const basicInfoShape = {
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm your password"),
} satisfies z.ZodRawShape

export const basicInfoSchema = z
  .object(basicInfoShape)
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      })
    }
  })

const professionShape = {
  professions: z.array(z.string()).min(1, "Select one or more professions"),
  otherProfession: z.string().optional(),
} satisfies z.ZodRawShape

export const professionSchema = z
  .object(professionShape)
  .superRefine((data, ctx) => {
    if (data.professions.includes("Others") && !data.otherProfession?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["otherProfession"],
        message: "Please specify your profession",
      })
    }
  })

export const taxIdentitySchema = z.object({
  niNumber: z.string().min(1, "NI number is required"),
  utr: z.string().min(1, "UTR is required"),

  passportNumber: z.string().optional(),
  passportExpiryDate: z.date().optional(),
  passportFile: browserFileSchema,
})

const certificateOptionalSchema = z
  .object({
    number: z.string().optional(),
    expiryDate: z.date().optional(),
    file: browserFileSchema,
  })
  .superRefine((data, ctx) => {
    const hasAny =
      Boolean(data.number?.trim()) ||
      Boolean(data.expiryDate) ||
      Boolean(data.file)
    if (!hasAny) return

    if (!data.number?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["number"],
        message: "Number is required",
      })
    }
    if (!data.expiryDate) {
      ctx.addIssue({
        code: "custom",
        path: ["expiryDate"],
        message: "Expiry date is required",
      })
    }
    if (!data.file) {
      ctx.addIssue({
        code: "custom",
        path: ["file"],
        message: "Upload document",
      })
    }
  })

const certificateRequiredSchema = z.object({
  number: z.string().min(1, "Number is required"),
  expiryDate: z.date({ error: "Expiry date is required" }),
  file: requiredBrowserFileSchema,
})

export const certificationsSchema = z.object({
  certifications: z.object({
    ipaf: certificateOptionalSchema,
    pasma: certificateOptionalSchema,
    sssts: certificateOptionalSchema,
    cscs: certificateRequiredSchema,
  }),
})

export const companyInfoSchema = z.object({
  companyName: z.string().optional(),
  companiesHouseNumber: z.string().optional(),
  companyUtr: z.string().optional(),
  vatNumber: z.string().optional(),
})

export const insuranceAddressSchema = z.object({
  insurance: z.object({
    publicLiability: z.object({
      reminder: z.boolean().default(true),
      policyNumber: z.string().min(1, "Policy number is required"),
      expiryDate: z.date({ error: "Expiry date is required" }),
      file: browserFileSchema,
    }),
    employersLiability: z.object({
      reminder: z.boolean().default(true),
      policyNumber: z.string().min(1, "Policy number is required"),
      expiryDate: z.date({ error: "Expiry date is required" }),
      file: browserFileSchema,
    }),
  }),
  address: z.object({
    buildingNumber: z.string().min(1, "Building number is required"),
    street: z.string().min(1, "Street is required"),
    postcode: z.string().min(1, "Postcode is required"),
  }),
})

export const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Name of bank is required"),
  bankAddress: z.string().min(1, "Address of bank is required"),
  nameOnCard: z.string().min(1, "Name on the card is required"),
  accountNumber: z.string().min(1, "Account number is required"),
})

const termsSignatureShape = {
  acceptTerms: z.boolean(),
  signatureDataUrl: z.string().min(1, "Digital signature is required"),
  signatureName: z.string().min(1, "Type full name is required"),
  signatureDate: z.date({ error: "Signature date is required" }),
} satisfies z.ZodRawShape

export const termsSignatureSchema = z
  .object(termsSignatureShape)
  .superRefine((data, ctx) => {
    if (data.acceptTerms !== true) {
      ctx.addIssue({
        code: "custom",
        path: ["acceptTerms"],
        message: "You must accept the terms",
      })
    }
  })

export const onboardingFullSchema = z
  .object({
    ...basicInfoShape,
    ...professionShape,
    ...taxIdentitySchema.shape,
    ...certificationsSchema.shape,
    ...companyInfoSchema.shape,
    ...insuranceAddressSchema.shape,
    ...bankDetailsSchema.shape,
    ...termsSignatureShape,
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      })
    }

    if (data.professions.includes("Others") && !data.otherProfession?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["otherProfession"],
        message: "Please specify your profession",
      })
    }

    if (data.acceptTerms !== true) {
      ctx.addIssue({
        code: "custom",
        path: ["acceptTerms"],
        message: "You must accept the terms",
      })
    }
  })

export type OnboardingFormValues = z.infer<typeof onboardingFullSchema>

export type OnboardingStepKey =
  | "basic"
  | "profession"
  | "taxIdentity"
  | "certifications"
  | "companyInfo"
  | "insuranceAddress"
  | "bankDetails"
  | "terms"

export type OnboardingStep = {
  key: OnboardingStepKey
  label: string
  title: string
  schema: z.ZodTypeAny
}

export const onboardingSteps: OnboardingStep[] = [
  {
    key: "basic",
    label: "Basic Info",
    title: "Basic Information",
    schema: basicInfoSchema,
  },
  {
    key: "profession",
    label: "Profession",
    title: "Profession",
    schema: professionSchema,
  },
  {
    key: "taxIdentity",
    label: "Tax & Identity",
    title: "Tax & Identity Information",
    schema: taxIdentitySchema,
  },
  {
    key: "certifications",
    label: "Certifications",
    title: "Certifications & Cards",
    schema: certificationsSchema,
  },
  {
    key: "companyInfo",
    label: "Company Info",
    title: "Company Information",
    schema: companyInfoSchema,
  },
  {
    key: "insuranceAddress",
    label: "Insurance & Address",
    title: "Insurance & Address",
    schema: insuranceAddressSchema,
  },
  {
    key: "bankDetails",
    label: "Bank Details",
    title: "Bank Details",
    schema: bankDetailsSchema,
  },
  {
    key: "terms",
    label: "Terms & Signature",
    title: "Terms & Signature",
    schema: termsSignatureSchema,
  },
]

export const onboardingDefaultValues = {
  firstName: "",
  surname: "",
  email: "",
  password: "",
  confirmPassword: "",
  professions: [],
  otherProfession: "",
  niNumber: "",
  utr: "",
  passportNumber: "",
  passportExpiryDate: undefined,
  passportFile: undefined,

  certifications: {
    ipaf: { number: "", expiryDate: undefined, file: undefined },
    pasma: { number: "", expiryDate: undefined, file: undefined },
    sssts: { number: "", expiryDate: undefined, file: undefined },
    cscs: { number: "", expiryDate: undefined, file: undefined },
  },

  companyName: "",
  companiesHouseNumber: "",
  companyUtr: "",
  vatNumber: "",

  insurance: {
    publicLiability: {
      reminder: true,
      policyNumber: "",
      expiryDate: undefined,
      file: undefined,
    },
    employersLiability: {
      reminder: true,
      policyNumber: "",
      expiryDate: undefined,
      file: undefined,
    },
  },
  address: {
    buildingNumber: "",
    street: "",
    postcode: "",
  },

  bankName: "",
  bankAddress: "",
  nameOnCard: "",
  accountNumber: "",
  acceptTerms: false,
  signatureDataUrl: "",
  signatureName: "",
  signatureDate: new Date(),
}
