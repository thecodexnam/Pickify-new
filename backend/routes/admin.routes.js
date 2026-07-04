import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

import {
  getAdminCatalog,
  getAdminDashboard,
  getAdminOrders,
  getAdminReports,
  getAdminUsers,
  updateUserRole,
} from "../controllers/admin.controllers.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", isAuth, isAdmin, getAdminDashboard);
adminRouter.get("/reports", isAuth, isAdmin, getAdminReports);
adminRouter.get("/users", isAuth, isAdmin, getAdminUsers);
adminRouter.put("/users/:userId/role", isAuth, isAdmin, updateUserRole);
adminRouter.get("/orders", isAuth, isAdmin, getAdminOrders);
adminRouter.get("/catalog", isAuth, isAdmin, getAdminCatalog);

export default adminRouter;
