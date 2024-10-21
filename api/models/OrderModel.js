const conn = require('../connect');
const { DataTypes } = require('sequelize');

const OrderModel = conn.define('orders', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Members',
            key: 'id'
        }
    },
    packageId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Packages',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
    },
    orderNumber: { // เพิ่มฟิลด์ orderNumber
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // ทำให้ฟิลด์นี้มีค่าที่ไม่ซ้ำกัน
    }
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});


module.exports = OrderModel;
