
import { getPostTypes } from "@/app/actions/admin-actions";
import { PostTypeItem } from "./_components/posttype-item";
import { CreatePostTypeDialog } from "./_components/create-posttype-dialog";

export default async function PostTypesPage() {
  const postTypes = await getPostTypes();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Types de Post</h1>
        <CreatePostTypeDialog />
      </div>

      <div className="space-y-4">
        {postTypes.map((postType) => (
          <PostTypeItem key={postType.id} postType={postType} />
        ))}
      </div>
    </div>
  );
}
