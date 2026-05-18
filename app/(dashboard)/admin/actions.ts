"use server"

import { revalidatePath } from "next/cache"

type InviteResult =
  | { success: true; message: string }
  | { success: false; error: string }

export async function inviteProjectAdmin(
  _prevState: InviteResult | null,
  formData: FormData
): Promise<InviteResult> {
  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const project = formData.get("project") as string

  if (!email || !role) {
    return { success: false, error: "Email and role are required" }
  }

  // Simulate API call
  console.log("Inviting:", { email, role, project })

  revalidatePath("/project-admins")

  return { success: true, message: "Invitation sent successfully" }
}
