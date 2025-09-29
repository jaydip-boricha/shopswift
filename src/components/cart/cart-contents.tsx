'use client';

import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

export default function CartContents() {
  const { state, dispatch } = useCart();
  const { items } = state;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: isNaN(quantity) ? 0 : quantity } });
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-12">
      <div className="md:col-span-2 space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
              <Image src={item.image.imageUrl} alt={item.image.description} fill className="object-cover" />
            </div>
            <div className="flex-grow">
              <Link href={`/products/${item.slug}`} className="font-semibold hover:text-primary">{item.name}</Link>
              <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={item.quantity || ''}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                className="w-16 h-9 text-center"
                min="0"
              />
            </div>
            <p className="font-semibold w-24 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-muted-foreground hover:text-destructive">
              <X className="h-5 w-5" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
        ))}
      </div>
      <div className="md:col-span-1">
        <div className="p-6 border rounded-lg sticky top-24">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="flex justify-between text-muted-foreground mb-2">
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground mb-4">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold text-xl mb-6">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
