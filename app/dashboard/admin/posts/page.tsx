import { getAdminPosts, getPublishedPosts, getScheduledPosts } from "@/app/actions/post-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function PostsPage() {
  const [drafts, published, scheduled] = await Promise.all([
    getAdminPosts(),
    getPublishedPosts(),
    getScheduledPosts(),
  ]);

  // Combine all posts
  const allPosts = [
    ...(drafts.success ? drafts.data || [] : []),
    ...(published.success ? published.data || [] : []),
    ...(scheduled.success ? scheduled.data || [] : [])
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Post Management</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>A list of all posts</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Wig</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Scheduled For</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.brand.name}</TableCell>
                    <TableCell>{post.wig?.name || '-'}</TableCell>
                    <TableCell>{post.user.firstName} {post.user.lastName}</TableCell>
                    <TableCell>
                      <Badge variant={
                        post.status === "DRAFT" ? "secondary" :
                        post.status === "PUBLISHED" ? "default" :
                        "default"
                      }>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(post.createdAt), "PPP")}</TableCell>
                    <TableCell>
                      {post.scheduledFor ? format(new Date(post.scheduledFor), "PPP") : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {allPosts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No posts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}