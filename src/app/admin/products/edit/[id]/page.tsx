
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db, storage, auth } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  longDescription: z.string().min(1, 'Long description is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  image: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{name: string, label: string}[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, 'categories');
        const categorySnapshot = await getDocs(categoriesCollection);
        setCategories(categorySnapshot.docs.map(doc => ({ name: doc.data().name, label: doc.data().label })));
      } catch (error) {
        toast({ title: "Error", description: "Failed to load categories.", variant: "destructive" });
      }
    };

    const fetchProduct = async () => {
      if (typeof id !== 'string') {
          router.push('/admin/products');
          return;
      }
      try {
        const productDocRef = doc(db, 'products', id);
        const productDoc = await getDoc(productDocRef);
        if (productDoc.exists()) {
          const productData = productDoc.data();
          form.reset({
            name: productData.name,
            description: productData.description,
            longDescription: productData.longDescription,
            price: productData.price,
            category: productData.category,
          });
          if (productData.images && productData.images.length > 0) {
            setCurrentImageUrl(productData.images[0].imageUrl);
          }
        } else {
          toast({ title: "Error", description: "Product not found.", variant: "destructive" });
          router.push('/admin/products');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({ title: "Error", description: "Failed to fetch product details.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
    fetchProduct();
  }, [id, form, router, toast]);

  const fileRef = form.register("image");

  const onSubmit = async (data: ProductFormValues) => {
    if (typeof id !== 'string') return;
    
    const user = auth.currentUser;
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to update a product.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    try {
      const productDocRef = doc(db, 'products', id);
      let imageUrl = currentImageUrl;

      // Check if a new image file has been selected for upload
      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        const storageRef = ref(storage, `products/${user.uid}/${id}/${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

      const updatedData: any = {
        name: data.name,
        slug: slug,
        description: data.description,
        longDescription: data.longDescription,
        price: data.price,
        category: data.category,
      };

      // Only update the image if a new one was uploaded
      if (imageUrl && imageUrl !== currentImageUrl) {
          updatedData.images = [{
              id: `img-${id}-1`,
              description: `An image of ${data.name}`,
              imageUrl: imageUrl,
              imageHint: data.name.split(' ').slice(0,2).join(' ').toLowerCase(),
          }];
      }

      await updateDoc(productDocRef, updatedData);

      toast({
        title: 'Product Updated',
        description: `${data.name} has been successfully updated.`,
      });

      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update the product. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link href="/admin/products">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Edit Product
            </h1>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
                Update the product information below.
            </CardDescription>
            </CardHeader>
            <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="longDescription" render={({ field }) => (
                            <FormItem><FormLabel>Long Description</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <FormItem>
                            <FormLabel>Current Image</FormLabel>
                            {currentImageUrl && <Image src={currentImageUrl} alt="Current product image" width={100} height={100} className="rounded-md border" />}
                        </FormItem>

                        <FormField control={form.control} name="image" render={({ field }) => (
                            <FormItem><FormLabel>Upload New Image (Optional)</FormLabel><FormControl><Input type="file" accept="image/*" {...fileRef} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={categories.length === 0}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.name} value={cat.name} className="capitalize">{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : 'Update Product'}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
            </CardContent>
        </Card>
    </div>
  );
}
