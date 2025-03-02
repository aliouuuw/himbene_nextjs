import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// This would typically come from your database
const scheduledPosts = [
  {
    id: 1,
    wigDescription: "Check out our latest product!",
    platforms: ["Facebook", "Twitter"],
    scheduledFor: "2023-06-01 09:00 AM",
  },
  {
    id: 2,
    wigDescription: "Join us for a webinar on social media marketing",
    platforms: ["LinkedIn"],
    scheduledFor: "2023-06-02 02:00 PM",
  },
]

export function ScheduledPosts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Posts</CardTitle>
        <CardDescription>View and manage your upcoming social media posts</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Scheduled For</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.wigDescription}</TableCell>
                <TableCell>{post.platforms.join(", ")}</TableCell>
                <TableCell>{post.scheduledFor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

