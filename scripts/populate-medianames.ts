import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Gets a common file extension from a MIME type string.
 * @param mimeType The MIME type (e.g., "image/jpeg", "video/mp4").
 * @returns A file extension string (e.g., "jpg", "mp4") or "unknown".
 */
function getExtensionFromMimeType(mimeType: string | null): string {
  if (!mimeType) return 'unknown';
  
  // Normalize to lowercase
  mimeType = mimeType.toLowerCase();

  const commonMappings: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov', // .mov files
    'video/webm': 'webm',
    'video/x-msvideo': 'avi', // .avi files
    'video/x-flv': 'flv',
    'video/x-matroska': 'mkv',
    'application/pdf': 'pdf',
    // Add more mappings as needed
  };

  if (commonMappings[mimeType]) {
    return commonMappings[mimeType];
  }

  // Fallback for less common or generic types
  const parts = mimeType.split('/');
  if (parts.length === 2) {
    return parts[1].split('+')[0]; // e.g., svg+xml -> svg
  }

  return 'bin'; // Generic binary if truly unknown
}

async function main() {
  console.log('Starting script to populate mediaNames for existing posts...');

  const postsToUpdate = await prisma.post.findMany({
    where: {
      mediaUrls: {
        not: false,
      },
      mediaNames: {
        isEmpty: true,
      }
    },
    select: {
      id: true,
      mediaUrls: true,
      mediaNames: true,
    },
  }) as { id: string; mediaUrls: string[]; mediaNames: string[] }[];

  if (postsToUpdate.length === 0) {
    console.log('No posts found needing mediaNames population (mediaUrls present and mediaNames empty).');
    return;
  }

  console.log(`Found ${postsToUpdate.length} posts to process.`);
  let postsSuccessfullyUpdated = 0;
  let postsFailedToUpdate = 0;
  let postsSkipped = 0;

  for (const post of postsToUpdate) {
    // Double-check condition: if mediaNames is already correctly populated for the number of mediaUrls, skip.
    // This handles cases where mediaNames might not be strictly empty but still needs full processing.
    if (post.mediaNames && post.mediaNames.length === post.mediaUrls?.length && post.mediaUrls.length > 0) {
      console.log(`Skipping post ${post.id} as mediaNames (${post.mediaNames.length}) matches mediaUrls (${post.mediaUrls.length}) length.`);
      postsSkipped++;
      continue;
    }
    
    if (!post.mediaUrls || post.mediaUrls.length === 0) {
      // This should be caught by the where clause, but as a safeguard.
      console.log(`Skipping post ${post.id} as it has no mediaUrls.`);
      postsSkipped++;
      continue;
    }

    const newMediaNames: string[] = [];
    console.log(`Processing post ${post.id} with ${post.mediaUrls.length} media URL(s)...`);

    for (let i = 0; i < post.mediaUrls.length; i++) {
      const url = post.mediaUrls[i];
      if (!url) { // Handle potential null/undefined URLs in array
        console.warn(`  Skipping null/undefined URL at index ${i} for post ${post.id}.`);
        newMediaNames.push(`media_${i}_invalid_url.unknown`);
        continue;
      }
      try {
        process.stdout.write(`  Fetching HEAD for URL ${i + 1}/${post.mediaUrls.length}: ${url.substring(0, 50)}... `);
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        const extension = getExtensionFromMimeType(contentType);
        const generatedName = `media_${i}.${extension}`; // e.g., media_0.jpg, media_1.mp4
        newMediaNames.push(generatedName);
        process.stdout.write(`Done. Type: ${contentType || 'N/A'}, Name: ${generatedName}\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        process.stdout.write(`Error: ${errorMessage}\n`);
        console.warn(`    Error fetching HEAD for ${url}. Assigning fallback name.`);
        newMediaNames.push(`media_${i}_fetch_error.unknown`);
      }
    }

    if (newMediaNames.length === post.mediaUrls.length) {
      try {
        await prisma.post.update({
          where: { id: post.id },
          data: { mediaNames: newMediaNames },
        });
        console.log(`  Successfully updated mediaNames for post ${post.id}.`);
        postsSuccessfullyUpdated++;
      } catch (dbError) {
        console.error(`  Failed to update post ${post.id} in database:`, dbError);
        postsFailedToUpdate++;
      }
    } else {
      console.warn(`  Skipping database update for post ${post.id} due to mismatch in generated mediaNames length (${newMediaNames.length}) vs mediaUrls length (${post.mediaUrls.length}). This should not happen.`);
      postsFailedToUpdate++;
    }
  }

  console.log('\n--- Script Finished ---');
  console.log(`Total posts queried for update: ${postsToUpdate.length}`);
  console.log(`Successfully updated: ${postsSuccessfullyUpdated} posts.`);
  console.log(`Failed to update/errors: ${postsFailedToUpdate} posts.`);
  console.log(`Skipped (already seemed populated or no URLs): ${postsSkipped} posts.`);
}

main()
  .catch((e) => {
    console.error('Unhandled error in main script execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  });
