"use server"

import { revalidatePath } from "next/cache"

type CreateResult =
  | { success: true; message: string }
  | { success: false; error: string }

export async function createProject(
  _prevState: CreateResult | null,
  formData: FormData
): Promise<CreateResult> {
  const projectName = (formData.get("projectName") as string) || ""
  const jobCode = (formData.get("jobCode") as string) || ""

  if (!projectName) {
    return { success: false, error: "Project name is required" }
  }

  // Simulate API call
  console.log("Creating project:", { projectName, jobCode })

  // Revalidate project listing
  revalidatePath("/project")

  return { success: true, message: "Project created" }
}
