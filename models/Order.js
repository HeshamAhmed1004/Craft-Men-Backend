// // const mongoose = require('mongoose');

// // const orderSchema = new mongoose.Schema({
// //     image: {
// //         type: String,
// //         required: false
// //     },
// //     formDesc: {
// //         type: String,
// //         required: true
// //     },
// //     date: {
// //         type: Date,
// //         required: true
// //     },
// //     time: {
// //         type: String,
// //         required: true
// //     },
// //     address: {
// //         type: String,
// //         required: true
// //     },
// //     name: {
// //         type: String,
// //         required: true
// //     },
// //     phone: {
// //         type: String,
// //         required: true
// //     },
// //     isCraftAccept: {
// //         type: Boolean,
// //         default: false
// //     },
// //     isUserAccept: {
// //         type: Boolean,
// //         default: false
// //     },
// //     orderStatus: {
// //         type: String,
// //         enum: ['pending', 'in-progress', 'completed', 'rejected'],
// //         default: 'pending'
// //     },
// //     createdAt: {
// //         type: Date,
// //         default: Date.now
// //     }
// // });

// // module.exports = mongoose.model('Order', orderSchema);

// const mongoose = require('mongoose');
// const offerSchema = new mongoose.Schema({
//     craftsman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     price: { type: Number, required: true },
//     timeline: { type: String, required: true },
//     message: String,
//     accepted: { type: Boolean, default: false }
// }, { timestamps: true });
// const orderSchema = new mongoose.Schema({
//     //new
//     userId: {
//         type: String,
//         required: true
//     },
//     accountType: {
//         type: String,
//         required: true
//     },
//     image: {
//         type: String,
//         required: false
//     },
//     formDesc: {
//         type: String,
//         required: true
//     },
//     date: {
//         type: String,
//         required: true
//     },
//     time: {
//         type: String,
//         required: true
//     },
//     address: {
//         type: String,
//         required: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     phone: {
//         type: String,
//         required: true
//     },
//     isCraftAccept: {
//         type: Boolean,
//         default: false
//     },
//     isUserAccept: {
//         type: Boolean,
//         default: false
//     },
//     orderStatus: {
//         type: String,
//         enum: ['pending', 'in-progress', 'completed', 'rejected'],
//         default: 'pending'
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     craftsmenOffers: [offerSchema],
//     selectedCraftsman: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });


  

// // Add index for better performance when querying by user
// orderSchema.index({ user: 1 });


// module.exports = mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

// Offer Sub-Schema
const offerSchema = new mongoose.Schema({
    craftsman: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    timeline: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    accepted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Main Order Schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // ✅ Better to use ObjectId (not String)
        ref: 'User',                          // ✅ Reference to User model
        required: true
    },

    accountType: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    image: {
        type: String
        // `required: false` is redundant (default)
    },
    formDesc: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
        // Consider using `Date` if storing ISO format
    },
    time: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isCraftAccept: {
        type: Boolean,
        default: false
    },
    isUserAccept: {
        type: Boolean,
        default: false
    },
    // orderStatus: {
    //     type: String,
    //     enum: ['pending', 'in-progress', 'completed', 'rejected'],
    //     default: 'pending'
    // },

    orderStatus: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress', 'completed', 'rejected','offers_received'],
        default: 'pending'
      },
    craftsmenOffers: [offerSchema],  // ✅ Array of offers
    selectedCraftsman: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // ✅ Optional (only set when user accepts an offer)
    }
}, { timestamps: true });  // ✅ Auto-adds `createdAt` and `updatedAt`

module.exports = mongoose.model('Order', orderSchema);