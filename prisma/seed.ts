import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default currencies
  const currencies = [
    { id: 'USD', name: 'US Dollar', symbol: '$', rate: 1, isBase: true },
    { id: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
    { id: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  ]

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { id: currency.id },
      update: currency,
      create: currency,
    })
  }

  // Create default wig sizes
  const sizes = [
    { name: 'Small', description: '20-22 inches' },
    { name: 'Medium', description: '22-24 inches' },
    { name: 'Large', description: '24-26 inches' },
  ]

  for (const size of sizes) {
    await prisma.wigSize.upsert({
      where: { name: size.name },
      update: size,
      create: size,
    })
  }

  // Create default wig colors
  const colors = [
    { name: 'Natural Black', hexCode: '#000000' },
    { name: 'Dark Brown', hexCode: '#3B2F2F' },
    { name: 'Light Brown', hexCode: '#7B3F00' },
    { name: 'Blonde', hexCode: '#FAF0BE' },
  ]

  for (const color of colors) {
    await prisma.wigColor.upsert({
      where: { name: color.name },
      update: color,
      create: color,
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 