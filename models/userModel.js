import mongoose from 'mongoose'
import validator from 'validator'
import { z } from 'zod'
import bcrypt from 'bcrypt'

export const signUpSchema = z.object({
    name: z
        .string({ message: 'Name is required' })
        .trim()
        .min(3, { message: 'Name must be three letters or more' }),

    email: z
        .string({ message: 'Email is required' })
        .email({ message: 'Please enter a valid email' }),

    password: z
        .string({ message: 'Password is required' })
        .min(6, { message: 'Password must be six letters or more' }),

    role: z.enum(['user', 'admin']).default('user')
})

export const validate = (schema) => async (req, res, next) => {
    try {
        const parseBody = await schema.parseAsync(req.body)
        req.body = parseBody
        next()
    } catch (error) {
        const message = error.errors[0].message
        res.status(400).json({ msg: message })
    }
}

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'must be six letter or more'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    totalOrdered: {
        type: Number,
        default: 0
    }
})

schema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

schema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model('User', schema)
