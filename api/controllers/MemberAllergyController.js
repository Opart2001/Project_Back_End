const express = require('express');
const app = express();
const MemberAllergyModel = require('../models/MemberAllergyModel');
const IngredientsModel = require("../models/IngredientsModel")

// ดึงข้อมูลผลไม้ที่แพ้ของสมาชิก
app.get('/member-allergies/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;

        if (!memberId) {
            return res.status(400).json({ message: 'Member ID is required' });
        }

        // Find all favorite ingredients for the given memberId
        const allergys = await MemberAllergyModel.findAll({
            where: { memberId },
            include: [{
                model: IngredientsModel,
                attributes: ['id', 'name'] // Include only id and name of the ingredient
            }]
        });

        // Format the result to include only ingredient details
        const formattedAllergy = allergys.map(allergy => allergy.ingredient);

        res.json(formattedAllergy);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching member favorites', error: error.message });
    }
});




// อัพเดตข้อมูลผลไม้ที่แพ้ของสมาชิก
app.put('/member-allergies', async (req, res) => {
    try {
        const { memberId, allergies } = req.body;

        if (!memberId || !Array.isArray(allergies)) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        // ค้นหาข้อมูลแพ้เดิมในฐานข้อมูลสำหรับสมาชิกนี้
        const existingAllergies = await MemberAllergyModel.findAll({ where: { memberId } });

        if (existingAllergies.length === 0) {
            // กรณีที่ไม่มีข้อมูลแพ้เดิม
            await MemberAllergyModel.bulkCreate(allergies.map(id => ({ memberId, ingredientId: id })));
        } else {
            // ลบข้อมูลแพ้ที่มีอยู่เดิมก่อนการอัปเดต
            await MemberAllergyModel.destroy({ where: { memberId } });

            // เพิ่มข้อมูลแพ้ใหม่
            await MemberAllergyModel.bulkCreate(allergies.map(id => ({ memberId, ingredientId: id })));
        }

        res.status(200).json({ message: 'Allergies updated successfully' });
    } catch (error) {
        console.error('Error updating allergies:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// ลบข้อมูลผลไม้ที่แพ้ของสมาชิก
app.delete('/member-allergies/:memberId/:ingredientId', async (req, res) => {
    try {
        const { memberId, ingredientId } = req.params;

        if (!memberId || !ingredientId) {
            return res.status(400).json({ message: 'Member ID and Ingredient ID are required' });
        }

        // ลบข้อมูลแพ้ที่ตรงกับ memberId และ ingredientId ที่ระบุ
        const deleted = await MemberAllergyModel.destroy({
            where: { memberId, ingredientId }
        });

        if (deleted) {
            res.status(200).json({ message: 'Allergy removed successfully' });
        } else {
            res.status(404).json({ message: 'Allergy not found' });
        }
    } catch (error) {
        console.error('Error deleting allergy:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});




module.exports = app;
