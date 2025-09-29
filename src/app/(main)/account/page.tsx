

'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { orders as initialOrders } from "@/lib/placeholder-data"
import Image from "next/image"
import Link from "next/link"
import React, { useState, useEffect } from "react";
import type { Order } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface UserProfile {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    role?: string;
}

export default function AccountPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [userOrders, setUserOrders] = useState<Order[]>(initialOrders);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          // If the user is an admin, redirect them to the admin dashboard
          if (userData.role === 'admin') {
            router.push('/admin');
            return; // Stop further execution for admins on this page
          }
          setUserProfile(userData);
        }
        setAuthUser(user);
      } else {
        setAuthUser(null);
        setUserProfile(null);
        router.push('/login'); // Redirect to login if not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);


  const promptCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setIsAlertOpen(true);
  };

  const handleCancelOrder = () => {
    if (orderToCancel) {
      setUserOrders(currentOrders =>
        currentOrders.filter(order => order.id !== orderToCancel)
      );
      toast({
        title: "Order Cancelled",
        description: `Order #${orderToCancel} has been successfully cancelled.`,
      });
    }
    setIsAlertOpen(false);
    setOrderToCancel(null);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600';
      case 'Processing':
        return 'text-orange-500';
      case 'Shipped':
        return 'text-blue-500';
      case 'Cancelled':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };


  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
              <Card>
                  <CardHeader>
                      <CardTitle>My Details</CardTitle>
                      <CardDescription>Your personal information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                       {loading ? (
                         <div className="space-y-4">
                           <Skeleton className="h-4 w-2/3" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-4/5" />
                           <Skeleton className="h-10 w-full" />
                         </div>
                       ) : userProfile && authUser ? (
                        <>
                          <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Name</p>
                              <p className="break-words">{authUser.displayName}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Email</p>
                              <p className="break-words">{authUser.email}</p>
                          </div>
                          {userProfile.address && (
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Address</p>
                                <p className="break-words">{`${userProfile.address}, ${userProfile.city}, ${userProfile.state} ${userProfile.zip}`}</p>
                            </div>
                          )}
                          <Button className="w-full" asChild>
                              <Link href="/account/edit">Update Information</Link>
                          </Button>
                        </>
                       ) : authUser ? (
                         <div className="space-y-1">
                             <p className="text-sm font-medium text-muted-foreground">Name</p>
                             <p>{authUser.displayName}</p>
                             <p className="text-sm font-medium text-muted-foreground">Email</p>
                             <p>{authUser.email}</p>
                             <p className="mt-4 text-sm text-muted-foreground">User details not found.</p>
                         </div>
                       ) : (
                         <p>Please log in to view your account details.</p>
                       )}
                  </CardContent>
              </Card>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            <div className="space-y-8">
              {userOrders.length > 0 ? (
                userOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Order #{order.id}</CardTitle>
                          <CardDescription>Date: {new Date(order.date).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                           <p className={`text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Separator className="mb-4" />
                      <div className="space-y-4">
                          {order.items.map(item => (
                               <div key={item.id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                  <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                      <Image src={item.image.imageUrl} alt={item.image.description} fill className="object-cover" />
                                  </div>
                                  <div>
                                      <Link href={`/products/${item.slug}`} className="font-medium hover:text-primary">{item.name}</Link>
                                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                  </div>
                                  </div>
                                  <p className="font-medium text-muted-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                          ))}
                      </div>
                      {order.status === 'Processing' && (
                        <>
                          <Separator className="my-4" />
                          <div className="flex justify-end">
                            <Button variant="destructive" size="sm" onClick={() => promptCancelOrder(order.id)}>
                              Cancel Order
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>You haven't placed any orders yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel your order #{orderToCancel}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToCancel(null)}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
