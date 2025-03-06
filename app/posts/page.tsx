import React from 'react'
import Link from 'next/link'
import prismaClient from "@/lib/prisma-client"
import Image from 'next/image'

async function getPosts() {
  const posts = await prismaClient.post.findMany({
    take: 25, // Limit to 12 posts for the landing page
    orderBy: {
      createdAt: 'desc' // Show newest posts first
    },
    include: {
      brands: {
        include: {
          brand: true  // Include the actual brand data
        }
      },
      wig: {
        include: {
          currency: true
        }
      }
    }
  })

  return posts.map(post => ({
    id: post.id,
    title: post.wig?.name || post.brands[0].brand.name,  // Access name through brand
    price: post.wig?.basePrice ? Number(post.wig.basePrice) : null,
    currency: post.wig?.currency?.symbol || 'F',
    imageUrl: Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
      ? post.mediaUrls[0]
      : "/default-image.jpg"
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
                <Image 
                  src={post.imageUrl as string}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
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