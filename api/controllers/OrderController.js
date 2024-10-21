const express = require('express');
const app = express()
const OrderModel = require('../models/OrderModel'); 

//----------------------------------------------------------------------------------------- updte สถานะของสินค้า
app.put('/orders/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const { status } = req.body;

        // Update orders with the given order number
        const [updated] = await OrderModel.update({ status }, {
            where: { orderNumber }
        });

        if (updated) {
            // Find all orders with the given order number to return updated orders
            const updatedOrders = await OrderModel.findAll({
                where: { orderNumber }
            });
            res.status(200).json(updatedOrders);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
});
//----------------------------------------------------------------------------------------- updte สถานะของสินค้า


//----------------------------------------------------------------------------------------- สร้างคำสั่งซื้อ
app.post('/orders/create', async (req, res) => {
    try {
        const { userId, productId, quantity, totalPrice, status, orderNumber } = req.body;
        const newOrder = await OrderModel.create({
            userId,
            packageId: productId, // แก้ชื่อของ productId เป็น packageId ตามโมเดล
            quantity,
            totalPrice,
            status,
            orderNumber
        });
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});
//----------------------------------------------------------------------------------------- สร้างคำสั่งซื้อ

//-----------------------------------------------------------------------------------------ข้อมูล order เรียงลำดับตามวันที่จากใหม่ไปเก่า
app.get('/orders/list/admin', async (req, res) => {
    try {
        const results = await OrderModel.findAll({
            order: [['createdAt', 'DESC']] // เรียงลำดับตามวันที่จากใหม่ไปเก่า
        });
        res.send({ results: results });
    } catch(e) {
        res.status(500).send({ message: e.message });
    }
});
//-----------------------------------------------------------------------------------------ข้อมูล order เรียงลำดับตามวันที่จากใหม่ไปเก่า

//-----------------------------------------------------------------------------------------ข้อมูล order เรียงลำดับตามวันที่จากเก่าไปใหม่ 
app.get('/orders/list', async (req, res) => {
    try {
        const results = await OrderModel.findAll({
            order: [['createdAt', 'ASC']] // เรียงลำดับตามวันที่จากเก่าไปใหม่
        });
        res.send({results: results });
    } catch(e) {
        res.status(500).send({ message: e.message });
    }
});

//-----------------------------------------------------------------------------------------ข้อมูล order เรียงลำดับตามวันที่จากเก่าไปใหม่ 


module.exports = app;
