import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import Category from "../models/category.model.js";

export const addItem = async (req, res) => {
  try {
    const {
      name,
      description = "",
      category,
      categoryRef,
      foodType,
      price,
      stock = 0,
      unit = "pieces",
      featured = false,
    } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "shop not found" });
    }
    let normalizedCategory = category;
    let normalizedCategoryRef = categoryRef || null;
    if (normalizedCategoryRef) {
      const matchedCategory = await Category.findById(normalizedCategoryRef);
      if (matchedCategory) {
        normalizedCategory = matchedCategory.name;
      }
    }
    const item = await Item.create({
      name,
      description,
      category: normalizedCategory,
      categoryRef: normalizedCategoryRef,
      foodType,
      price,
      stock,
      unit,
      featured: featured === true || featured === "true",
      image,
      shop: shop._id,
    });

    shop.items.push(item._id);
    await shop.save();
    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `add item error ${error}` });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const {
      name,
      description = "",
      category,
      categoryRef,
      foodType,
      price,
      stock = 0,
      unit = "pieces",
      featured = false,
    } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    let normalizedCategory = category;
    let normalizedCategoryRef = categoryRef || null;
    if (normalizedCategoryRef) {
      const matchedCategory = await Category.findById(normalizedCategoryRef);
      if (matchedCategory) {
        normalizedCategory = matchedCategory.name;
      }
    }
    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        description,
        category: normalizedCategory,
        categoryRef: normalizedCategoryRef,
        foodType,
        price,
        stock,
        unit,
        featured: featured === true || featured === "true",
        image,
      },
      { new: true },
    );
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `edit item error ${error}` });
  }
};

export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter((i) => i !== item._id);
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `delete item error ${error}` });
  }
};

export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 50);
    if (
      !city ||
      city === "null" ||
      city === "undefined" ||
      city.trim() === ""
    ) {
      return res
        .status(400)
        .json({ message: "city is required and must be valid" });
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");
    if (!shops) {
      return res.status(400).json({ message: "shops not found" });
    }
    const shopIds = shops.map((shop) => shop._id);
    const [items, total] = await Promise.all([
      Item.find({ shop: { $in: shopIds } })
        .sort({ featured: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Item.countDocuments({ shop: { $in: shopIds } }),
    ]);
    return res.status(200).json({ items, page, limit, total });
  } catch (error) {
    console.error("get item by city error", error);
    return res.status(500).json({ message: `get item by city error ${error}` });
  }
};

export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate("items");
    if (!shop) {
      return res.status(400).json("shop not found");
    }
    return res.status(200).json({
      shop,
      items: shop.items,
    });
  } catch (error) {
    return res.status(500).json({ message: `get item by shop error ${error}` });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    if (!query || !city) {
      return res.status(200).json({ items: [], page, limit, total: 0 });
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");
    if (!shops) {
      return res.status(400).json({ message: "shops not found" });
    }
    const shopIds = shops.map((s) => s._id);
    const searchFilter = {
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };

    const [items, total] = await Promise.all([
      Item.find(searchFilter)
        .populate("shop", "name image")
        .sort({ featured: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Item.countDocuments(searchFilter),
    ]);

    return res.status(200).json({ items, page, limit, total });
  } catch (error) {
    return res.status(500).json({ message: `search item  error ${error}` });
  }
};

export const rating = async (req, res) => {
  try {
    const { itemId, rating } = req.body;

    if (!itemId || !rating) {
      return res.status(400).json({ message: "itemId and rating is required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 to 5" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    const newCount = item.rating.count + 1;
    const newAverage =
      (item.rating.average * item.rating.count + rating) / newCount;

    item.rating.count = newCount;
    item.rating.average = newAverage;
    await item.save();
    return res.status(200).json({ rating: item.rating });
  } catch (error) {
    return res.status(500).json({ message: `rating error ${error}` });
  }
};
