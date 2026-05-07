import { Card, CardContent } from "@/components/ui/card"

const data = [
  {
    title: "Total Users",
    value: "1,234",
  },
  {
    title: "Active Projects",
    value: "56",
  },
  {
    title: "Pending Invites",
    value: "12",
  },
]
export default function page() {
  return (
    <div className="w-2/3 space-y-6 p-6">
      <h1 className="text-xl font-semibold">Welcome to Admin Dashboard</h1>
      <p>
        Select a section from the sidebar to manage users, project
        administrators, and system settings. All data is presented in a
        structured, spreadsheet-like format for quick editing and review.{" "}
      </p>

      <div className="flex gap-6">
        {data.map((item) => (
          <Card key={item.title} className="w-full">
            <CardContent>
              <h2>{item.title}</h2>
              <p>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
