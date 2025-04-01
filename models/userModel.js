import mongoose from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: null },
  phoneNumber: { type: String },
  dob: { type: Date },
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String }
  },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving, but only if it's not already hashed
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    // Check if the password is already a bcrypt hash (starts with $2a$ or $2b$)
    if (!this.password.match(/^\$2[ayb]\$/)) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    userId: this._id,
    email: this.email,
    isAdmin: this.isAdmin
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const User = mongoose.model('User', userSchema);

export default User;