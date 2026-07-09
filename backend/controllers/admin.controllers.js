import Cart from "../models/cart.model.js";
import Category from "../models/category.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";


export const getAdminDashboard = async (_req, res) => {
  try {
    const [users, shops, items, categories, orders] = await Promise.all([
      User.countDocuments(),
      Shop.countDocuments(),
      Item.countDocuments(),
      Category.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "fullName email"),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { payment: true } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
    ]);

    const lowStockItems = await Item.find({ stock: { $lte: 5 } })
      .limit(10)
      .select("name stock image");

    return res.status(200).json({
      stats: {
        users,
        shops,
        items,
        categories,
        orders: orders.length,
        revenue: revenueAgg[0]?.revenue || 0,
      },
      recentOrders: orders,
      lowStockItems,
    });
  } catch (error) {
    return res.status(500).json({ message: `admin dashboard error ${error}` });
  }
};

export const getAdminReports = async (_req, res) => {
  try {
    const [orders, items, users, categories] = await Promise.all([
      Order.find().populate("shopOrders.shopOrderItems.item", "name category"),
      Item.find(),
      User.find().select("fullName email role createdAt"),
      Category.find(),
    ]);

    const totalRevenue = orders
      .filter((order) => order.payment || order.paymentMethod === "cod")
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const statusBreakdown = orders.reduce((acc, order) => {
      order.shopOrders.forEach((shopOrder) => {
        acc[shopOrder.status] = (acc[shopOrder.status] || 0) + 1;
      });
      return acc;
    }, {});

    const productSalesMap = {};
    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        shopOrder.shopOrderItems.forEach((line) => {
          const key = String(line.item?._id || line.item);
          if (!productSalesMap[key]) {
            productSalesMap[key] = {
              itemId: key,
              name: line.name || line.item?.name || "Unknown",
              category: line.item?.category || "Others",
              quantity: 0,
              revenue: 0,
            };
          }
          productSalesMap[key].quantity += Number(line.quantity || 0);
          productSalesMap[key].revenue +=
            Number(line.price || 0) * Number(line.quantity || 0);
        });
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return res.status(200).json({
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalItems: items.length,
        totalCategories: categories.length,
      },
      statusBreakdown,
      topProducts,
      inventory: items.map((item) => ({
        itemId: item._id,
        name: item.name,
        stock: item.stock,
        unit: item.unit,
        featured: item.featured,
      })),
      usersByRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    return res.status(500).json({ message: `admin reports error ${error}` });
  }
};

export const getAdminUsers = async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: `get admin users error ${error}` });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true },
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `update user role error ${error}` });
  }
};

export const getAdminOrders = async (_req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "fullName email")
      .populate("shopOrders.shop", "name");
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: `get admin orders error ${error}` });
  }
};

export const getAdminCatalog = async (_req, res) => {
  try {
    const [items, categories, shops, carts] = await Promise.all([
      Item.find()
        .sort({ createdAt: -1 })
        .populate("shop", "name")
        .populate("categoryRef", "name"),
      Category.find().sort({ name: 1 }),
      Shop.find().sort({ createdAt: -1 }).populate("owner", "fullName email"),
      Cart.countDocuments(),
    ]);

    return res.status(200).json({
      items,
      categories,
      shops,
      cartCount: carts,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get admin catalog error ${error}` });
  }
};
