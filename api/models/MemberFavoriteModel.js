const conn = require('../connect');
const MemberModel = require('./MemberModel');
const IngredientModel = require('./IngredientsModel');

const { DataTypes } = require('sequelize');

const MemberFavoriteModel = conn.define('member_favorites', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    memberId: {
        type: DataTypes.BIGINT,
        references: {
            model: MemberModel,
            key: 'id'
        }
    },
    ingredientId: {
        type: DataTypes.BIGINT,
        references: {
            model: IngredientModel,
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

// MemberFavoriteModel.sync({alter: true});
module.exports = MemberFavoriteModel;
