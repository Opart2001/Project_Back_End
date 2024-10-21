const express = require('express');
const app = express();
const NotificationModel = require('../models/NotificationModel'); // ปรับเส้นทางตามที่เก็บโมเดล
const MemberModel = require('../models/MemberModel');

app.use(express.json()); // เพิ่มการจัดการ JSON

// ดึงข้อมูลการแจ้งเตือนของผู้ใช้ทั้งหมดตาม userId
app.get('/notifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const notifications = await NotificationModel.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

///---------admin ส่งเเจ้งเตือน
app.post('/notifications', async (req, res) => {
    try {
        const { title, message, type, expiryDate, userId, sendToAll } = req.body;

        // กรณีส่งให้ทุกคน
        if (sendToAll) {
            const members = await MemberModel.findAll(); // ดึงข้อมูลสมาชิกทั้งหมด
            const notifications = members.map(member =>
                NotificationModel.create({
                    title,
                    message,
                    type,
                    expiryDate,
                    userId: member.id, // ตั้งค่าผู้ใช้แต่ละคน
                    isRead: false
                })
            );
            await Promise.all(notifications);
        } 
        // กรณีส่งให้ userId เฉพาะ
        else {
            if (!userId) {
                return res.status(400).json({ message: 'userId is required when sendToAll is false' });
            }
            await NotificationModel.create({
                title,
                message,
                type,
                expiryDate,
                userId,  // กำหนด userId ที่ส่งมาจาก frontend
                isRead: false
            });
        }

        res.status(201).json({ message: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending notification', error: error.message });
    }
});

//-----อัปเดตสถานะการอ่านของการแจ้งเตือน
app.patch('/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await NotificationModel.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification status', error: error.message });
    }
});

module.exports = app;
