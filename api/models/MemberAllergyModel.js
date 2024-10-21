const conn = require('../connect');
const MemberModel = require('./MemberModel');
const IngredientModel = require('./IngredientsModel');

const { DataTypes } = require('sequelize');

const MemberAllergyModel = conn.define('member_allergies', {
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

//MemberAllergyModel.sync({alter: true});
module.exports = MemberAllergyModel;
