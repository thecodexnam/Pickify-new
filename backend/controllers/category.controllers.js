import Category from "../models/category.model.js";

const defaultCategories = [
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

export const createCategory = async (req, res) => {
    try {
        const { name, description = "", image = "" } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ message: "category name is required" });
        }

        const existing = await Category.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({ message: "category already exists" });
        }

        const category = await Category.create({
            name: name.trim(),
            description,
            image
        });

        return res.status(201).json(category);
    } catch (error) {
        return res.status(500).json({ message: `create category error ${error}` });
    }
};

export const getCategories = async (_req, res) => {
    try {
        if (await Category.countDocuments() === 0) {
            await Category.insertMany(defaultCategories.map(name => ({ name })))
        }
        const categories = await Category.find().sort({ name: 1 });
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: `get categories error ${error}` });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description = "", image = "" } = req.body;
        const category = await Category.findByIdAndUpdate(categoryId, {
            name,
            description,
            image
        }, { new: true, runValidators: true });

        if (!category) {
            return res.status(404).json({ message: "category not found" });
        }

        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).json({ message: `update category error ${error}` });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return res.status(404).json({ message: "category not found" });
        }
        return res.status(200).json({ message: "category deleted" });
    } catch (error) {
        return res.status(500).json({ message: `delete category error ${error}` });
    }
};
