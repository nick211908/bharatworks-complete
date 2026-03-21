const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking Prisma setup...");
        
        const firstEmployer = await prisma.employer.findFirst();
        if (!firstEmployer) {
            console.log("No employer found.");
            return;
        }

        console.log("Found employer:", firstEmployer.id);

        const firstUser = await prisma.user.findUnique({ where: { id: firstEmployer.userId }, select: { balance: true } });
        console.log("User balance:", firstUser?.balance);
        
        // Test updating balance
        const currentBalance = Number(firstUser?.balance || 0);
        console.log("Numeric balance:", currentBalance);
        
        await prisma.user.update({
            where: { id: firstEmployer.userId },
            data: { balance: currentBalance - 10 },
        });

        console.log("Successfully updated balance!");
        
        // Test Attendance Job Relation Find
        const firstJob = await prisma.job.findFirst({ where: { employerId: firstEmployer.id } });
        if (!firstJob) return;

        console.log("Found job:", firstJob.id);
        
        const reservations = await prisma.reservation.findMany({
            where: {
                jobId: firstJob.id,
                job: { employerId: firstEmployer.id }
            },
            select: { id: true }
        });

        console.log("Found reservations:", reservations.length);
        
        if (reservations.length > 0) {
           await prisma.reservation.updateMany({
               where: { id: { in: reservations.map(r => r.id) } },
               data: { status: 'ATT_PRESENT' },
           });
           console.log("Successfully updated reservations!");
        }
        
    } catch (err) {
        console.error("PRISMA ERROR IS:", err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
