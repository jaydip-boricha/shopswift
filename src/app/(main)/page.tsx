
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { products, categories } from '@/lib/placeholder-data';
import ProductCard from '@/components/product-card';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function TempHomePage() {
  const heroImage = placeholderImages.find(img => img.id === 'hero-background');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchTerm = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] text-primary-foreground overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-shadow-lg">
            Find Your Style
          </h1>
          <p className="max-w-2xl text-lg md:text-xl mb-8">
            Browse our curated collection of high-quality products, from fashion to home essentials.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/#products-section">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="products-section" className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-4">
              Our Products
            </h2>
             <div className="flex flex-wrap justify-center gap-2 mt-6">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => handleCategoryChange('all')}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? 'default' : 'outline'}
                    onClick={() => handleCategoryChange(category.name)}
                    className="capitalize"
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold">No products found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
