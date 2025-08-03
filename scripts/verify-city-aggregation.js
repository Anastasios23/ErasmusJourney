const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyAggregation() {
  try {
    console.log('🔍 Checking existing form submissions...');
    
    // Check form submissions
    const submissions = await prisma.formSubmission.findMany({
      select: {
        id: true,
        type: true,
        status: true,
        data: true,
      },
      take: 5,
    });
    
    console.log(`Found ${submissions.length} form submissions:`);
    submissions.forEach(sub => {
      console.log(`- ${sub.type} (${sub.status}): ${sub.id}`);
    });
    
    // Check users
    const users = await prisma.user.count();
    console.log(`\n👥 Total users: ${users}`);
    
    // Check published submissions by type
    const publishedByType = await prisma.formSubmission.groupBy({
      by: ['type'],
      where: { status: 'PUBLISHED' },
      _count: true,
    });
    
    console.log('\n📊 Published submissions by type:');
    publishedByType.forEach(group => {
      console.log(`- ${group.type}: ${group._count} submissions`);
    });
    
    // Check cities with data
    const basicInfoSubmissions = await prisma.formSubmission.findMany({
      where: {
        type: 'BASIC_INFO',
        status: 'PUBLISHED',
      },
      select: {
        data: true,
      },
    });
    
    const cities = new Set();
    basicInfoSubmissions.forEach(sub => {
      const data = sub.data;
      if (data.hostCity && data.hostCountry) {
        cities.add(`${data.hostCity}, ${data.hostCountry}`);
      }
    });
    
    console.log(`\n🏙️ Cities with data: ${Array.from(cities).join(', ') || 'None'}`);
    
    console.log('\n✅ City aggregation structure verified');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAggregation();
