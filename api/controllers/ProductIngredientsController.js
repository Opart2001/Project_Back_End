const express = require('express');
const app = express()
const ProductModel = require('../models/ProductModel');
const ProductIngredientsModel = require('../models/ProductIngredientsModel');
const IngredientsModel = require('../models/IngredientsModel');



app.put('/products/update/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, description, type, location, size, quantityInStock, price, ingredients } = req.body;

    try {
        const product = await ProductModel.findByPk(productId);

        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        await product.update({ name, description, type, location, size, quantityInStock, price });

        // Delete existing ingredient associations
        await ProductIngredientsModel.destroy({ where: { productId } });

        // Add new ingredient associations
        const ingredientAssociations = ingredients.map(ingredientId => ({
            productId,
            ingredientId
        }));
        await ProductIngredientsModel.bulkCreate(ingredientAssociations);

        res.send({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating product', error: error.message });
    }
});



app.get('/products/:productId/ingredients', async (req, res) => {
    try {
        const productId = req.params.productId;
        const ingredients = await IngredientsModel.findAll({
            include: [{
                model: ProductModel,
                where: { id: productId }
            }]
        });
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching ingredients' });
    }
});

app.get('/rec/products/:productId/ingredients', async (req, res) => {
    try {
        const { productId } = req.params;
        const ingredients = await ProductIngredientsModel.findAll({
            where: { productId },
            include: [{ model: IngredientsModel }]
        });
        res.json(ingredients);
    } catch (error) {
        console.error('Error fetching product ingredients:', error);
        res.status(500).json({ error: 'Error fetching product ingredients' });
    }
});


// เพิ่ม route PUT สำหรับอัพเดตรายการส่วนผสมของผลิตภัณฑ์
app.put('/product-ingredients', async (req, res) => {
    try {
        const { productId, ingredients } = req.body;

        if (!productId || !Array.isArray(ingredients)) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        // Find existing ingredients for the productId
        const existingIngredients = await ProductIngredientsModel.findAll({
            where: { productId },
            include: [{ model: IngredientsModel, attributes: ['id', 'name'] }]
        });
        const existingIngredientIds = existingIngredients.map(entry => entry.ingredientId);

        // Determine which ingredients to add and which to remove
        const ingredientsToAdd = ingredients.filter(id => !existingIngredientIds.includes(id));
        const ingredientsToRemove = existingIngredientIds.filter(id => !ingredients.includes(id));

        // Add new ingredients
        await Promise.all(
            ingredientsToAdd.map(ingredientId => ProductIngredientsModel.create({ productId, ingredientId }))
        );

        // Remove old ingredients
        await ProductIngredientsModel.destroy({
            where: {
                productId,
                ingredientId: ingredientsToRemove
            }
        });

        // Return updated list of ingredients for the product
        const updatedIngredients = await ProductIngredientsModel.findAll({
            where: { productId },
            include: [{ model: IngredientsModel, attributes: ['id', 'name'] }]
        });
        const formattedIngredients = updatedIngredients.map(entry => entry.ingredient);

        res.status(200).json(formattedIngredients);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product ingredients', error: error.message });
    }
});






module.exports = app;
