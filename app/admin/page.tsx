'use client';

import { useMemo, useState } from 'react';
import { Shield, Plus, Edit, Trash2, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { FirstResponder, Category, FilterState } from '@/types';
import { dummyFirstResponders } from '@/data/dummyData';

export default function AdminDashboard() {
  const [responders, setResponders] = useState<FirstResponder[]>(dummyFirstResponders);
  const [editingResponder, setEditingResponder] = useState<FirstResponder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    title: '',
    category: 'All',
    city: '',
    state: '',
  });
  const [formData, setFormData] = useState<Partial<FirstResponder>>({
    title: '',
    category: 'Police',
    city: '',
    state: '',
    address: '',
    locationLat: 0,
    locationLng: 0,
    phoneNumber: '',
    websiteUrl: '',
    googleLocationUrl: '',
  });

  const categories: Category[] = ['Police', 'Fire', 'Ambulance', 'Hospital', 'Emergency'];

  const handleAdd = () => {
    setEditingResponder(null);
    setFormData({
      title: '',
      category: 'Police',
      city: '',
      state: '',
      address: '',
      locationLat: 0,
      locationLng: 0,
      phoneNumber: '',
      websiteUrl: '',
      googleLocationUrl: '',
    });
    setShowForm(true);
  };

  const handleEdit = (responder: FirstResponder) => {
    setEditingResponder(responder);
    setFormData(responder);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setResponders(responders.filter((r) => r.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResponder) {
      // Update existing
      setResponders(
        responders.map((r) => (r.id === editingResponder.id ? { ...formData, id: editingResponder.id } as FirstResponder : r))
      );
    } else {
      // Add new
      const newResponder: FirstResponder = {
        id: Date.now().toString(),
        ...formData,
      } as FirstResponder;
      setResponders([...responders, newResponder]);
    }
    setShowForm(false);
    setEditingResponder(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingResponder(null);
    setFormData({
      title: '',
      category: 'Police',
      city: '',
      state: '',
      address: '',
      locationLat: 0,
      locationLng: 0,
      phoneNumber: '',
      websiteUrl: '',
      googleLocationUrl: '',
    });
  };

  const filteredResponders = useMemo(() => {
    let list = [...responders];
    if (filters.title.trim()) {
      const q = filters.title.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q)
      );
    }
    if (filters.category !== 'All') list = list.filter((r) => r.category === filters.category);
    if (filters.city) list = list.filter((r) => r.city === filters.city);
    if (filters.state) list = list.filter((r) => r.state === filters.state);
    return list;
  }, [responders, filters]);

  const availableCities = useMemo(() => Array.from(new Set(responders.map((r) => r.city))).sort(), [responders]);
  const availableStates = useMemo(() => Array.from(new Set(responders.map((r) => r.state))).sort(), [responders]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-blue-200 text-xs sm:text-sm">Manage First Responders</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Map</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Actions + Filters */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Entry
            </button>
            <span className="text-sm text-gray-500">{filteredResponders.length} records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value as Category | 'All' })}
              className="px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 24 24'><path d='M6.707 9.293 12 14.586l5.293-5.293 1.414 1.414L12 17.414l-6.707-6.707z'/></svg>\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'calc(100% - 12px) center',
              }}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 24 24'><path d='M6.707 9.293 12 14.586l5.293-5.293 1.414 1.414L12 17.414l-6.707-6.707z'/></svg>\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'calc(100% - 12px) center',
              }}
            >
              <option value="">All Cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 24 24'><path d='M6.707 9.293 12 14.586l5.293-5.293 1.414 1.414L12 17.414l-6.707-6.707z'/></svg>\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'calc(100% - 12px) center',
              }}
            >
              <option value="">All States</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCancel}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCancel}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                aria-label="Close form"
              >
                <ArrowLeft className="w-4 h-4 rotate-180 hidden" />
                <span className="sr-only">Close</span>
                <Trash2 className="hidden" />
                <X className="w-5 h-5" />
              </button>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingResponder ? 'Edit Entry' : 'Add New Entry'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.locationLat}
                        onChange={(e) => setFormData({ ...formData, locationLat: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.locationLng}
                        onChange={(e) => setFormData({ ...formData, locationLng: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={formData.websiteUrl || ''}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Google Maps URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={formData.googleLocationUrl}
                        onChange={(e) => setFormData({ ...formData, googleLocationUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {editingResponder ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponders.map((responder) => (
                  <tr key={responder.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {responder.title}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          responder.category === 'Police'
                            ? 'bg-blue-100 text-blue-800'
                            : responder.category === 'Fire'
                            ? 'bg-red-100 text-red-800'
                            : responder.category === 'Ambulance'
                            ? 'bg-green-100 text-green-800'
                            : responder.category === 'Hospital'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {responder.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {responder.city}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {responder.state}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {responder.phoneNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(responder)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(responder.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredResponders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No entries found. Add your first entry to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

