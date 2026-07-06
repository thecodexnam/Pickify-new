import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/category.controllers.js";

const categoryRouter = express.Router();


categoryRouter.get("/", isAuth, getCategories);
categoryRouter.post("/", isAuth, isAdmin, createCategory);
categoryRouter.put("/:categoryId", isAuth, isAdmin, updateCategory);
categoryRouter.delete("/:categoryId", isAuth, isAdmin, deleteCategory);

export default categoryRouter;
