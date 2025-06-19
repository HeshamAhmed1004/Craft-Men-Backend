const Order = require('../models/Order');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/ErrorResponse');


class OrderService {
    async submitCraftsmanOffer(orderId, craftsmanId, offerData) {
        const order = await Order.findById(orderId);
        if (!order) throw new ErrorResponse('Order not found', 404);

        // Prevent duplicate offers
        const existingOffer = order.craftsmenOffers.find(
            offer => offer.craftsman.toString() === craftsmanId
        );
        if (existingOffer) throw new ErrorResponse('Offer already submitted', 400);

        order.craftsmenOffers.push({ craftsman: craftsmanId, ...offerData });

        if (order.status === 'pending') {
            order.status = 'crafts_accepted';
        }
        if (order.isCraftAccept == false){
            order.isCraftAccept = true;
    }
        await order.save();


        return order;
    }

  

    async selectCraftsmanForOrder(selectionData) {
        const { orderId, userId, craftsmanId } = selectionData;

        // Validate IDs
        const isValidId = id => mongoose.Types.ObjectId.isValid(id);
        if (![orderId, userId, craftsmanId].every(isValidId)) {
            const err = new Error('Invalid ID format');
            err.statusCode = 400;
            throw err;
        }

        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                user: userId,
                'craftsmenOffers.craftsman': craftsmanId,
                status: { $in: ['pending', 'offers_received'] }
            },
            {
                $set: {
                    status: 'craftsman_selected',
                    selectedCraftsman: craftsmanId,
                    'craftsmenOffers.$[elem].accepted': true,
                    updatedAt: new Date()
                }
            },
            {
                arrayFilters: [{ 'elem.craftsman': craftsmanId }],
                new: true
            }
        )
            .populate('selectedCraftsman', 'name phone rating');

        if (!order) {
            const err = new Error('Invalid selection - Order not found or conditions not met');
            err.statusCode = 404;
            throw err;
        }

        return order;
    }

    //
    async getOrderWithOffers(orderId, userId) {
        const order = await Order.findOne({
            _id: orderId,
            $or: [
                { user: userId },
                { 'craftsmenOffers.craftsman': userId }
            ]
        })
            .populate('user', 'name email')
            .populate('craftsmenOffers.craftsman', 'name rating avatar');

        if (!order) throw new ErrorResponse('Order not found', 404);
        if (!order.craftsmenOffers || order.isCraftAccept === false) {
            throw new ErrorResponse('No offers found for this order', 404);
        }
        if (order.status === 'pending') {
            order.status = 'offers_received';
            await order.save();
        }
        return order;
    }
}

module.exports = new OrderService();