const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('Creating notifications table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."notifications" (
          "id" UUID NOT NULL DEFAULT gen_random_uuid(),
          "user_id" UUID NOT NULL,
          "title" TEXT NOT NULL,
          "body" TEXT NOT NULL,
          "type" TEXT,
          "read" BOOLEAN NOT NULL DEFAULT false,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('Table created or already exists.');

    console.log('Creating index...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "public"."notifications"("user_id");
    `);
    console.log('Index created or already exists.');

    console.log('Creating foreign key...');
    // We wrap this in a try-catch because there is no IF NOT EXISTS for ADD CONSTRAINT in standard postgres
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "public"."notifications" 
        ADD CONSTRAINT "notifications_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('Foreign key created.');
    } catch (e) {
      console.log('Foreign key might already exist:', e.message);
    }
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
