
'use server';

import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { products as placeholderProducts, categories as placeholderCategories } from './placeholder-data';

export async function seedDatabase() {
  const productsCollection = collection(db, 'products');
  const categoriesCollection = collection(db, 'categories');
  const batch = writeBatch(db);

  // Seed Products
  placeholderProducts.forEach((product) => {
    const docRef = doc(productsCollection, product.id);
    const sanitizedProduct = {
      ...product,
      images: product.images.map(img => ({
          id: img.id,
          description: img.description,
          imageUrl: img.imageUrl,
          imageHint: img.imageHint,
      }))
    };
    batch.set(docRef, sanitizedProduct);
  });

  // Seed Categories
  placeholderCategories.forEach((category) => {
    // Use the category name (e.g., 'clothing') as the document ID
    const docRef = doc(categoriesCollection, category.name);
    batch.set(docRef, category);
  });


  try {
    // Commit the batch
    await batch.commit();
    console.log('Database seeded successfully with products and categories!');
    return { success: true, message: 'Database seeded successfully with products and categories!' };
  } catch (error) {
    // Log the actual error to the server console for better debugging
    console.error('Error seeding database:', error);
    return { success: false, message: 'Error seeding database.' };
  }
}
