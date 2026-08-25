import { prisma } from "@/lib/prisma";

export function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, colorHex: true },
    orderBy: { name: "asc" },
  });
}
