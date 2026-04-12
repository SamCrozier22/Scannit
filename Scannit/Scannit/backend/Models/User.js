const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema, model } = mongoose;

const UserSchema = new Schema(
    {
        username: {type: String, required: true, unique: true, trim: true},
        password: {type: String, required: true, trim: true},
        firstName: {type: String, required: true, trim: true},
        lastName: {type: String, required: true, trim: true},
        email: {type: String, required: true, unique: true, trim: true},
        savedBarcodes: {type: [String], default: [], trim: true},
        scanCredits: {type: Number, default: 5},
        lastScanReset: {type: Date, default: Date.now},
        premiumStart: {type: Date},
        premiumEnd: {type: Date},
        adsWatchedToday: {type: Number, default: 0},
        lastAdReset: {type: Date, default: Date.now},
    },
    {timestamps: true}
);
const userData = model("User", UserSchema);

UserSchema.methods.isActivePremium = function() {
    return !!(this.premiumStart && this.premiumEnd > new Date());
}

async function createUser(username, password, firstName, lastName, email) {
    if(!username || !password || !firstName || !lastName || !email) {
        throw new Error("Missing required fields");
    }

    try {
        const userExists = await userData.findOne({username: username});
        if(userExists) {
            throw new Error("User already exists");
        }

        const hashed = await bcrypt.hash(password, 10);
        password = hashed;

        const newUser = await userData.create({
            username, 
            password, 
            firstName, 
            lastName, 
            email,
            savedBarcodes: [],
        });
        return newUser;
    } catch (e) {
        throw e
    }
}

module.exports = {
    userData,
    createUser,
}