import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import logger from "../utils/logger.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  logger.logRequest("POST", "/api/orders", req);

  if (orderItems && orderItems.length === 0) {
    logger.logValidation("ADD_ORDER_ITEMS", ["No order items provided"]);
    res.status(400);
    throw new Error("No order items");
  } else {
    try {
      logger.logDb("create", "Order", {
        itemCount: orderItems.length,
        totalPrice,
        userId: req.user._id,
      });

      const order = new Order({
        orderItems: orderItems.map((x) => ({
          ...x,
          product: x._id,
          _id: undefined,
        })),
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();

      const durationMs = Date.now() - startTime;
      logger.logSuccess("/api/orders", 201, durationMs, {
        orderId: createdOrder._id,
        itemCount: createdOrder.orderItems.length,
        totalPrice: createdOrder.totalPrice,
      });

      res.status(201).json(createdOrder);
    } catch (error) {
      logger.logError("ADD_ORDER_ITEMS", error, {
        itemCount: orderItems?.length,
        totalPrice,
      });
      throw error;
    }
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const userId = req.user._id;

  logger.logRequest("GET", "/api/orders/myorders", req);

  try {
    logger.logDb("find", "Order", { user: userId });
    const orders = await Order.find({ user: userId });

    const durationMs = Date.now() - startTime;
    logger.logSuccess("/api/orders/myorders", 200, durationMs, {
      ordersReturned: orders.length,
    });

    res.status(200).json(orders);
  } catch (error) {
    logger.logError("GET_MY_ORDERS", error, { userId });
    throw error;
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.status(200).json(orders);
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
};
