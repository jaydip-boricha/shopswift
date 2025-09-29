import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import AddToCartButton from './product/add-to-cart-button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg h-full">
      <CardHeader className="p-0">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="aspect-square relative w-full overflow-hidden">
            <Image
              src={product.images[0].imageUrl}
              alt={product.images[0].description}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              data-ai-hint={product.images[0].imageHint}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2 capitalize">{product.category}</Badge>
        <CardTitle className="text-lg leading-tight mb-2">
          <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-xl font-semibold">₹{product.price.toFixed(2)}</p>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}
