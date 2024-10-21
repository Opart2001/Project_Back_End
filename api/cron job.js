const cron = require('node-cron');
const { Op } = require('sequelize'); // ใช้สำหรับการ query เงื่อนไข
const NotificationModel = require('../models/NotificationModel'); // ปรับเส้นทางตามที่เก็บโมเดล

// ตั้งค่า cron job ให้ลบการแจ้งเตือนที่หมดอายุทุกวันตอนเที่ยงคืน

cron.schedule('0 0 * * *', async () => {
    try {
        const currentDate = new Date();
        // ทำการลบการแจ้งเตือนที่ expiryDate น้อยกว่า currentDate (เปรียบเทียบเฉพาะวันที่)
        await NotificationModel.destroy({
            where: {
                expiryDate: {
                    [Op.lt]: currentDate.toISOString().split('T')[0] // เปรียบเทียบแค่วันที่ ไม่สนใจเวลา
                }
            }
        });
        console.log('Expired notifications cleaned up');
    } catch (error) {
        console.error('Error cleaning up expired notifications:', error.message);
    }
});


