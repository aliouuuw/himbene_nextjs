import React from 'react'
import Link from 'next/link'
import prismaClient from "@/lib/prisma-client"
import Image from 'next/image'
import { isVideoFile } from "@/lib/media-utils"

async function getPosts() {
  const posts = await prismaClient.post.findMany({
    take: 25, // Limit to 12 posts for the landing page
    orderBy: {
      createdAt: 'desc' // Show newest posts first
    },
    include: {
      wig: {
        include: {
          currency: true
        }
      }
    }
  })

  return posts.map(post => ({
    id: post.id,
    title: post.wig?.name ,
    price: post.wig?.basePrice ? Number(post.wig.basePrice) : null,
    currency: post.wig?.currency?.symbol || 'F',
    mediaUrl: Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
      ? post.mediaUrls[0]
      : "/default-image.jpg",
    mediaName: Array.isArray(post.mediaNames) && post.mediaNames.length > 0
      ? post.mediaNames[0]
      : null
  }))
}

export default async function PostsPage() {
  const posts = await getPosts()
  
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Toutes les perruques</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map(post => (
          <Link href={`/posts/${post.id}`} key={post.id} className="group">
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-64 w-full">
                {isVideoFile(post.mediaName) ? (
                  <div className="relative w-full h-full">
                    <video
                      src={post.mediaUrl as string}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                    {/* Play indicator overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                        <svg 
                          className="w-5 h-5 text-white" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image 
                    src={post.mediaUrl as string}
                    alt={post.title || ''}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg truncate">{post.title}</h2>
                {post.price && (
                  <p className="text-gray-700 mt-1">
                    {post.price} {post.currency}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts available yet.</p>
        </div>
      )}
    </div>
  )
}