const Order = require('../models/Order');
const orderService = require('../services/orderService');


// Create a new order
exports.createOrder = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const {
            userId,
            country,
            accountType,
            formDesc,
            date,
            time,
            address,
            name,
            phone
        } = req.body;

        const newOrder = new Order({
            userId,
            accountType,
            country,
            image: req.file.path,
            formDesc,
            date,
            time,
            address,
            name,
            phone
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


exports.getOrdersByUserId = async (req, res) => {
    try {
        const orders = await Order.find({userId: req.params.userId}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// exports.getOrdersByAcountType = async (req, res) => {
//     try {
//         const orders = await Order.find({ accountType: req.params.accountType}).sort({ createdAt: -1 });
//         res.status(200).json({ success: true, data: orders });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Server error', error: error.message });
//     }
// };

exports.getOrdersByAccountTypeAndCountry = async (req, res) => {
    try {
        const { accountType, country } = req.params;

        // Validate input parameters
        if (!accountType || !country) {
            return res.status(400).json({
                success: false,
                message: 'Both accountType and country parameters are required'
            });
        }

        const orders = await Order.find({
            accountType: accountType,
            country: country // Assuming country is stored in address.country
        })
            .sort({ createdAt: -1 });
            
        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No orders found matching the criteria'
            });
        }

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, isCraftAccept, isUserAccept } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus, isCraftAccept, isUserAccept },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Submit an offer for an order
// This function allows a craftsman to submit an offer for a specific order.
exports.submitOffer = async (req, res) => {
    try {
        const { price, timeline, message, craftsmanId,name,phone } = req.body; // Get craftsmanId from body
        const orderId = req.params.orderId;
        
        if (!craftsmanId) {
            return res.status(400).json({
                success: false,
                message: 'craftsmanId is required'
            });
        }

        const order = await orderService.submitCraftsmanOffer(
            orderId,
            craftsmanId, // Use ID from request body
            { price, timeline, message,name, phone }
        );

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// exports.selectCraftsman = async (req, res, next) => {
//     try {
//         const { orderId, userId, craftsmanId } = req.body;

//         if (!orderId || !userId || !craftsmanId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'orderId, userId, and craftsmanId are required in request body'
//             });
//         }

//         const order = await orderService.selectCraftsmanForOrder({
//             orderId,
//             userId,
//             craftsmanId
//         });

//         res.status(200).json({
//             success: true,
//             data: order
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// Get order details with offers
// This function retrieves the order details along with the offers made by craftsmen.


exports.getOrderDetails = async (req, res, next) => {
    const order = await orderService.getOrderWithOffers(
        req.params.orderId,
        req.user.id
    );
   
    res.status(200).json({
        success: true,
        data: order
    });
};



// Accept an offer for an order
// This function allows a user to accept a specific offer for an order.
// It updates the order status and marks the offer as accepted.
exports.acceptOffer = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { craftsmanOfferId } = req.body;

        // 1. Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // 2. Check if the order is already accepted
        if (order.isUserAccept) {
            return res.status(400).json({ success: false, message: 'Order already accepted' });
        }

        // 3. Find the selected offer
        const selectedOffer = order.craftsmenOffers.id(craftsmanOfferId);
        if (!selectedOffer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        // 4. Update the offer and order status
        selectedOffer.accepted = true;
        order.isUserAccept = true;
        // order.orderStatus = 'accepted';

        // await order.save();
        order.orderStatus = 'accepted'; // Now valid!
        await order.save();
        res.status(200).json({
            success: true,
            message: 'Offer accepted successfully',
            data: order,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};