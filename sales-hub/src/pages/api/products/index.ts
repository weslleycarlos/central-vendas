
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // const products = await prisma.product.findMany();
    // res.status(200).json(products);
    res.status(200).json({ message: 'GET /api/products not implemented yet' });
  } else if (req.method === 'POST') {
    // const { name, description, sku } = req.body;
    // const newProduct = await prisma.product.create({
    //   data: { name, description, sku },
    // });
    // res.status(201).json(newProduct);
    res.status(201).json({ message: 'POST /api/products not implemented yet' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
