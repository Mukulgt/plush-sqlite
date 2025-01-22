import { prisma } from '@/lib/prisma'
import ProductForm from '../product-form'

export default async function NewProduct() {
  const categories = await prisma.category.findMany()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Create New Product</h1>
      <div className="max-w-2xl mx-auto">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
