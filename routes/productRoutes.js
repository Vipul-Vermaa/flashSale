import express from 'express';
import { cancelOrder, getAllProducts, orderHistory, placeOrder, productDetail, soldAndAvailableProducts, updateOrder, viewOrder } from '../controllers/productController.js';

const router = express.Router()

// getallproducts
router.route('/getallproducts').get(getAllProducts)

// productdetails
router.route('/productdetail/:id').get(productDetail)

// placeorder
router.route('/placeorder').post(placeOrder)

// cancelorder
router.route('/cancelorder/:id').delete(cancelOrder)

// vieworder
router.route('/vieworder/:id').get(viewOrder)

// updateorder
router.route('/updateorder/:id').put(updateOrder)

// orderhistory
router.route('/orderhistory').get(orderHistory)

// soldandavailableproducts
router.route('/soldproducts').get(soldAndAvailableProducts)


export default router