import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { clearCart, getMyCart, syncCart } from "../controllers/cart.controllers.js";


const cartRouter = express.Router();

cartRouter.get("/my", isAuth, getMyCart);
cartRouter.post("/sync", isAuth, syncCart);
cartRouter.post("/clear", isAuth, clearCart);

export default cartRouter;
