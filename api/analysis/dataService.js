const OrderModel = require('../models/OrderModel');

// ดึงข้อมูลคำสั่งซื้อของผู้ใช้คนเดียว
async function fetchData(userId) {
    try {
        const results = await OrderModel.findAll({
            where: {
                userId: userId
            }
        });

        const transactions = results.reduce((acc, order) => {
            const orderNumber = order.orderNumber;
            if (!acc[orderNumber]) {
                acc[orderNumber] = [];
            }
            acc[orderNumber].push(order.packageId);
            return acc;
        }, {});

        console.log('Grouped Transactions (User):', transactions);

        return Object.values(transactions);
    } catch (error) {
        console.error('Error fetching data for user:', error);
        throw error;
    }
}

// ดึงข้อมูลคำสั่งซื้อของผู้ใช้ทุกคน
async function fetchAllData() {
    try {
        const results = await OrderModel.findAll(); // ดึงข้อมูลทั้งหมดจากฐานข้อมูล

        const transactions = results.reduce((acc, order) => {
            const orderNumber = order.orderNumber;
            if (!acc[orderNumber]) {
                acc[orderNumber] = [];
            }
            acc[orderNumber].push(order.packageId);
            return acc;
        }, {});

        console.log('Grouped Transactions (All Users):', transactions);

        return Object.values(transactions);
    } catch (error) {
        console.error('Error fetching data for all users:', error);
        throw error;
    }
}

module.exports = { fetchData, fetchAllData };
