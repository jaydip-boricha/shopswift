
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
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const categorySchema = z.object({
  label: z.string().min(1, 'Category label is required'),
  name: z.string().min(1, 'Category name/slug is required'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      label: '',
      name: '',
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      if (typeof id !== 'string') {
          router.push('/admin/categories');
          return;
      }
      try {
        const categoryDocRef = doc(db, 'categories', id);
        const categoryDoc = await getDoc(categoryDocRef);
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          form.reset({
            label: categoryData.label,
            name: categoryData.name,
          });
        } else {
          toast({ title: "Error", description: "Category not found.", variant: "destructive" });
          router.push('/admin/categories');
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        toast({ title: "Error", description: "Failed to fetch category details.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, form, router, toast]);

  const onSubmit = async (data: CategoryFormValues) => {
    if (typeof id !== 'string') return;
    
    startTransition(async () => {
      try {
        const categoryDocRef = doc(db, 'categories', id);
        await updateDoc(categoryDocRef, {
          label: data.label,
        });

        toast({
          title: 'Category Updated',
          description: `${data.label} has been successfully updated.`,
        });

        router.push('/admin/categories');
      } catch (error) {
        console.error('Error updating category:', error);
        toast({
          title: 'Update Failed',
          description: 'Could not update the category. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link href="/admin/categories">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Edit Category
            </h1>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
                Update the category label below. The name (slug) cannot be changed.
            </CardDescription>
            </CardHeader>
            <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category Label</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Home Goods" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category Name (Slug)</FormLabel>
                            <FormControl>
                                <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Updating...' : 'Update Category'}
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
