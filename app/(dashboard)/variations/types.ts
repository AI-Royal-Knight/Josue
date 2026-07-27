export type ApprovalStatus = "Pending" | "Approved" | "Rejected"

export type VariationLine = {
  no: string
  siteInstruction: string
  workArea: string
  workSection: string
  labour: number
  /** Labour target — shown to assigned users when they view/invoice this variation */
  labourTarget: number
  material: number
  qty: number
}

export type VariationRow = {
  id: string
  voNo: string
  date: string
  variationSheetNumber: string
  project: string
  projectId: string
  siteInstructionNo: string
  descriptionOfWorks: string
  createdBy: string
  lines: VariationLine[]
  totalAmount: number
  evidence: string
  evidence_url?: string | null
  comments: string
  assignedUserIds: string[]
  approvalStatus: ApprovalStatus
  approvedBy: string
  submittedToClient: boolean
  signedByClient: boolean

  // Role Signatures
  sigCommercialDepartment?: boolean
  sigCommercialDepartmentDate?: string | null
  sigContractsManager?: boolean
  sigContractsManagerDate?: string | null
  sigProjectDirector?: boolean
  sigProjectDirectorDate?: string | null
  sigManagingDirector?: boolean
  sigManagingDirectorDate?: string | null
  fullyApproved?: boolean
}

export type VariationFormData = {
  project: string
  siteInstructionNo: string
  attentionOf: string
  descriptionOfWorks: string
  lines: VariationLine[]
  comments: string
  evidence: File | null
}
