"use client"
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreatePostForm } from './CreatePostForm'

function PostManagement() {
  return (
    <div className="w-full">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Post</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="mt-6">
          <CreatePostForm />
        </TabsContent>
        <TabsContent value="published" className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Published Posts</h3>
          {/* We'll add the published posts list here */}
        </TabsContent>
        <TabsContent value="scheduled" className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Scheduled Posts</h3>
          {/* We'll add the scheduled posts list here */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PostManagement
