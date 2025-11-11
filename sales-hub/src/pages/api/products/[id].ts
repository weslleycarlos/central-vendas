
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // const product = await prisma.product.findUnique({ where: { id: String(id) } });
    // if (product) {
    //   res.status(200).json(product);
    // } else {
    //   res.status(404).json({ message: 'Product not found' });
    // }
    res.status(200).json({ message: `GET /api/products/${id} not implemented yet` });
  } else if (req.method === 'PUT') {
    // const { name, description, sku } = req.body;
    // const updatedProduct = await prisma.product.update({
    //   where: { id: String(id) },
    //   data: { name, description, sku },
    // });
    // res.status(200).json(updatedProduct);
    res.status(200).json({ message: `PUT /api/products/${id} not implemented yet` });
  } else if (req.method === 'DELETE') {
    // await prisma.product.delete({ where: { id: String(id) } });
    // res.status(204).end();
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
