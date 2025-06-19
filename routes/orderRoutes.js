
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const handleUpload = require('../middleware/uploadMiddleware');

// Create a new order
router.post('/', handleUpload, orderController.createOrder);

// Get all orders
router.get('/', orderController.getAllOrders);

// Get single order
router.get('/:id', orderController.getOrderById);

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus);


// Add new route for user-specific orders
router.get('/user/:userId', orderController.getOrdersByUserId);


//router.get('/craft/:accountType', orderController.getOrdersByAcountType);
router.get(
    '/:accountType/:country',
    orderController.getOrdersByAccountTypeAndCountry
  );

// Existing routes...
module.exports = router;


// new
router.post('/:orderId/offers',
    orderController.submitOffer
);


router.patch('/:orderId/accept-offer', orderController.acceptOffer);

// Shared routes
router.get('/:orderId',
    orderController.getOrderDetails
);
