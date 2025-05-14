"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { PostWithRelations, Currency as CurrencyType } from "@/types";
import { UserBrand, PostType } from "@prisma/client";
import { CommercialPostsGrid } from "./commercial-posts-grid";
import { CommercialPostsList } from "./commercial-posts-list";

interface PostsTabsProps {
  posts: PostWithRelations[];
  currencies: CurrencyType[];
  userBrand: UserBrand;
  postTypes: PostType[];
}

export function PostsTabs({ posts, currencies, userBrand, postTypes }: PostsTabsProps) {
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredPosts = selectedType === "all" 
    ? posts
    : posts.filter(post => post.typeId === selectedType);

  return (
    <Tabs defaultValue="grid">
      <div className="flex justify-between items-center mb-4">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {postTypes.map((type) => (
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
        <CommercialPostsGrid
          posts={filteredPosts}
          currencies={currencies}
          userBrand={userBrand}
        />
      </TabsContent>
      <TabsContent value="list">
        <CommercialPostsList
          posts={filteredPosts}
          currencies={currencies}
          userBrand={userBrand}
        />
      </TabsContent>
    </Tabs>
  );
}
