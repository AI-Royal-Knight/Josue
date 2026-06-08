export type Row = {
  id: string;
  workSection: string;
  workArea: string;
  projectValue: string;
  labourTarget: string;
};

export type Subfolder = {
  id: string;
  name: string;
  rows: Row[];
};

export type FolderType = {
  id: string;
  name: string;
  subfolders: Subfolder[];
};

export type ModalState = {
  folderId: string;
  subfolderId: string | null;
} | null;

export type FocusedCell = {
  rowIndex: number;
  field: keyof Omit<Row, "id">;
} | null;
