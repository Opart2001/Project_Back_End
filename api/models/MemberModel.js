const conn = require('../connect');
const { DataTypes } = require('sequelize');

const MemberModel = conn.define('member',{
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255)
    },
    phone: {
        type: DataTypes.STRING(255)
    },
    email: {
        type: DataTypes.STRING(255)
    },
    address: {
        type: DataTypes.STRING(255)
    },
    sex: {
        type: DataTypes.STRING(255)
    },
    pass: {
        type: DataTypes.STRING(255)
    },
    role: {
        type: DataTypes.STRING(255)
    }

})
//MemberModel.sync({alter : true});
module.exports = MemberModel;