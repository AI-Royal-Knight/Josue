import type { Row, FolderType } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 9);

export const emptyRow = (): Row => ({
  id: uid(),
  workSection: "",
  workArea: "",
  projectValue: "0.00",
  labourTarget: "0",
});

export const defaultRows = (n = 7): Row[] =>
  Array.from({ length: n }, emptyRow);

export const FIELD_HEADERS: {
  field: keyof Omit<Row, "id">;
  label: string;
  placeholder: string;
}[] = [
  {
    field: "workSection",
    label: "Work Section",
    placeholder: "e.g. Electrical Rough-in",
  },
  {
    field: "workArea",
    label: "Work Area",
    placeholder: "e.g. Level 1 – Unit 101",
  },
  {
    field: "projectValue",
    label: "Project Value (€)",
    placeholder: "0.00",
  },
  {
    field: "labourTarget",
    label: "Labour Target (hrs)",
    placeholder: "0",
  },
];

export const INITIAL_FOLDERS: FolderType[] = [
  {
    id: "f1",
    name: "APARTMENTS",
    subfolders: [
      { id: "sf1", name: "electrical",           rows: defaultRows() },
      { id: "sf2", name: "Electrical First Fix", rows: defaultRows() },
      { id: "sf3", name: "Plumbing",             rows: defaultRows() },
    ],
  },
  {
    id: "f2",
    name: "CORRIDORS",
    subfolders: [
      { id: "sf4", name: "electrical",           rows: defaultRows() },
      { id: "sf5", name: "Electrical First Fix", rows: defaultRows() },
    ],
  },
];
