import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/store/cart'

type ProductCardProps = {
  product: {
    id: string
    name: string
    description: string
    price: number
    mainImage: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCart((state) => state.addItem)

  return (
    <div className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
        <Image
          src={product.mainImage}
          alt={product.name}
          className="h-full w-full object-cover object-center lg:h-full lg:w-full"
          width={500}
          height={500}
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link href={`/products/${product.id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.description}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">₹{product.price}</p>
      </div>
      <button
        onClick={() => addToCart(product)}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Add to Cart
      </button>
    </div>
  )
}
