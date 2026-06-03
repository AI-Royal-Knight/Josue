"use client"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type PendingApproval = {
  id: string
  voNo: string
  action: "approve" | "reject"
}

type Props = {
  pendingApproval: PendingApproval | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function ApprovalDialog({ pendingApproval, onOpenChange, onConfirm }: Props) {
  return (
    <AlertDialog open={!!pendingApproval} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {pendingApproval?.action === "approve" ? "Approve variation?" : "Reject variation?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {pendingApproval?.action === "approve"
              ? `Approving ${pendingApproval.voNo} will mark it as approved by the Commercial Manager.`
              : `Rejecting ${pendingApproval?.voNo} cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={pendingApproval?.action === "reject" ? "bg-red-600 hover:bg-red-500" : ""}
          >
            {pendingApproval?.action === "approve" ? "Approve" : "Reject"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
