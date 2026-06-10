import React, { useState, useRef } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaStore } from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';
import { groceryPresets, starterCollections } from '../data/groceryPresets';
import AppFooter from '../components/AppFooter';

function AddItem() {
    const navigate = useNavigate()
    const { categories: categoryRecords } = useSelector(state => state.user)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState(0)
    const [stock, setStock] = useState(0)
    const [unit, setUnit] = useState("pieces")
    const [featured, setFeatured] = useState(false)
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [category, setCategory] = useState("")
    const [foodType, setFoodType] = useState("veg")
    const [presetQuery, setPresetQuery] = useState("")
    
    const fileInputRef = useRef(null)
    const dispatch = useDispatch()

    const categories = categoryRecords?.length ? categoryRecords.map(category => category.name) : [
        "Produce",
        "Dairy & Eggs",
        "Beverages",
        "Snacks",
        "Pantry",
        "Meat & Seafood",
        "Household",
        "Personal Care",
        "Bakery",
        "Others"
    ]

    const visiblePresets = groceryPresets.filter((preset) => {
        const query = presetQuery.trim().toLowerCase()
        const matchesQuery = !query || preset.name.toLowerCase().includes(query) || preset.category.toLowerCase().includes(query)
        const matchesCategory = !category || preset.category === category
        return matchesQuery && matchesCategory
    })

    const applyPreset = (preset) => {
        setName(preset.name)
        setDescription(preset.description)
        setCategory(preset.category)
        setFoodType(preset.foodType)
        setUnit(preset.unit)
        setStock(preset.stock)
        setFeatured(preset.featured)
        setPrice(preset.priceHint)
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    }

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (file) {
            setBackendImage(file)
            setFrontendImage(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("description", description)
            formData.append("category", category)
            formData.append("foodType", foodType)
            formData.append("price", price)
            formData.append("stock", stock)
            formData.append("unit", unit)
            formData.append("featured", featured)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            const result = await axios.post(`${serverUrl}/api/item/add-item`, formData, { withCredentials: true })
            dispatch(setMyShopData(result.data))
            setLoading(false)
            navigate("/")
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#f4fbf7] via-[#fafdfc] to-[#fffcfb] flex flex-col items-center px-4 py-12 relative overflow-hidden animate-fade-in">
            {/* Decorative Blur Backgrounds */}
            <div className="absolute w-[300px] h-[300px] bg-green-500/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
            <div className="absolute w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-2xl -bottom-20 -right-20 pointer-events-none" />

            {/* Back Button */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-green-50 text-[#00b252] transition cursor-pointer active:scale-90"
            >
                <IoIosArrowRoundBack size={32} />
            </button>

            <div className="mx-auto mt-auto grid w-full max-w-6xl gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                <aside className="surface-card h-fit p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Quick Fill</p>
                            <h3 className="mt-2 text-2xl font-black text-slate-950">Indian grocery presets</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Use curated staples and fast-moving shelf items to fill the form in one click, then adjust price, stock, or image.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Recommended</p>
                            <p className="mt-1 text-lg font-black text-emerald-900">{groceryPresets.length} items</p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-amber-50/60 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Starter bundles</p>
                        <div className="mt-3 space-y-3">
                            {starterCollections.map((collection) => (
                                <div key={collection.title} className="rounded-2xl bg-white/80 p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900">{collection.title}</h4>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">{collection.description}</p>
                                        </div>
                                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
                                            {collection.items.length} picks
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {collection.items.map((itemName) => {
                                            const preset = groceryPresets.find((entry) => entry.name === itemName)
                                            return (
                                                <button
                                                    key={itemName}
                                                    type="button"
                                                    onClick={() => preset && applyPreset(preset)}
                                                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                                >
                                                    {itemName}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h4 className="text-sm font-black text-slate-900">Shelf-ready suggestions</h4>
                                <p className="mt-1 text-xs text-slate-500">Filter by name or category and click to prefill the product form.</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                                {visiblePresets.length} shown
                            </span>
                        </div>

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={presetQuery}
                                onChange={(e) => setPresetQuery(e.target.value)}
                                placeholder="Search items like atta, milk, tea..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setPresetQuery("")
                                    setCategory("")
                                }}
                                className="secondary-btn px-4 py-3 text-xs"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {visiblePresets.slice(0, 12).map((preset) => (
                                <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    className="rounded-[1.4rem] border border-slate-150 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-black text-slate-900">{preset.name}</p>
                                        {preset.featured && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-slate-500">{preset.description}</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{preset.category}</span>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{preset.unit}</span>
                                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">Price hint Rs {preset.priceHint}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

            {/* Add Product Card */}
            <div className="w-full bg-white/80 backdrop-blur-md shadow-xl shadow-green-900/5 rounded-3xl p-6 sm:p-8 border border-gray-150/40 hover:shadow-2xl transition-all duration-300">
                
                {/* Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-[#00b252] mb-4 shadow-inner">
                        <FaStore size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                        Add Product
                    </h2>
                    <p className="text-[11px] text-gray-400 font-bold mt-1 text-center leading-normal">
                        Fill in the details below to add a new grocery item to your store catalog
                    </p>
                    <p className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                        Tip: click a preset on the left to auto-fill common Indian grocery essentials
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Product Name */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
                        <input 
                            type="text" 
                            placeholder="Enter product name (e.g. Organic Bananas)" 
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#00b252] focus:ring-4 focus:ring-green-500/10 text-xs text-gray-800 placeholder-gray-400 transition-all font-semibold"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea
                            placeholder="Enter product description"
                            className="w-full min-h-24 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#00b252] focus:ring-4 focus:ring-green-500/10 text-xs text-gray-800 placeholder-gray-400 transition-all font-semibold"
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                        />
                    </div>

                    {/* Custom File Upload */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Product Image</label>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImage} 
                        />
                        
                        {!frontendImage ? (
                            <div 
                                onClick={triggerFileInput}
                                className="border-2 border-dashed border-gray-200 hover:border-[#00b252] bg-gray-50/30 hover:bg-green-50/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#00b252] group-hover:scale-110 transition-transform duration-300">
                                    <FiUploadCloud size={18} />
                                </div>
                                <p className="text-[11px] font-bold text-gray-700 mt-1">
                                    Drag & drop or <span className="text-[#00b252] underline">browse file</span>
                                </p>
                                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">JPG, PNG up to 5MB</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-gray-150 shadow-inner group">
                                <img src={frontendImage} alt="Preview" className="w-full h-44 object-cover" />
                                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="bg-white text-gray-800 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl hover:bg-gray-100 transition cursor-pointer active:scale-95"
                                    >
                                        Change
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setFrontendImage(null); setBackendImage(null); }}
                                        className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl hover:bg-red-600 transition cursor-pointer active:scale-95"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Stock</label>
                            <input type="number" min="0" className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs font-semibold" onChange={(e) => setStock(e.target.value)} value={stock} />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Unit</label>
                            <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs font-semibold" onChange={(e) => setUnit(e.target.value)} value={unit} />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Featured</label>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs font-semibold" onChange={(e) => setFeatured(e.target.value === "true")} value={featured ? "true" : "false"}>
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                        </div>
                    </div>

                    {/* Price and Category Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        
                        {/* Price */}
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Price (INR)</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-gray-400 font-black text-xs">Rs</span>
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#00b252] focus:ring-4 focus:ring-green-500/10 text-xs text-gray-800 placeholder-gray-400 transition-all font-semibold"
                                    onChange={(e) => setPrice(e.target.value)}
                                    value={price || ''}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Category</label>
                            <select 
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#00b252] focus:ring-4 focus:ring-green-500/10 text-xs text-gray-700 bg-white transition-all font-semibold cursor-pointer"
                                onChange={(e) => setCategory(e.target.value)}
                                value={category}
                                required
                            >
                                <option value="">Select...</option>
                                {categories.map((cate, index) => (
                                    <option value={cate} key={index}>{cate}</option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* Custom Dietary Info Grid Buttons */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Dietary Info</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFoodType("veg")}
                                className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    foodType === "veg" 
                                        ? "bg-green-50 border-[#00b252] text-[#00b252] shadow-sm shadow-green-100" 
                                        : "border-gray-200 text-gray-400 hover:bg-gray-50"
                                }`}
                            >
                                <span className="w-2.5 h-2.5 rounded-full bg-[#00b252]" />
                                Vegetarian
                            </button>
                            <button
                                type="button"
                                onClick={() => setFoodType("non veg")}
                                className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    foodType === "non veg" 
                                        ? "bg-red-50 border-red-500 text-red-600 shadow-sm shadow-red-100" 
                                        : "border-gray-200 text-gray-400 hover:bg-gray-50"
                                }`}
                            >
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                Non-Veg
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        className="w-full bg-[#00b252] text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-600 hover:shadow-xl transition-all duration-200 active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center" 
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color="white" /> : "Save Product"}
                    </button>

                </form>
            </div>
            </div>
            <div className="mt-10 w-full max-w-6xl">
                <AppFooter />
            </div>
        </div>
    )
}

export default AddItem
