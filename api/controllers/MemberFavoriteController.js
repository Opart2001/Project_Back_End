const express = require('express');
const MemberFavoriteModel = require('../models/MemberFavoriteModel');
const IngredientsModel = require('../models/IngredientsModel');

const app = express()

app.get('/ingredients', async (req, res) => {
    try {
        // Find all ingredients
        const ingredients = await IngredientsModel.findAll({
            attributes: ['id', 'name'] // Include only id and name of the ingredient
        });

        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ingredients', error: error.message });
    }
});

// Endpoint to get member favorites

app.get('/member-favorites/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;

        if (!memberId) {
            return res.status(400).json({ message: 'Member ID is required' });
        }

        // Find all favorite ingredients for the given memberId
        const favorites = await MemberFavoriteModel.findAll({
            where: { memberId },
            include: [{
                model: IngredientsModel,
                attributes: ['id', 'name'] // Include only id and name of the ingredient
            }]
        });

        // Format the result to include only ingredient details
        const formattedFavorites = favorites.map(favorite => favorite.ingredient);

        res.json(formattedFavorites);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching member favorites', error: error.message });
    }
});




// เพิ่ม route PUT สำหรับอัพเดตรายการโปรด
app.put('/member-favorites', async (req, res) => {
    try {
        const { memberId, fruits } = req.body;

        if (!memberId || !Array.isArray(fruits)) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        // Find existing favorites for the memberId
        const existingFavorites = await MemberFavoriteModel.findAll({ where: { memberId } });
        const existingFavoriteIds = existingFavorites.map(favorite => favorite.ingredientId);

        // Determine which favorites to add and which to remove
        const favoritesToAdd = fruits.filter(id => !existingFavoriteIds.includes(id));
        const favoritesToRemove = existingFavoriteIds.filter(id => !fruits.includes(id));

        // Add new favorites
        await Promise.all(
            favoritesToAdd.map(ingredientId => MemberFavoriteModel.create({ memberId, ingredientId }))
        );

        // Remove old favorites
        await MemberFavoriteModel.destroy({
            where: {
                memberId,
                ingredientId: favoritesToRemove
            }
        });

        // Return updated list of favorites
        const updatedFavorites = await MemberFavoriteModel.findAll({
            where: { memberId },
            include: [{ model: IngredientsModel, attributes: ['id', 'name'] }]
        });
        const formattedFavorites = updatedFavorites.map(favorite => favorite.ingredient);

        res.status(200).json(formattedFavorites);
    } catch (error) {
        res.status(500).json({ message: 'Error updating favorites', error: error.message });
    }
});




app.delete('/member-favorites/:memberId/:ingredientId', async (req, res) => {
    try {
        const { memberId, ingredientId } = req.params;
        const result = await MemberFavoriteModel.destroy({
            where: { memberId, ingredientId }
        });
        if (result === 0) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing favorite', error: error.message });
    }
});



module.exports = app;
