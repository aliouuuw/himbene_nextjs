"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, List, PlusCircle } from "lucide-react";
import { PostWithRelations, Currency as CurrencyType } from "@/types";
import { WigQuality, PostType } from "@prisma/client";
import { PostsList } from "../_components/posts-list";
import PostItem from "../_components/post-item";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { DataGrid } from "../../_components/data-grid";

export default function PostsPage({ 
  initialData 
}: { 
  initialData: { 
    posts: PostWithRelations[],
    currencies: CurrencyType[],
    qualities: WigQuality[],
    postTypes: PostType[]
  } 
}) {
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Filter posts based on selected type
  const filteredPosts = selectedType === "all" 
    ? initialData.posts
    : initialData.posts.filter(post => post.typeId === selectedType);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Posts</h1>
        <Button asChild>
          <Link href="/dashboard/admin/posts/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Créer un nouveau post
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center mb-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {initialData.postTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid">
          <DataGrid
            items={filteredPosts}
            renderItem={(post: PostWithRelations) => (
              <PostItem 
                post={post} 
                currencies={initialData.currencies} 
                qualities={initialData.qualities}
              />
            )}
          />
        </TabsContent>
        <TabsContent value="list">
        <div className="space-y-6">
            <PostsList 
              posts={filteredPosts} 
              currencies={initialData.currencies} 
              qualities={initialData.qualities}
            />
        </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
