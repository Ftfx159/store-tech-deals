const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'sony' } },
          { brand: { contains: 'sony' } }
        ]
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        discountedPrice: true
      },
      take: 5
    });
    console.log(products);
  } catch(e) {
    console.error(e);
  }
}
test();
