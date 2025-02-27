'use server'

import { WebhookEvent } from '@clerk/nextjs/server';
import prismaClient from "@/lib/prisma-client";

export async function handleClerkWebhook(evt: WebhookEvent) {
  console.log('Webhook received:', evt.type);
  console.log('Event data:', JSON.stringify(evt.data, null, 2));

  if (evt.type === 'user.created') {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;

    console.log('Processing user.created event for:', primaryEmail);

    if (!primaryEmail) {
      throw new Error('No email address found');
    }

    // Find the pending user
    const pendingUser = await prismaClient.pendingUser.findUnique({
      where: { email: primaryEmail },
    });

    console.log('Found pending user:', pendingUser);

    if (pendingUser) {
      // Create the actual user
      await prismaClient.user.create({
        data: {
          id: id, // Using Clerk's user ID
          email: primaryEmail,
          role: pendingUser.role,
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
        },
      });

      // Delete the pending user
      await prismaClient.pendingUser.delete({
        where: { email: primaryEmail },
      });
      
      console.log('Successfully created user and deleted pending user');
    }
  }
} 