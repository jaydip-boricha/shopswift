
import { notFound } from 'next/navigation';
import { orders as placeholderOrders } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Order } from '@/lib/types';


export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const order = placeholderOrders.find(o => o.id === params.orderId);

  if (!order) {
    notFound();
  }
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-orange-100 text-orange-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link href="/admin/orders">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back to Orders</span>
              </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Order Details
            </h1>
            <Badge variant="outline" className={`ml-auto sm:ml-0 capitalize ${getStatusColor(order.status)}`}>
              {order.status}
            </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>
                  Date: {new Date(order.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map(item => (
                       <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                              <Image src={item.image.imageUrl} alt={item.image.description} fill className="object-cover" />
                          </div>
                          <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                          </div>
                          <p className="font-medium text-muted-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                 <div className="w-full">
                    <Separator className="my-4" />
                    <div className="flex justify-between font-bold text-lg">
                        <p>Total</p>
                        <p>₹{order.total.toFixed(2)}</p>
                    </div>
                 </div>
              </CardFooter>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p>{order.customer.name}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{order.customer.email}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Shipping Address</p>
                        <p className="break-words">{`${order.customer.address}, ${order.customer.city}, ${order.customer.state} ${order.customer.zip}`}</p>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
