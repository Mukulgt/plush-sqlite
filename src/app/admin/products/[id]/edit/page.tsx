import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductForm from '../../product-form'

export default async function EditProduct({
  params,
}: {
  params: { id: string }
}) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        gallery: true,
      },
    }),
    prisma.category.findMany(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Edit Product</h1>
      <div className="max-w-2xl mx-auto">
        <ProductForm
          initialData={product}
          categories={categories}
        />
      </div>
    </div>
  )
}
