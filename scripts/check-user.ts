import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

async function checkUser() {
  const searchTerm = process.argv[2] || 'erica';
  
  console.log(`Searching for users matching: ${searchTerm}`);
  
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(
      sql`LOWER(${user.name}) LIKE LOWER(${'%' + searchTerm + '%'}) OR LOWER(${user.email}) LIKE LOWER(${'%' + searchTerm + '%'})`
    )
    .orderBy(user.createdAt);
  
  console.log(`Found ${users.length} users:`);
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email}) - Created: ${u.createdAt}`);
  });
  
  if (users.length === 0) {
    console.log('No users found. Erica may not have signed up yet.');
  }
}

checkUser().catch(console.error).finally(() => process.exit(0));
