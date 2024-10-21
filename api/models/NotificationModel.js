const { DataTypes } = require('sequelize');
const sequelize = require('../connect'); // ปรับเส้นทางให้ตรงกับไฟล์เชื่อมต่อฐานข้อมูลของคุณ

const NotificationModel = sequelize.define('notifications', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isRead: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
    },
}, {
    tableName: 'notifications',
    timestamps: true, // ใช้ timestamps สำหรับ createdAt และ updatedAt
});



module.exports = NotificationModel;
