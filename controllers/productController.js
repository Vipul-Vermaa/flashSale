import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import { Product } from '../models/productModel.js'
import ErrorHandler from "../utils/errorHandler.js"
import { Order } from '../models/orderModel.js'
import mongoose from 'mongoose'
import { User } from "../models/userModel.js"
import memcached from "../utils/cache.js"

// getAllProducts
export const getAllProducts = catchAsyncError(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit
    const cacheKey = 'products:${page}:${limit}';

    memcached.get(cacheKey, async (err, data) => {
        if (data) {
            return res.status(200).json(JSON.parse(data))
        } else {
            try {
                const products = await Product.find().skip(skip).limit(limit)
                const totalProducts = await Product.countDocuments();
                const totalPages = Math.ceil(totalProducts / limit)

                const response = {
                    success: true,
                    currentPage: page,
                    totalPages,
                    totalProducts,
                    products
                };
                memcached.set(cacheKey.JSON.stringify(response), 3600, (err) => {
                    if (err) {
                        throw new ErrorHandler('Could not cache data', 500)
                    }
                })
                res.status(200).json(response)
            } catch (error) {
                return next(new ErrorHandler('Unable to fetch products', 500))
            }
        }
    })
    res.status(200).json({
    })
})

// productDetail
export const productDetail = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findById(id)
    if (!product) return next(new ErrorHandler('Product not found', 404))
    res.status(200).json({
        success: true,
        product
    })
})

// placeOrder
export const placeOrder = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    const { quantity, address } = req.body
    if (!quantity || !address) return next(new ErrorHandler('Please enter quantity and address', 400))
    if (quantity <= 0 && quantity > 5) return next(new ErrorHandler('Quantity must be greater than 0 and less than 6', 400));
    const product = await Product.findById(id)
    if (!product) return next(new ErrorHandler('Product not found', 404))
    if (quantity > product.availableUnits) return next(new ErrorHandler('Product out of stock', 400))

    const user = await User.findById(req.user._id)

    if (!user) return next(new ErrorHandler('User not found', 404))
    if (user.totalOrdered >= 5) return next(new ErrorHandler('Cannot order more than 5 products', 400));

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.create([{
            user: req.user._id,
            product: req.params.id,
            price: product.price,
            quantity,
            address,
            status: 'Processing'
        }], { session })
        product.availableUnits -= req.body.quantity

        await product.save({ validateBeforeSave: false, session })
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            order: order[0]
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler('Could not place the order. Please try again.', 500));
    }
})

// cancelOrder
export const cancelOrder = catchAsyncError(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.findById(req.params.id).session(session)
        if (!order) return next(new ErrorHandler('Order not found', 404))

        const product = await Product.findById(order.product).session(session)
        if (!product) return next(new ErrorHandler('Product not found', 404))

        if (order.status === 'Shipped' || order.status === 'Delivered') {
            return next(new ErrorHandler('Cannot cancel ,order already shipped or delivered', 400))
        }

        product.availableUnits += order.quantity

        await product.save({ validateBeforeSave: false, session })

        await order.remove({ session })

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: 'Order cancelled'
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler('Could not cancel the order. Please try again.', 500));
    }
})

// viewOrder
export const viewOrder = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    const order = await Order.findById(id).populate('product user')
    if (!order) return next(new ErrorHandler('Order not found', 404))
    res.status(200).json({
        success: true,
        order
    })
})

// updateOrder
export const updateOrder = catchAsyncError(async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const order = await Order.findById(req.params.id).session(session)
        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler('Order not found', 404))
        }

        const product = await Product.findById(order.product).session(session)
        if (!product) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler('Product not found', 404))
        }
        if (order.status === 'Shipped' || order.status === 'Delivered') {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler('Cannot update ,order already shipped or delivered', 400))
        }

        const { quantity } = req.body

        if (quantity <= 0 || quantity > 5) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler('Quantity must be between 1 and 5', 400));
        }

        const user = await User.findById(order.user).session(session)
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return next(new ErrorHandler('User not found', 404))
        }
        const newTotalOrdered = user.totalOrdered - order.quantity + quantity;
        if (newTotalOrdered > 5) {
            return next(new ErrorHandler('You cannot order more than 5 products in total', 400));
        }

        product.availableUnits += order.quantity - quantity

        await product.save({ validateBeforeSave: false, session })

        order.quantity = quantity
        await order.save({ session })
        user.totalOrdered = newTotalOrdered;
        await user.save({ validateBeforeSave: false });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: 'Order updated',
            order
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler(error.message, 500));
    }
})

// orderHistory
export const orderHistory = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id }).populate('product')
    if (!orders) return next(new ErrorHandler('No orders found', 404))
    res.status(200).json({
        success: true,
        orders
    })
})

// saleStart
export const saleStart = () => {
    const createProducts = async () => {
        const products = [];
        let totalUnits = 0;
        const totalProducts = 1000;
        for (let i = 1; i <= totalProducts; i++) {
            let availableUnits;
            if (i === totalProducts) {
                availableUnits = 1000 - totalUnits;
            } else {
                availableUnits = Math.floor(Math.random() * (1000 - totalUnits - (totalProducts - i))) + 1;
            }
            totalUnits += availableUnits;
            products.push({
                name: `Product ${i}`,
                price: Math.floor(Math.random() * 1000) + 1,
                availableUnits
            });
        }
        try {
            await Product.insertMany(products);
            console.log('1000 Products created successfully');
        }
        catch (error) {
            console.error('Error creating products:', error);
        }
    };
    createProducts();
    console.log('Sale started');
}

// saleEnd
export const saleEnd = catchAsyncError(async (req, res, next) => {
    const products = await Product.find()
    if (products.length === 0) return next(new ErrorHandler('No products found', 404))

    const result = await Order.updateMany(
        { status: 'Processing' },
        { $set: { status: 'Shipped' } }
    )
    res.status(200).json({
        success: true,
        message: 'Sale ended',
        result
    })
})

// soldAndAvailableProducts
export const soldAndAvailableProducts = catchAsyncError(async (req, res, next) => {
    const products = await Product.find()

    let totalAvailable = 0
    products.forEach(product => {
        totalAvailable = totalAvailable + product.availableUnits
    })
    let totalSold = 0
    totalSold = 1000 - totalAvailable

    res.status(200).json({
        success: true,
        totalAvailable,
        totalSold
    })
})

