const { DataTypes } = require('sequelize');
const sequelize = require('../connect');
const ProductModel = require('./ProductModel');
const IngredientsModel = require('./IngredientsModel');

const ProductIngredientsModel = sequelize.define('product_ingredients', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.BIGINT,
        references: {
            model: ProductModel,
            key: 'id'
        }
    },
    ingredientId: {
        type: DataTypes.BIGINT,
        references: {
            model: IngredientsModel,
            key: 'id'
        }
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

module.exports = ProductIngredientsModel;
