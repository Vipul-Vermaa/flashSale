import cron from 'node-cron'
import { saleEnd, saleStart } from '../controllers/productController.js'
import { Product } from '../models/productModel.js'

cron.schedule('0 * * * *', async () => {
    try {
        const products = await Product.find()
        const allSoldOut = products.every(product => product.availableUnits <= 0);

        if (allSoldOut) {
            await saleEnd()
            console.log('Sale ended due to all stocks being sold out');
        } else {
            console.log('Sale is still on');
        }
    }
    catch (error) {
        console.error('Error ending sale:', error);
    }
})


const saleCronJob = cron.schedule('* * * * *', () => {
    let day = new Date().getDay();
    let hour = new Date().getHours();
    let minute = new Date().getMinutes()

    if (day === 0 || hour === 0 || minute === 0) {
        saleStart()

        saleCronJob.stop()
        console.log('Sale already started');
    }
})
saleCronJob.start()