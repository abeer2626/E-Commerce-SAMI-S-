'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  FolderTree,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronRight,
  Star,
  Boxes,
} from 'lucide-react';
import Link from 'next/link';

interface CategoryStats {
  name: string;
  productCount: number;
  averagePrice: number;
  totalValue: number;
  totalStock: number;
  lowStockCount: number;
  featuredCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'avgPrice' | 'revenue'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryStats | null>(null);
  const [targetCategory, setTargetCategory] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  useEffect(() => {
    // Filter categories based on search query
    if (searchQuery) {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        order: sortOrder,
      });

      const response = await fetch(`/api/admin/categories?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        setFilteredCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'name' | 'count' | 'avgPrice' | 'revenue') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleRename = async () => {
    if (!selectedCategory || !newCategoryName) return;

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rename',
          oldName: selectedCategory.name,
          newName: newCategoryName,
        }),
      });

      if (response.ok) {
        await fetchCategories();
        setShowRenameDialog(false);
        setSelectedCategory(null);
        setNewCategoryName('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to rename category');
      }
    } catch (error) {
      console.error('Failed to rename category:', error);
      alert('Failed to rename category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!selectedCategory || !targetCategory) return;

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'merge',
          sourceCategory: selectedCategory.name,
          targetCategory: targetCategory,
        }),
      });

      if (response.ok) {
        await fetchCategories();
        setShowMergeDialog(false);
        setSelectedCategory(null);
        setTargetCategory('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to merge categories');
      }
    } catch (error) {
      console.error('Failed to merge categories:', error);
      alert('Failed to merge categories');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (category: CategoryStats) => {
    if (category.productCount > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${category.productCount} product(s). Reassign products first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories?name=${encodeURIComponent(category.name)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getSortIcon = (field: 'name' | 'count' | 'avgPrice' | 'revenue') => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortOrder === 'asc' ? (
      <TrendingUp className="w-4 h-4 text-primary-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-primary-600" />
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage product categories</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FolderTree className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              {searchQuery ? 'No categories found matching your search' : 'No categories found'}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase">
                <button
                  onClick={() => handleSort('name')}
                  className="col-span-3 flex items-center space-x-1 hover:text-gray-700 transition"
                >
                  <span>Category Name</span>
                  {getSortIcon('name')}
                </button>
                <button
                  onClick={() => handleSort('count')}
                  className="col-span-2 flex items-center space-x-1 hover:text-gray-700 transition"
                >
                  <span>Products</span>
                  {getSortIcon('count')}
                </button>
                <button
                  onClick={() => handleSort('avgPrice')}
                  className="col-span-2 flex items-center space-x-1 hover:text-gray-700 transition"
                >
                  <span>Avg Price</span>
                  {getSortIcon('avgPrice')}
                </button>
                <button
                  onClick={() => handleSort('revenue')}
                  className="col-span-2 flex items-center space-x-1 hover:text-gray-700 transition"
                >
                  <span>Total Value</span>
                  {getSortIcon('revenue')}
                </button>
                <div className="col-span-1 text-center">Stock</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <div
                    key={category.name}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition items-center"
                  >
                    {/* Category Name */}
                    <div className="col-span-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                          <FolderTree className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900 truncate">
                          {category.name}
                        </span>
                      </div>
                    </div>

                    {/* Product Count */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-1 text-gray-700">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{category.productCount}</span>
                      </div>
                      {category.featuredCount > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-yellow-600 mt-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{category.featuredCount} featured</span>
                        </div>
                      )}
                    </div>

                    {/* Average Price */}
                    <div className="col-span-2">
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(category.averagePrice)}
                      </span>
                    </div>

                    {/* Total Value */}
                    <div className="col-span-2">
                      <span className="text-primary-600 font-semibold">
                        {formatCurrency(category.totalValue)}
                      </span>
                    </div>

                    {/* Stock */}
                    <div className="col-span-1">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-gray-700">
                          <Boxes className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{category.totalStock}</span>
                        </div>
                        {category.lowStockCount > 0 && (
                          <div className="flex items-center justify-center space-x-1 text-xs text-orange-600 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{category.lowStockCount} low</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/products?category=${encodeURIComponent(category.name)}`}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="View products"
                      >
                        <Package className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setNewCategoryName(category.name);
                          setShowRenameDialog(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Rename"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowMergeDialog(true);
                        }}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Merge into another category"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {category.productCount === 0 && (
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete empty category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Showing {filteredCategories.length} of {categories.length} categories
                  </span>
                  <span className="text-gray-900 font-semibold">
                    Total Value: {formatCurrency(categories.reduce((sum, cat) => sum + cat.totalValue, 0))}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      {showRenameDialog && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rename Category
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Name
                </label>
                <input
                  type="text"
                  value={selectedCategory.name}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will rename the category for {selectedCategory.productCount} product(s)
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRenameDialog(false);
                  setSelectedCategory(null);
                  setNewCategoryName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={actionLoading || !newCategoryName || newCategoryName === selectedCategory.name}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Dialog */}
      {showMergeDialog && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Merge Categories
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Category (will be removed)
                </label>
                <input
                  type="text"
                  value={selectedCategory.name}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Category (products will move here)
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select target category...</option>
                  {categories
                    .filter((c) => c.name !== selectedCategory.name)
                    .map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} ({cat.productCount} products)
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCategory.productCount} product(s) will be moved to the target category
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMergeDialog(false);
                  setSelectedCategory(null);
                  setTargetCategory('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMerge}
                disabled={actionLoading || !targetCategory}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Merging...' : 'Merge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
