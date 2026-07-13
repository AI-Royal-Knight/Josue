import { apiRequest } from "./client";
import { FolderType, Row } from "@/app/(dashboard)/labour-target/types";

export interface CMProject {
  id: string;
  project_name: string;
  folders: FolderType[];
}

export const getContractsManagerProjects = async (): Promise<CMProject[]> => {
  return apiRequest<CMProject[]>("/contracts-manager/projects/");
};

import { SubfolderAssignment } from "./project-admin";

export const updateSubfolderRows = async (
  subfolderId: string,
  rows: Row[],
  projectValue?: number,
  labourTarget?: number,
  assignments?: SubfolderAssignment[]
): Promise<void> => {
  const payload: any = { rows };
  if (projectValue !== undefined) payload.project_value = projectValue;
  if (labourTarget !== undefined) payload.labour_target = labourTarget;
  if (assignments !== undefined) payload.assignments = assignments;

  return apiRequest<void>(`/contracts-manager/subfolders/${subfolderId}/`, {
    method: "PUT",
    body: payload,
  });
};
