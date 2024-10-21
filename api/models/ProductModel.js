const { DataTypes } = require('sequelize');
const sequelize = require('../connect');


const ProductModel = sequelize.define('packages', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    size: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    quantityInStock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING(1000)  // คอลัมน์ imageUrl เพื่อเก็บ URL ของรูปภาพ
    },
    isVisible: {
        type: DataTypes.BOOLEAN,  // คอลัมน์ isVisible เพื่อเก็บสถานะการแสดงผลสินค้า
        defaultValue: true        // ค่าเริ่มต้นเป็น true (แสดงสินค้า)
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});




module.exports = ProductModel;
