"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export type RegistrationInviteData = {
  statusLabel: string
  projectName: string
  companyName: string
  inviteEmail: string
  role: string
}

export default function RegistrationInvite({
  invite,
  onStart,
  onResume,
  canResume,
}: {
  invite: RegistrationInviteData
  onStart: () => void
  onResume: () => void
  canResume: boolean
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-6 py-10">
      <div className="w-full text-center">
        <h1 className="text-3xl font-semibold text-foreground">
          Complete Your Registration
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You were invited to join the project &quot;{invite.projectName}&quot;
          by {invite.companyName}.
        </p>
      </div>

      <div className="mt-8 w-full">
        <Card className="border border-input">
          <CardHeader className="border-b border-input">
            <CardTitle>Invite Details</CardTitle>
            <CardDescription>
              Review the details before you start.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">Invite Status</div>
              <Badge variant="outline" className="border-input text-foreground">
                {invite.statusLabel}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">Project</div>
              <div className="text-xs text-foreground">
                {invite.projectName}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">Company</div>
              <div className="text-xs text-foreground">
                {invite.companyName}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">Role</div>
              <div className="text-xs text-foreground capitalize">
                {invite.role.replace(/_/g, " ")}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">Invite Email</div>
              <div className="text-xs text-foreground">
                {invite.inviteEmail}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="button" className="h-10 w-full" onClick={onStart}>
              Start Registration
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full"
              onClick={onResume}
              disabled={!canResume}
            >
              Already started? Resume Draft
            </Button>
          </CardFooter>
        </Card>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Your registration will be reviewed by a Commercial Manager or Contracts
        Manager before activation.
      </p>
    </div>
  )
}
