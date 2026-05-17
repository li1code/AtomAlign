import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create departments
  const engDept = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering' }
  });
  
  const hrDept = await prisma.department.upsert({
    where: { name: 'HR' },
    update: {},
    create: { name: 'HR' }
  });

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@atomberg.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@atomberg.com',
      password: hashedPassword,
      role: 'ADMIN',
      departmentId: hrDept.id
    }
  });

  const manager1 = await prisma.user.upsert({
    where: { email: 'manager@atomberg.com' },
    update: {},
    create: {
      name: 'Engineering Manager',
      email: 'manager@atomberg.com',
      password: hashedPassword,
      role: 'MANAGER',
      departmentId: engDept.id
    }
  });

  const employee1 = await prisma.user.upsert({
    where: { email: 'employee@atomberg.com' },
    update: {},
    create: {
      name: 'Software Engineer',
      email: 'employee@atomberg.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      departmentId: engDept.id,
      managerId: manager1.id
    }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
