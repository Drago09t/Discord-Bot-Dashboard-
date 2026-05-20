import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    Plus,
    Trash2,
    Edit2,
    Coins,
    Package,
    Image as ImageIcon,
    Tag,
    Shield,
    Save,
    X,
    Info,
    AlertCircle,
    Wallet
} from 'lucide-react';

const EconomyShop = ({ guild }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        role_id: '',
        stock: -1,
        image_url: '',
        icon: ''
    });

    useEffect(() => {
        if (guild?.id) {
            fetchItems();
            fetchRoles();
            fetchBalance();
        }
    }, [guild?.id]);

    const fetchItems = async () => {
        try {
            const res = await axios.get(`/api/shop/${guild.id}`);
            setItems(res.data.items);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch items');
            setLoading(false);
        }
    };

    const fetchBalance = async () => {
        try {
            const res = await axios.get(`/api/user/balance/${guild.id}`);
            setBalance(res.data.balance);
        } catch (err) {
            console.error('Failed to fetch balance');
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await axios.get(`/api/guild/${guild.id}/roles`);
            setRoles(res.data);
        } catch (err) {
            console.error('Failed to fetch roles');
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description || '',
                price: item.price.toString(),
                role_id: item.role_id || '',
                stock: item.stock,
                image_url: item.image_url || '',
                icon: item.icon || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                role_id: '',
                stock: -1,
                image_url: '',
                icon: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                price: parseInt(formData.price),
                stock: parseInt(formData.stock),
                id: editingItem?.id
            };

            await axios.post(`/api/shop/${guild.id}`, dataToSubmit);
            fetchItems();
            setIsModalOpen(false);
        } catch (err) {
            alert('Failed to save item: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await axios.delete(`/api/shop/${guild.id}/${id}`);
            fetchItems();
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Store className="text-pink-500" size={32} />
                        Economy Shop Manager
                    </h1>
                    <p className="text-slate-400 mt-1">Create and manage your server's virtual store.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Balance</p>
                            <p className="text-lg font-black text-white">{balance.toLocaleString()} <span className="text-xs text-yellow-500 font-bold">COINS</span></p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-pink-500/20 active:scale-95"
                    >
                        <Plus size={20} />
                        Create Item
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                    <div className="p-6 bg-white/5 rounded-full mb-4">
                        <Store size={48} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">No items found</h3>
                    <p className="text-slate-400 mt-2">Start by creating your first shop item.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-pink-500/30 transition-all flex flex-col gap-4"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-white/5 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl">{item.icon || '📦'}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Coins size={12} className="text-yellow-500" />
                                        <span className="text-xs font-black text-slate-300">{item.price.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2 h-8 leading-relaxed">
                                {item.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                <div className="flex gap-2">
                                    {item.role_id && (
                                        <div className="w-5 h-5 bg-violet-500/10 rounded flex items-center justify-center text-violet-400" title="Role Reward">
                                            <Shield size={10} />
                                        </div>
                                    )}
                                    <div className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                                        {item.stock === -1 ? '∞' : item.stock}
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Stock Available</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#0F0F15] border border-white/10 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                                        <div className="p-2.5 bg-pink-500/20 rounded-xl text-pink-500">
                                            {editingItem ? <Edit2 size={20} /> : <Plus size={20} />}
                                        </div>
                                        {editingItem ? 'Edit Item' : 'New Shop Item'}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Item Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-xs outline-none focus:border-pink-500/50 transition-all font-medium text-white"
                                                placeholder="e.g. VIP"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Price (Coins)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-xs outline-none focus:border-pink-500/50 transition-all font-medium text-white"
                                                placeholder="500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[80px] text-xs outline-none focus:border-pink-500/50 transition-all font-medium text-white resize-none"
                                            placeholder="Item details..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Role Reward</label>
                                            <select
                                                value={formData.role_id}
                                                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-xs outline-none focus:border-pink-500/50 transition-all font-medium text-white"
                                            >
                                                <option value="">No Role</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Initial Stock</label>
                                            <input
                                                type="number"
                                                min="-1"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-xs outline-none focus:border-pink-500/50 transition-all font-medium text-white"
                                                placeholder="-1 for infinite"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Image URL</label>
                                            <input
                                                type="text"
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-xs outline-none focus:border-pink-500/50 transition-all font-medium text-white"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Icon (Emoji)</label>
                                            <input
                                                type="text"
                                                value={formData.icon}
                                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-xs outline-none focus:border-pink-500/50 transition-all font-medium text-white"
                                                placeholder="e.g. ⭐"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 flex gap-3 text-left">
                                        <AlertCircle className="text-yellow-500 shrink-0" size={16} />
                                        <p className="text-[10px] text-slate-400 leading-relaxed">
                                            Bot role must be higher than the reward role to assign it.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-pink-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Save size={18} />
                                        {editingItem ? 'Update Item' : 'Create Item'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EconomyShop;
