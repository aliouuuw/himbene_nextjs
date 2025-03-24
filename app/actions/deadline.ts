'use server'

import prismaClient from '@/lib/prisma-client'

export async function getOrCreateDeadline() {
 
  
  // Try to find 1st deadline that is in the future
  let deadline = await prismaClient.paywallDeadline.findFirst()
  
  // If no deadline exists, create one (7 days from now)
  if (!deadline) {
    const newDeadline = new Date()
    newDeadline.setDate(newDeadline.getDate() + 7)
    
    deadline = await prismaClient.paywallDeadline.create({
      data: {
        deadline: newDeadline
      }
    })
  }
  
  return deadline
} 