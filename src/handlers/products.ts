import { APIGatewayProxyHandler } from 'aws-lambda'

type Product = {
  id: string
  name: string
  description?: string
  price: number
  inventory: number
}

const PRODUCTS: Product[] = [
  { id: 'prod-001', name: 'T-shirt', description: '100% cotton t-shirt', price: 19.99, inventory: 120 },
  { id: 'prod-002', name: 'Coffee Mug', description: 'Ceramic 12oz mug', price: 9.5, inventory: 80 },
  { id: 'prod-003', name: 'Notebook', description: 'Spiral notebook 120 pages', price: 5.25, inventory: 200 },
  { id: 'prod-004', name: 'Sticker Pack', description: 'Assorted tech stickers', price: 3.0, inventory: 500 }
]

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const productId = event.pathParameters && event.pathParameters['productId']
    if (productId) {
      const found = PRODUCTS.find((p) => p.id === productId)
      if (!found) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Product not found' })
        }
      }
      return {
        statusCode: 200,
        body: JSON.stringify(found)
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ products: PRODUCTS })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal error', error: String(err) })
    }
  }
}
