const express = require('express');
const app = express()
const IngredientsModel = require('../models/IngredientsModel');

// เส้นทางสำหรับดึงข้อมูลส่วนผสมทั้งหมด
app.get('/ingredients', async (req, res) => {
    try {
        const ingredients = await IngredientsModel.findAll();
        //console.log('Fetched ingredients:', ingredients); // เพิ่มการล็อกนี้
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ingredients', error: error.message });
    }
});

app.post('/ingredients/add', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Ingredient name is required' });
        }

        const newIngredient = await IngredientsModel.create({ name });
        res.status(201).json(newIngredient);
    } catch (error) {
        res.status(500).json({ message: 'Error adding ingredient', error: error.message });
    }
});

module.exports = app;
