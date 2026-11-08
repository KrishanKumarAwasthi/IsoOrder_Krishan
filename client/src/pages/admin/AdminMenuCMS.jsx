import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Flame,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  X,
} from 'lucide-react';

import { API_BASE } from '../../config/api';

export default function AdminMenuCMS() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletForStock, setSelectedOutletForStock] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: '',
    priceBangalore: '',
    isVeg: false,
    spiceLevel: 3,
    allergens: '',
    photo: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catRes, outletRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/menu-items`),
        axios.get(`${API_BASE}/admin/categories`),
        axios.get(`${API_BASE}/admin/outlets`),
      ]);
      setItems(itemsRes.data.data || []);
      setCategories(catRes.data.data || []);
      const outList = outletRes.data.data || [];
      setOutlets(outList);
      if (outList.length > 0) {
        setSelectedOutletForStock(outList[0]._id);
      }
    } catch (err) {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: categories[0]?._id || '',
      basePrice: '',
      priceBangalore: '',
      isVeg: false,
      spiceLevel: 3,
      allergens: 'Dairy',
      photo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category?._id || item.category || categories[0]?._id || '',
      basePrice: item.basePrice || '',
      priceBangalore: item.priceByCity?.Bangalore || '',
      isVeg: item.isVeg || false,
      spiceLevel: item.spiceLevel || 3,
      allergens: (item.allergens || []).join(', '),
      photo: item.photo || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        basePrice: parseFloat(formData.basePrice),
        priceByCity: {
          Hyderabad: parseFloat(formData.basePrice),
          ...(formData.priceBangalore && { Bangalore: parseFloat(formData.priceBangalore) }),
        },
        isVeg: formData.isVeg,
        spiceLevel: parseInt(formData.spiceLevel),
        allergens: formData.allergens.split(',').map((s) => s.trim()).filter(Boolean),
        photo: formData.photo,
      };

      if (editingItem) {
        const res = await axios.put(`${API_BASE}/admin/menu-items/${editingItem._id}`, payload);
        setItems((prev) => prev.map((i) => (i._id === editingItem._id ? res.data.data : i)));
        setFeedback({ type: 'success', message: 'Item updated successfully!' });
      } else {
        const res = await axios.post(`${API_BASE}/admin/menu-items`, payload);
        setItems((prev) => [res.data.data, ...prev]);
        setFeedback({ type: 'success', message: 'New menu item created!' });
      }

      setIsModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to save item' });
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/menu-items/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setFeedback({ type: 'success', message: 'Item deleted.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Could not delete item' });
    }
  };

  const handleToggleStock = async (item) => {
    if (!selectedOutletForStock) return;
    const currentAvailability = item.outletAvailability?.find(
      (a) => a.outlet.toString() === selectedOutletForStock.toString()
    );
    const newStatus = currentAvailability ? !currentAvailability.isAvailable : false;

    try {
      await axios.put(`${API_BASE}/admin/menu-items/${item._id}/availability`, {
        outletId: selectedOutletForStock,
        isAvailable: newStatus,
      });

      setItems((prev) =>
        prev.map((i) => {
          if (i._id === item._id) {
            const updatedAvail = [...(i.outletAvailability || [])];
            const idx = updatedAvail.findIndex(
              (a) => a.outlet.toString() === selectedOutletForStock.toString()
            );
            if (idx > -1) {
              updatedAvail[idx].isAvailable = newStatus;
            } else {
              updatedAvail.push({ outlet: selectedOutletForStock, isAvailable: newStatus });
            }
            return { ...i, outletAvailability: updatedAvail };
          }
          return i;
        })
      );

      setFeedback({
        type: 'success',
        message: `Updated stock status for ${item.name}`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update stock' });
    }
  };

  const isItemAvailableForSelectedOutlet = (item) => {
    if (!selectedOutletForStock) return true;
    const record = item.outletAvailability?.find(
      (a) => a.outlet.toString() === selectedOutletForStock.toString()
    );
    return record ? record.isAvailable : true;
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.category?.name && i.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-sm">
                <UtensilsCrossed className="w-4 h-4" />
              </span>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">Central Menu CMS</h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Control prices across Hyderabad & Bangalore, customize portions, and manage live outlet stock.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Menu Item
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span className="font-semibold">{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-stone-400 hover:text-stone-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters and Outlet Stock Selector */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items or category..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Outlet Stock Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-stone-500 shrink-0" />
            <span className="text-xs font-semibold text-stone-600 shrink-0">Outlet Stock Control:</span>
            <select
              value={selectedOutletForStock}
              onChange={(e) => setSelectedOutletForStock(e.target.value)}
              className="text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {outlets.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} ({o.type === 'cloud_kitchen' ? 'Cloud' : 'Retail'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Spice / Allergens</th>
                  <th className="py-3 px-4">Outlet Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredItems.map((item) => {
                  const isStockAvailable = isItemAvailableForSelectedOutlet(item);

                  return (
                    <tr key={item._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                                  item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                                  }`}
                                />
                              </span>
                              <span className="font-bold text-stone-900">{item.name}</span>
                            </div>
                            <span className="text-[10px] text-stone-400">
                              {item.portions?.length > 1 ? `${item.portions.length} portion sizes` : 'Standard'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {item.category?.name || 'Unassigned'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">₹{item.basePrice}</div>
                        {item.priceByCity?.Bangalore && (
                          <div className="text-[10px] text-stone-400">
                            BLR: ₹{item.priceByCity.Bangalore}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-semibold text-amber-700">
                          <Flame className="w-3.5 h-3.5 text-orange-600" />
                          <span>Level {item.spiceLevel}/5</span>
                        </div>
                        {item.allergens?.length > 0 && (
                          <div className="text-[10px] text-stone-400 line-clamp-1">
                            {item.allergens.join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStock(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                            isStockAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {isStockAvailable ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-600" /> In Stock
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-rose-600" /> Out of Stock
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-white"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="p-1.5 rounded-lg border border-stone-200 text-rose-600 hover:bg-rose-50"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-stone-900">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Base Price (₹ - incl. 5% GST)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Bangalore Price (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.priceBangalore}
                      onChange={(e) => setFormData({ ...formData, priceBangalore: e.target.value })}
                      placeholder="Optional city override"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Spice Level (1 to 5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.spiceLevel}
                      onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">Allergens (comma separated)</label>
                  <input
                    type="text"
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    placeholder="e.g. Dairy, Nuts, Gluten"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">Photo Image URL</label>
                  <input
                    type="url"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>Vegetarian Item (Veg mark 🟢)</span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  >
                    {editingItem ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

