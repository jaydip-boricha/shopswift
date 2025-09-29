
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
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useState, useTransition } from 'react';

const categorySchema = z.object({
  label: z.string().min(1, 'Category label is required'),
  name: z.string().min(1, 'Category name/slug is required')
    .regex(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase with no spaces, e.g. home-goods' }),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function NewCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      label: '',
      name: '',
    },
  });

  const onLabelChange = (label: string) => {
    const newSlug = label
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, ''); // Remove all non-word chars
    form.setValue('name', newSlug);
  }
  
  const onSubmit = async (data: CategoryFormValues) => {
    startTransition(async () => {
      try {
        // Use the name/slug as the document ID for easy lookup
        await setDoc(doc(db, 'categories', data.name), {
          name: data.name,
          label: data.label,
        });

        toast({
          title: 'Category Created',
          description: `${data.label} has been successfully added.`,
        });

        router.push('/admin/categories');
      } catch (error) {
        console.error('Error creating category:', error);
        toast({
          title: 'Creation Failed',
          description: 'Could not create the category. Please try again.',
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
              Insert New Category
            </h1>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
                Fill out the form below to add a new category to your store.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category Label</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="e.g. Home Goods" 
                                {...field} 
                                onChange={(e) => {
                                    field.onChange(e);
                                    onLabelChange(e.target.value);
                                }}
                            />
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
                            <Input placeholder="e.g. home-goods" {...field} />
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
                        {isPending ? 'Inserting...' : 'Insert Category'}
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
    </div>
  );
}
