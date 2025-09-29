import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CartContents from '@/components/cart/cart-contents';

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Your Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <CartContents />
        </CardContent>
      </Card>
    </div>
  );
}
