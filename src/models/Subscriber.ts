import mongoose, { Schema, model, models } from 'mongoose';

const SubscriberSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Subscriber = models.Subscriber || model('Subscriber', SubscriberSchema);

export default Subscriber;
