
'use client';

import { useRouter } from 'next/navigation';
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
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';


const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  longDescription: z.string().min(1, 'Long description is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  image: z.any().refine(files => files?.length > 0, 'Image is required.'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{name: string, label: string}[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesCollection = collection(db, 'categories');
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoriesList = categorySnapshot.docs.map(doc => {
            const data = doc.data();
            return { name: data.name, label: data.label };
        });
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      longDescription: '',
      price: 0,
      category: '',
    },
  });

  const fileRef = form.register("image");
  
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    if (!authUser) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a product. Please refresh and try again.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    
    try {
      const imageFile = data.image[0];
      const imageId = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, `products/${authUser.uid}/${imageId}`);
      
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

      await addDoc(collection(db, 'products'), {
        name: data.name,
        slug: slug,
        description: data.description,
        longDescription: data.longDescription,
        price: data.price,
        category: data.category,
        images: [{
          id: `img-${Date.now()}`,
          description: `An image of ${data.name}`,
          imageUrl: imageUrl,
          imageHint: data.name.split(' ').slice(0,2).join(' ').toLowerCase(),
        }],
        rating: Math.floor(Math.random() * 3) + 3,
        reviews: [],
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Product Created',
        description: `${data.name} has been successfully added.`,
      });

      router.push('/admin/products');
      router.refresh();

    } catch (error: any) {
      console.error('Error creating product:', error);
      let description = 'Could not create the product. Please try again.';
      if (error.code === 'storage/unauthorized') {
        description = "Permission denied. You are not authorized to upload images. Please check your Storage Rules in the Firebase Console.";
      } else if (error.code === 'permission-denied') {
        description = "Permission denied. You do not have the required permissions to create products. Ensure your account has the 'admin' role.";
      }
      toast({
        title: 'Creation Failed',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || loadingCategories || authLoading;

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
              Insert New Product
            </h1>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
                Fill out the form below to add a new product to your store.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Classic T-Shirt" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="A brief description shown in product cards." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="longDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="A detailed description for the product page." rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="99.99" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingCategories}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingCategories ? "Loading..." : "Select a category"} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.name} value={cat.name} className="capitalize">
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isButtonDisabled}>
                        {isSubmitting ? 'Inserting...' : 'Insert Product'}
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
    </div>
  );
}
