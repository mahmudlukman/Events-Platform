"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/initialize-payment", auth_1.isAuthenticated, order_controller_1.initializePayment);
router.get("/verify-payment", order_controller_1.verifyPayment);
router.get("/orders", auth_1.isAuthenticated, order_controller_1.getOrdersByEvent);
router.get("/user-orders", auth_1.isAuthenticated, order_controller_1.getOrdersByUser);
exports.default = router;
