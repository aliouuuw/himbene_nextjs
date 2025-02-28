import { CreatePostForm } from "../_components/CreatePostForm";

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Post Management</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Create Post</h2>
          <CreatePostForm />
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Published Posts</h2>
          {/* Add published posts list here */}
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Scheduled Posts</h2>
          {/* Add scheduled posts list here */}
        </section>
      </div>
    </div>
  );
} 