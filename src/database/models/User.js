const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dni: { type: String, required: true }, // Ya no es unique
    email: { type: String, required: true }, // Sigue siendo único globalmente
    password: { type: String, required: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    sex: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    birthDate:{type:Date,required: true},
    mobile:{type:String ,required: true}
    
});

// Índice compuesto que asegura la unicidad de dni dentro de una empresa
userSchema.index({ dni: 1, empresa: 1 }, { unique: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);
