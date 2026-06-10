import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Nav from './Nav'
import AppFooter from './AppFooter'
import OwnerItemCard from './OwnerItemCard'
import { serverUrl } from '../App'
import { FaPen, FaPlus, FaBox, FaGear, FaReceipt, FaStoreSlash, FaChevronRight, FaUsers, FaLayerGroup, FaShieldHalved } from "react-icons/fa6";
import { MdCurrencyRupee, MdOutlinePendingActions } from "react-icons/md";

function ManagementDashboard({ mode }) {
  const navigate = useNavigate()
  const { myShopData } = useSelector(state => state.owner)
  const { myOrders } = useSelector(state => state.user)
  const isAdmin = mode === 'admin'

  const [dashboard, setDashboard] = useState(null)
  const [reports, setReports] = useState(null)
  const [users, setUsers] = useState([])
  const [catalog, setCatalog] = useState(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [loading, setLoading] = useState(isAdmin)
  const [savingCategory, setSavingCategory] = useState(false)

  const loadAdminData = async () => {
    const [dashboardResult, reportsResult, usersResult, catalogResult] = await Promise.all([
      axios.get(`${serverUrl}/api/admin/dashboard`, { withCredentials: true }),
      axios.get(`${serverUrl}/api/admin/reports`, { withCredentials: true }),
      axios.get(`${serverUrl}/api/admin/users`, { withCredentials: true }),
      axios.get(`${serverUrl}/api/admin/catalog`, { withCredentials: true })
    ])

    setDashboard(dashboardResult.data)
    setReports(reportsResult.data)
    setUsers(usersResult.data)
    setCatalog(catalogResult.data)
  }

  useEffect(() => {
    if (!isAdmin) {
      return
    }

    const run = async () => {
      try {
        setLoading(true)
        await loadAdminData()
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [isAdmin])

  const handleRoleUpdate = async (userId, role) => {
    try {
      const result = await axios.put(`${serverUrl}/api/admin/users/${userId}/role`, { role }, { withCredentials: true })
      setUsers(prev => prev.map(user => user._id === userId ? result.data : user))
    } catch (error) {
      console.log(error)
      alert(error?.response?.data?.message || "Unable to update user role.")
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    try {
      setSavingCategory(true)
      await axios.post(`${serverUrl}/api/category`, {
        name: categoryName,
        description: categoryDescription
      }, { withCredentials: true })
      setCategoryName("")
      setCategoryDescription("")
      await loadAdminData()
    } catch (error) {
      console.log(error)
      alert(error?.response?.data?.message || "Unable to create category.")
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${serverUrl}/api/category/${categoryId}`, { withCredentials: true })
      await loadAdminData()
    } catch (error) {
      console.log(error)
      alert(error?.response?.data?.message || "Unable to delete category.")
    }
  }

  const totalRevenue = myOrders?.reduce((sum, order) => {
    if (order.shopOrders?.status !== 'pending' && order.shopOrders?.status !== 'cancelled') {
      return sum + (order.shopOrders?.subtotal || 0)
    }
    return sum
  }, 0) || 0

  const activeOrdersCount = myOrders?.filter(order =>
    order.shopOrders?.status !== "delivered" &&
    order.shopOrders?.status !== "cancelled"
  ).length || 0

  const recentOwnerOrders = myOrders?.slice(0, 3) || []

  const ownerStats = [
    { label: 'Total Revenue', value: `Rs ${totalRevenue}`, hint: 'Confirmed orders', icon: <MdCurrencyRupee size={22} />, tone: 'emerald' },
    { label: 'Active Orders', value: activeOrdersCount, hint: 'In progress', icon: <MdOutlinePendingActions size={22} />, tone: 'amber' },
    { label: 'Products', value: myShopData?.items?.length || 0, hint: 'In catalog', icon: <FaBox size={18} />, tone: 'sky' },
    { label: 'Shop Settings', value: 'Manage', hint: 'Update details', icon: <FaGear size={18} />, tone: 'slate', onClick: () => navigate("/create-edit-shop") },
  ]

  const adminStats = [
    { label: 'Users', value: dashboard?.stats?.users || 0, hint: 'Registered accounts', icon: <FaUsers size={18} />, tone: 'emerald' },
    { label: 'Shops', value: dashboard?.stats?.shops || 0, hint: 'Active merchants', icon: <FaGear size={18} />, tone: 'amber' },
    { label: 'Items', value: dashboard?.stats?.items || 0, hint: 'Catalog products', icon: <FaBox size={18} />, tone: 'sky' },
    { label: 'Categories', value: dashboard?.stats?.categories || 0, hint: 'Catalog groups', icon: <FaLayerGroup size={18} />, tone: 'slate' },
    { label: 'Revenue', value: `Rs ${dashboard?.stats?.revenue || 0}`, hint: 'Paid orders', icon: <MdCurrencyRupee size={22} />, tone: 'emerald' },
    { label: 'Saved carts', value: catalog?.cartCount || 0, hint: 'Pending baskets', icon: <FaShieldHalved size={18} />, tone: 'amber' },
  ]

  const toneStyles = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    slate: 'bg-slate-50 text-slate-600',
  }

  if (isAdmin && loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="surface-card px-8 py-6 text-sm font-black text-slate-700">Loading management dashboard...</div>
      </div>
    )
  }

  return (
    <div className="page-shell animate-fade-in">
      <Nav />

      <div className={`mx-auto px-4 pt-24 md:px-8 ${isAdmin ? 'max-w-7xl' : 'max-w-5xl'}`}>
        {!isAdmin && !myShopData ? (
          <div className="surface-card mx-auto mt-8 max-w-md p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FaStoreSlash size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Register your shop</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Launch your store on Pickify and reach customers looking for fresh groceries and daily essentials.
            </p>
            <button onClick={() => navigate("/create-edit-shop")} className="primary-btn mt-6 w-full py-3 text-sm">
              Get started
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="surface-card overflow-hidden">
              {isAdmin ? (
                <div className="relative overflow-hidden px-6 py-8 md:px-8">
                  <div className="hero-orb left-[-40px] top-[-20px] h-28 w-28 bg-emerald-200/70" />
                  <div className="hero-orb bottom-[-40px] right-[-10px] h-36 w-36 bg-amber-100/90" />
                  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="metric-pill w-fit">Operations overview</p>
                      <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                        Unified management for stores, catalog, and platform operations.
                      </h1>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                        This is the same management shell used for shop owners, extended with admin-only tools for users, reports, and catalog oversight.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-white/92 px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Panel mode</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">Admin</p>
                      <p className="mt-1 text-xs text-slate-500">Shared layout, elevated permissions</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative h-56 md:h-64">
                    <img src={myShopData.image} alt={myShopData.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <span className="status-badge status-badge--success">Active store</span>
                      <h1 className="mt-2 text-2xl font-black md:text-3xl">{myShopData.name}</h1>
                    </div>
                  </div>
                  <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Business location</p>
                      <p className="mt-1 text-sm font-bold text-slate-800">{myShopData.city}, {myShopData.state}</p>
                      <p className="mt-1 text-xs text-slate-500">{myShopData.address}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => navigate("/add-item")} className="primary-btn px-5 py-2.5 text-xs">
                        <FaPlus size={12} /> Add product
                      </button>
                      <button onClick={() => navigate("/create-edit-shop")} className="secondary-btn px-5 py-2.5 text-xs">
                        <FaPen size={12} /> Edit profile
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isAdmin ? 'xl:grid-cols-6' : 'lg:grid-cols-4'}`}>
              {(isAdmin ? adminStats : ownerStats).map((stat, index) => (
                <div
                  key={index}
                  onClick={stat.onClick}
                  className={`surface-card-sm p-5 card-hover ${stat.onClick ? 'cursor-pointer' : ''}`}
                >
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${toneStyles[stat.tone]}`}>
                    {stat.icon}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-bold text-slate-500">{stat.hint}</p>
                </div>
              ))}
            </div>

            {isAdmin ? (
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <div className="surface-card p-5">
                    <div className="section-title mb-4">
                      <div>
                        <h2>Recent orders</h2>
                        <p>Latest customer activity across the platform</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(dashboard?.recentOrders || []).map((order) => (
                        <div key={order._id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-900">{order.user?.fullName || 'Customer'}</p>
                              <p className="text-xs text-slate-500">{order.user?.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-emerald-700">Rs {order.totalAmount}</p>
                              <p className="text-[11px] font-bold uppercase text-slate-400">{order.paymentMethod}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="surface-card p-5">
                    <div className="section-title mb-4">
                      <div>
                        <h2>Top selling products</h2>
                        <p>Products generating the most completed basket volume</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(reports?.topProducts || []).map((product) => (
                        <div key={product.itemId} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900">{product.quantity} sold</p>
                            <p className="text-xs font-bold text-emerald-700">Rs {product.revenue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="surface-card p-5">
                    <div className="section-title mb-4">
                      <div>
                        <h2>User roles</h2>
                        <p>Review users and switch platform roles directly</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div key={user._id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-sm font-black text-slate-900">{user.fullName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                          >
                            <option value="user">Customer</option>
                            <option value="owner">Shop Owner</option>
                            <option value="deliveryBoy">Delivery Boy</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="surface-card p-5">
                    <div className="section-title mb-4">
                      <div>
                        <h2>Category management</h2>
                        <p>Create and remove catalog categories</p>
                      </div>
                    </div>
                    <form onSubmit={handleCreateCategory} className="space-y-3">
                      <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                      />
                      <textarea
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        placeholder="Short category description"
                        className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                      />
                      <button disabled={savingCategory} className="primary-btn w-full py-3 text-sm">
                        {savingCategory ? 'Saving...' : 'Add category'}
                      </button>
                    </form>

                    <div className="mt-5 space-y-2">
                      {(catalog?.categories || []).map((category) => (
                        <div key={category._id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">{category.name}</p>
                            <p className="text-xs text-slate-500">{category.description || 'No description added.'}</p>
                          </div>
                          <button onClick={() => handleDeleteCategory(category._id)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600">
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="surface-card p-5">
                    <div className="section-title mb-4">
                      <div>
                        <h2>Inventory visibility</h2>
                        <p>Featured items and low-stock alerts</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(catalog?.items || []).slice(0, 12).map((item) => (
                        <div key={item._id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">
                              {item.shop?.name || 'No shop'} | {item.categoryRef?.name || item.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-black ${item.stock <= 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                              {item.stock} {item.unit}
                            </p>
                            <p className="text-xs font-bold uppercase text-emerald-700">{item.featured ? 'Featured' : 'Standard'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="surface-card p-5">
                    <div className="section-title mb-4">
                      <div>
                        <h2>Report summary</h2>
                        <p>Quick status and role distribution snapshot</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(reports?.statusBreakdown || {}).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between rounded-2xl bg-slate-50/70 px-4 py-3">
                          <p className="text-sm font-black capitalize text-slate-900">{status}</p>
                          <p className="text-sm font-black text-emerald-700">{count}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      {Object.entries(reports?.usersByRole || {}).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between py-1 text-sm">
                          <span className="font-bold capitalize text-slate-600">{role}</span>
                          <span className="font-black text-slate-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="surface-card p-6">
                  <div className="section-title mb-4">
                    <div>
                      <h2>Recent orders</h2>
                      <p>Latest activity from your store</p>
                    </div>
                    <button onClick={() => navigate("/my-orders")} className="ghost-btn px-3 py-1.5 text-xs">
                      View all <FaChevronRight size={10} />
                    </button>
                  </div>
                  {recentOwnerOrders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400">
                        <FaReceipt size={22} />
                      </div>
                      <h3 className="text-sm font-black text-slate-800">No recent orders</h3>
                      <p className="mt-1 text-xs text-slate-500">New customer orders will appear here in real time.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentOwnerOrders.map((order, index) => (
                        <div key={index} className="surface-card-sm flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-800">{order.user.fullName}</span>
                              <span className="status-badge status-badge--success">{order.shopOrders?.status}</span>
                            </div>
                            <p className="mt-1 max-w-sm truncate text-xs text-slate-500">{order.deliveryAddress?.text}</p>
                          </div>
                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400">Subtotal</p>
                              <p className="text-sm font-black text-slate-900">Rs {order.shopOrders?.subtotal}</p>
                            </div>
                            <button onClick={() => navigate("/my-orders")} className="primary-btn px-4 py-2 text-[11px]">
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <section>
                  <div className="section-title mb-4">
                    <div>
                      <h2>My catalog</h2>
                      <p>Products listed in your store</p>
                    </div>
                  </div>
                  {!myShopData.items?.length ? (
                    <div className="surface-card p-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <FaBox size={28} />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Add your first product</h3>
                      <p className="mt-1 text-xs text-slate-500">Share fresh stock with nearby buyers.</p>
                      <button onClick={() => navigate("/add-item")} className="primary-btn mt-4 px-5 py-2.5 text-xs">
                        Add product
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {myShopData.items.map((item, index) => (
                        <OwnerItemCard data={item} key={index} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}

        <AppFooter />
      </div>
    </div>
  )
}

export default ManagementDashboard
