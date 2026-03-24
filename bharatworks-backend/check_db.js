const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, phone: true, balance: true }
    });
    console.log('Users:', JSON.stringify(users, null, 2));

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0,0,0,0))
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Payments Today:', JSON.stringify(payments, null, 2));

    const attendance = await prisma.attendance.findMany({
       where: {
        createdAt: {
          gte: new Date(new Date().setHours(0,0,0,0))
        }
      }
    });
    console.log('Attendance Today:', JSON.stringify(attendance, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
