import { notFound } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import AddToCartButton from '@/components/product/add-to-cart-button';
import AiRecommendations from '@/components/product/ai-recommendations';
import { Separator } from '@/components/ui/separator';

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-accent-foreground fill-accent' : 'text-muted-foreground'}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Card className="overflow-hidden">
            <div className="relative aspect-square w-full">
              <Image
                src={product.images[0].imageUrl}
                alt={product.images[0].description}
                fill
                className="object-cover"
                priority
                data-ai-hint={product.images[0].imageHint}
              />
            </div>
          </Card>
          {/* A simple gallery could go here */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {product.images.map(img => (
              <div key={img.id} className="relative aspect-square border rounded-lg overflow-hidden">
                 <Image
                    src={img.imageUrl}
                    alt={img.description}
                    fill
                    className="object-cover"
                    data-ai-hint={img.imageHint}
                  />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Badge variant="secondary" className="capitalize mb-2">{product.category}</Badge>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {renderStars(product.rating)}
            </div>
            <span className="text-muted-foreground text-sm">({product.reviews.length} reviews)</span>
          </div>
          <p className="text-3xl font-bold mb-6">₹{product.price.toFixed(2)}</p>
          <p className="text-muted-foreground mb-6">{product.longDescription}</p>
          <AddToCartButton product={product} />

          <Separator className="my-8" />

          <div>
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            <div className="space-y-6">
              {product.reviews.length > 0 ? product.reviews.map(review => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{review.author}</CardTitle>
                      <div className="flex items-center">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              )) : (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <AiRecommendations currentProduct={product} />
    </div>
  );
}
