import prismaClient from '@/lib/prisma-client'

const prisma = prismaClient

async function main() {
  try {
    // Set deadline to 5 days from now at 5pm
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 5)
    deadline.setHours(17, 0, 0, 0)
    
    // Create the record using Prisma
    const result = await prisma.paywallDeadline.create({
      data: {
        deadline: deadline
      }
    })
    
    console.log('Successfully created deadline:', result)
  } catch (error) {
    console.error('Error creating deadline:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 