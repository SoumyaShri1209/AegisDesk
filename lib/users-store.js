import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { company: true },
  });
}

export async function createUser({
  email,
  name,
  password,
  role,
  department = null,
  companyId,
  companyName = null,
  companyDomain = null,
}) {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) throw new Error("A user with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    if (companyName) {
      const company = await tx.company.create({
        data: {
          id: companyId,
          name: companyName,
          domain: companyDomain || null,
        },
      });
      companyId = company.id;
    }

    return tx.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role,
        department,
        companyId,
      },
    });
  });
}

export async function listCompanies() {
  return prisma.company.findMany({ orderBy: { createdAt: "desc" } });
}