import { getProductRecommendations } from '@/ai/flows/product-recommendations';
import { products } from '@/lib/placeholder-data';
import type { Product } from '@/lib/types';
import ProductCard from '../product-card';
import { Separator } from '../ui/separator';

interface AiRecommendationsProps {
  currentProduct: Product;
}

export default async function AiRecommendations({ currentProduct }: AiRecommendationsProps) {
  const otherProducts = products.filter(p => p.id !== currentProduct.id);
  const existingProductNames = otherProducts.map(p => p.name);

  let recommendedProducts: Product[] = [];

  try {
    // Set a timeout for the AI call
    const result = await Promise.race([
      getProductRecommendations({
        productDescription: currentProduct.description,
        existingProducts: existingProductNames,
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)) // 5 second timeout
    ]);
    
    if (result && result.recommendedProducts) {
      recommendedProducts = otherProducts.filter(p => result.recommendedProducts.includes(p.name));
    }
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    // Silently fail, don't show recommendations if AI fails
  }

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
        <Separator className="my-8" />
        <h2 className="text-3xl font-bold text-center mb-10">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    </div>
  );
}
