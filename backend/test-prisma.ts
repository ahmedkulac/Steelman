
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
    console.log('Testing Prisma...');
    try {
        const count = await prisma.claim.count();
        console.log('Claim count:', count);

        const newClaim = await prisma.claim.create({
            data: {
                content: "Test claim " + Date.now(),
                processingStatus: 'processing'
            }
        });
        console.log('Created claim:', newClaim.id);

        await prisma.claim.delete({ where: { id: newClaim.id } });
        console.log('Deleted claim');
    } catch (error: any) {
        console.error('Prisma Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testPrisma();
