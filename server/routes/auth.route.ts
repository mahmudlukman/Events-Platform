import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/auth";
const authRouter = express.Router();

authRouter.post("/create-user", createUser);
authRouter.post("/login", loginUser);
authRouter.get("/logout", isAuthenticated, logoutUser);

export default authRouter;
