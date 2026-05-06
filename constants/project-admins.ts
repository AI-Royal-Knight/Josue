export type Item = {
  name: string
  surname: string
  emailAddress: string
  projects: string
  dateProjectCreated: string
  projectValue: string
}

export const projectAmins: Item[] = [
  {
    name: "Sarah",
    surname: "Jenkins",
    emailAddress: "s.jenkins@example.com",
    projects: "Alpha, Omega",
    dateProjectCreated: "2023-01-15",
    projectValue: "£1.2M",
  },
  {
    name: "Michael",
    surname: "Chen",
    emailAddress: "m.chen@example.com",
    projects: "Beta",
    dateProjectCreated: "2023-03-22",
    projectValue: "£850K",
  },
  {
    name: "Emma",
    surname: "Watson",
    emailAddress: "e.watson@example.com",
    projects: "Gamma, Delta",
    dateProjectCreated: "2023-06-10",
    projectValue: "£2.4M",
  },
  {
    name: "David",
    surname: "Miller",
    emailAddress: "d.miller@example.com",
    projects: "Epsilon",
    dateProjectCreated: "2023-08-05",
    projectValue: "£420K",
  },
  {
    name: "James",
    surname: "Wilson",
    emailAddress: "j.wilson@example.com",
    projects: "Zeta, Eta, Theta",
    dateProjectCreated: "2023-11-18",
    projectValue: "£3.1M",
  },
]
