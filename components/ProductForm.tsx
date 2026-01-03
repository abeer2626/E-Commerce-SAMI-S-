'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string | null;
  featured: boolean;
}

interface ProductFormProps {
  vendorId: string;
  categories: string[];
  product?: Product;
}

export default function ProductForm({
  vendorId,
  categories,
  product,
}: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    product?.category || categories[0] || ''
  );
  const [image, setImage] = useState(product?.image || '');

  const isEditing = !!product;

  useEffect(() => {
    if (product?.category && !categories.includes(product.category)) {
      setCustomCategory(product.category);
      setSelectedCategory('custom');
    } else if (product?.category) {
      setSelectedCategory(product.category);
    }
  }, [product, categories]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const category = customCategory || selectedCategory;

    try {
      const url = isEditing ? `/api/vendor/products/${product.id}` : '/api/vendor/products';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price') as string),
          category,
          stock: parseInt(formData.get('stock') as string),
          image: image || null,
          featured: formData.get('featured') === 'on',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to ${isEditing ? 'update' : 'create'} product`);
      } else {
        toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
        router.push('/vendor/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      setError('An error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200"
        >
          {error}
        </motion.div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Product Name *
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={product?.name}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          placeholder="Enter product name"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
          placeholder="Describe your product"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Price ($) *
          </label>
          <input
            type="number"
            name="price"
            required
            step="0.01"
            min="0"
            defaultValue={product?.price}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            required
            min="0"
            defaultValue={product?.stock}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category *
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCustomCategory('');
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="custom">Custom category...</option>
        </select>
        {selectedCategory === 'custom' && (
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            required={!product}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="Enter category name"
          />
        )}
      </div>

      <ImageUpload
        value={image}
        onChange={setImage}
      />

      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          name="featured"
          id="featured"
          defaultChecked={product?.featured}
          className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="featured" className="ml-3 text-sm font-medium text-gray-700">
          Feature this product on homepage
        </label>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
        >
          {isLoading
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
            ? 'Update Product'
            : 'Create Product'}
        </motion.button>
      </div>
    </form>
  );
}
