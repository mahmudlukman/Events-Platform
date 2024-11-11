import express from "express";
import { 
  initializePayment,
  verifyPayment,
  getOrdersByEvent,
  getOrdersByUser,
} from "../controllers/order.controller";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/initialize-payment", isAuthenticated, initializePayment);
router.get("/verify-payment", verifyPayment);
router.get("/event/:eventId", isAuthenticated, getOrdersByEvent);
router.get("/user/:userId", isAuthenticated, getOrdersByUser);

export default router;