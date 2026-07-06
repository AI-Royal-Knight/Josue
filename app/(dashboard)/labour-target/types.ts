export type Row = {
  id: string;
  workSection: string;
  workArea: string;
  projectValue: string;
  labourTarget: string;
};

import type { SubfolderAssignment } from "@/lib/api/project-admin";

export type Subfolder = {
  id: string;
  name: string;
  rows: Row[];
  assignments?: SubfolderAssignment[];
};

export type FolderType = {
  id: string;
  name: string;
  subfolders: Subfolder[];
  is_management?: boolean;
};

export type ModalState = {
  folderId: string;
  subfolderId: string;
} | null;

export type FocusedCell = {
  rowIndex: number;
  field: keyof Omit<Row, "id">;
} | null;
