import React from 'react'
import Link from 'next/link'
import prismaClient from "@/lib/prisma-client"
import Image from 'next/image'

async function getLandingPagePosts() {
  const posts = await prismaClient.post.findMany({
    take: 4, // Limit to 4 posts for the landing page
    orderBy: {
      createdAt: 'desc' // Show newest posts first
    },
    include: {
      brand: true,
      wig: {
        include: {
          currency: true
        }
      }
    }
  })

  return posts.map(post => ({
    id: post.id,
    title: post.wig?.name || post.brand.name,
    price: post.wig?.basePrice ? Number(post.wig.basePrice) : null,
    currency: post.wig?.currency?.symbol || 'F',
    imageUrl: Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
      ? post.mediaUrls[0]
      : "/default-image.jpg"
  }))
}

export default async function Home() {
  
  // If not authenticated, show the landing page
  const posts = await getLandingPagePosts()
  
  return (
    <main>
      {/* Hero Section */}
      <div className="relative h-[400px] w-full mb-12 bg-foreground">
        <Image 
          src="/hero-image.jpg" 
          alt="Beautiful wigs collection"
          fill
          className="object-cover brightness-50 opacity-80"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Découvrez Votre Style Parfait
          </h1>
          <p className="text-xl text-center mb-8">
            Une collection exclusive de perruques de haute qualité
          </p>
          <div className="w-full max-w-md px-4">
            <input
              type="search"
              placeholder="Rechercher une perruque..."
              className="w-full px-4 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-2xl font-semibold mb-6">Catégories Populaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Synthétique', 'Naturelle', 'Lace Front', 'Full Lace'].map((category) => (
            <Link 
              href={`/category/${category.toLowerCase()}`} 
              key={category}
              className="relative h-32 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                {category}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Posts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Perruques en Vedette</h2>
          <Link href="/posts" className="text-primary hover:underline">
            Voir tout
          </Link>
        </div>
        
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
                    <p className="text-gray-700 mt-1 font-medium">
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
            <p className="text-gray-500">Aucune perruque disponible pour le moment.</p>
          </div>
        )}
      </div>

      {/* Trust Badges Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: '🚚', title: 'Livraison Rapide' },
            { icon: '✨', title: 'Qualité Garantie' },
            { icon: '💳', title: 'Paiement Sécurisé' },
            { icon: '📞', title: 'Support 24/7' },
          ].map((badge) => (
            <div key={badge.title} className="flex flex-col items-center">
              <span className="text-3xl mb-2">{badge.icon}</span>
              <h3 className="font-medium">{badge.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contactez-nous</h2>
            <p className="text-gray-600">
              Des questions? Notre équipe est là pour vous aider
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  📍
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Notre Adresse</h3>
                  <p className="text-gray-600">123 Rue de la Mode, 75000 Paris</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  📞
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Téléphone</h3>
                  <p className="text-gray-600">+33 1 23 45 67 89</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  ✉️
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Email</h3>
                  <p className="text-gray-600">contact@votre-boutique.com</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
