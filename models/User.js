const mongoose = require("mongoose");
//const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    accountType: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// // Hash password before saving
// UserSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// // Compare passwords (for login)
// UserSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// };

// module.exports = mongoose.model("User", UserSchema);

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const userSchema = new mongoose.Schema({
//     // your schema fields...
// });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

module.exports = mongoose.model('User', userSchema);