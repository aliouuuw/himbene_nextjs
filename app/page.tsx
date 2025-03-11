import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <Image 
          src="/hero-image.jpg" 
          alt="Beautiful wigs collection"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Himbene
          </h1>
          <p className="text-xl text-white/90">
            Plateforme de gestion de publication de contenu d&apos;infographie dans les réseaux sociaux
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/sign-in"
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Se connecter
            </Link>
            <Link 
              href="https://aliou.online"
              className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
