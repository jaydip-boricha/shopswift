import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ShopSwift. All rights reserved.
            </p>
          </div>
          <nav className="flex space-x-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
            <Link href="/#featured-products" className="text-muted-foreground hover:text-primary">Products</Link>
            <Link href="/cart" className="text-muted-foreground hover:text-primary">Cart</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
