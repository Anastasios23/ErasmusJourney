#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSetup() {
  console.log("🚀 Checking Next.js + Prisma setup...");

  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check if universities exist
    const universityCount = await prisma.university.count();
    console.log(`📊 Found ${universityCount} universities in database`);

    // Check if agreements exist
    const agreementCount = await prisma.agreement.count();
    console.log(`🤝 Found ${agreementCount} partnership agreements`);

    // Check if users exist
    const userCount = await prisma.user.count();
    console.log(`👥 Found ${userCount} users in database`);

    if (universityCount > 0 && agreementCount > 0) {
      console.log(
        "\n🎉 Setup complete! Your Next.js Erasmus platform is ready.",
      );
      console.log("\n📋 Next steps:");
      console.log("1. Start the development server: npm run dev");
      console.log("2. Visit http://localhost:3000");
      console.log("3. Login with: admin@erasmus.cy / admin123");
      console.log("4. Explore the dashboard and university partnerships");
      console.log("\n🌟 Key features:");
      console.log("- SSR Home page with latest stories");
      console.log("- ISR Universities page (revalidated hourly)");
      console.log("- SSR Dashboard with user-specific data");
      console.log("- PostgreSQL database with Prisma ORM");
      console.log("- NextAuth.js authentication");
      console.log("- Tailwind CSS + shadcn/ui components");
    } else {
      console.log("\n⚠️  Setup incomplete. Run data migration:");
      console.log("npm run db:seed");
    }
  } catch (error) {
    console.error("❌ Setup check failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Ensure PostgreSQL is running");
    console.log("2. Check DATABASE_URL in .env file");
    console.log("3. Run: npm run db:push");
    console.log("4. Run: npm run db:seed");
  } finally {
    await prisma.$disconnect();
  }
}

checkSetup().catch(console.error);
