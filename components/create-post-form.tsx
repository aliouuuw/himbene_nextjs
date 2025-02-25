"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const socialPlatforms = [
  { id: "facebook", name: "Facebook" },
  { id: "twitter", name: "Twitter" },
  { id: "linkedin", name: "LinkedIn" },
]

export function CreatePostForm() {
  const [content, setContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log("Submitting post:", { content, selectedPlatforms })
    // Reset form
    setContent("")
    setSelectedPlatforms([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
        <CardDescription>Compose and schedule your social media post</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="space-y-2">
            <Label>Post to:</Label>
            {socialPlatforms.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox
                  id={platform.id}
                  checked={selectedPlatforms.includes(platform.id)}
                  onCheckedChange={(checked) => {
                    setSelectedPlatforms(
                      checked
                        ? [...selectedPlatforms, platform.id]
                        : selectedPlatforms.filter((id) => id !== platform.id),
                    )
                  }}
                />
                <Label htmlFor={platform.id}>{platform.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!content || selectedPlatforms.length === 0}>
            Schedule Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

