import Cart from "../models/cart.model.js";

const recalculateTotal = (items) =>
  items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

export const getMyCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate("items.item");
    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [], totalAmount: 0 });
    }
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: `get cart error ${error}` });
  }
};

export const syncCart = async (req, res) => {
  try {
    const { items = [] } = req.body;
    const normalizedItems = items
      .filter((item) => item?.item || item?.id)
      .map((item) => ({
        item: item.item || item.id,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        quantity: Number(item.quantity),
        shop: item.shop,
        foodType: item.foodType || "n/a",
      }));

    const totalAmount = recalculateTotal(normalizedItems);

    const cart = await Cart.findOneAndUpdate(
      { user: req.userId },
      { user: req.userId, items: normalizedItems, totalAmount },
      { new: true, upsert: true, runValidators: true },
    ).populate("items.item");

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: `sync cart error ${error}` });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.userId },
      { items: [], totalAmount: 0 },
      { new: true, upsert: true },
    );
    return res.status(200).json({ message: "cart cleared" });
  } catch (error) {
    return res.status(500).json({ message: `clear cart error ${error}` });
  }
};
