const express = require('express');
const app = express();
const { Op } = require('sequelize');
const ProductModel = require('../models/ProductModel');
const ProductIngredientsModel = require('../models/ProductIngredientsModel'); // เพิ่มการนำเข้าโมเดลนี้
const IngredientsModel = require('../models/IngredientsModel'); // Adjust path as necessary
const MemberAllergyModel = require('../models/MemberAllergyModel'); // Adjust path as necessary
const MemberFavoriteModel = require('../models/MemberFavoriteModel');


// -----------------------------------ดึงสินค้าทั้งหมด
app.get('/admin/products/list', async (req, res) => {
    try {
        const results = await ProductModel.findAll();
        res.send({ results: results });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
});
// -----------------------------------ดึงสินค้าทั้งหมด

//------------------------------------ดึงสินค้าไปหน้าorder
app.get('/products/order/list', async (req, res) => {
    try {
        // ดึงรายการสินค้าที่ isVisible เป็น true
        const results = await ProductModel.findAll();
        res.send({ results: results });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
});




//------------------------------------ดึงสินค้าไปหน้าrec,card

app.get('/products/list', async (req, res) => {
    try {
        const memberId = req.query.memberId;

        if (!memberId) {
            return res.status(400).send({ message: 'Member ID is required' });
        }

        // ดึงรายการส่วนผสมที่ผู้ใช้แพ้
        const allergies = await MemberAllergyModel.findAll({
            where: { memberId: memberId },
            attributes: ['ingredientId'],
        });

        const allergicIngredientIds = allergies.map(allergy => allergy.ingredientId);

        //console.log('Allergic Ingredient IDs:', allergicIngredientIds); // Debugging

        // ดึงรายการสินค้าทั้งหมดที่ isVisible เป็น true
        const allProducts = await ProductModel.findAll({
            where: { isVisible: true }, // เงื่อนไข isVisible 
            include: [{
                model: IngredientsModel,
                attributes: ['id'],
                required: false,
            }]
        });

        //console.log('All Products:', allProducts); // Debugging

        // กรองสินค้าที่มีส่วนผสมที่ผู้ใช้แพ้
        const filteredProducts = allProducts.filter(product => {
            const hasAllergicIngredients = product.ingredients.some(ingredient => 
                allergicIngredientIds.includes(ingredient.id)
            );
            return !hasAllergicIngredients;
        });

        res.send({ results: filteredProducts });
    } catch (e) {
        console.error('Error:', e); // Logging the actual error
        res.status(500).send({ message: e.message });
    }
});



//----------------------------------------------------------------------------------- ดึงรายการสินค้าทั้งหมดและกรองตามส่วนผสมที่แพ้


// -------------------------------------ค้นหาสินค้าจากชื่อ
app.get('/products/query', async (req, res) => {
    try {
        const query = req.query.query;

        // ค้นหาสินค้าตามชื่อและจังหวัด
        const productsByNameOrLocation = await ProductModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { location: { [Op.like]: `%${query}%` } }
                ],
            },
            include: [{
                model: IngredientsModel,
                attributes: ['id', 'name'],
                required: false
            }]
        });

        // ค้นหาส่วนผสมที่ตรงกับคำค้นหา
        const ingredientsByQuery = await IngredientsModel.findAll({
            where: {
                name: { [Op.like]: `%${query}%` }
            }
        });

        const ingredientIds = ingredientsByQuery.map(ingredient => ingredient.id);

        // ค้นหาสินค้าที่มีส่วนผสมที่ตรงกับคำค้นหา
        const productsByIngredients = await ProductModel.findAll({
            include: [{
                model: IngredientsModel,
                attributes: ['id'],
                where: {
                    id: {
                        [Op.in]: ingredientIds
                    }
                }
            }]
        });

        // รวมผลลัพธ์จากการค้นหาตามชื่อ, จังหวัด และส่วนผสม
        const allProducts = [...productsByNameOrLocation, ...productsByIngredients];
        // กำจัดสินค้าที่ซ้ำกัน
        const uniqueProducts = Array.from(new Set(allProducts.map(p => p.id)))
            .map(id => {
                return allProducts.find(p => p.id === id);
            });

        res.send({ results: uniqueProducts });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
});
// -------------------------------------ค้นหาสินค้าจากชื่อ

// ----------------------------------------ลดสินค้าเมื่อกดสั่งซื้อ
app.put('/products/update-stock/:id', async (req, res) => {
    const productId = req.params.id;
    const { quantity } = req.body;

    try {
        // ค้นหาสินค้าตาม ID
        const product = await ProductModel.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // อัปเดตจำนวนสินค้า
        product.quantityInStock = quantity;
        await product.save();

        res.status(200).json({ message: 'Product stock updated successfully' });
    } catch (error) {
        console.error('Error updating stock:', error.message);
        res.status(500).json({ message: 'Failed to update stock' });
    }
});
// ----------------------------------------ลดสินค้าเมื่อกดสั่งซื้อ

// -------------------------------------------------------------------------------------------------------adminเพิ่มสินค้า
app.post('/products/add', async (req, res) => {
    try {
        const { name, description, type, location, size, quantityInStock, ingredients, price, imageUrl,} = req.body;

        // สร้างสินค้าลงในตาราง Products
        const product = await ProductModel.create({
            name,
            description,
            type,
            location,
            size,
            quantityInStock,
            price,
            imageUrl
        });

        // เพิ่มข้อมูลส่วนผสมลงในตาราง ProductIngredients
        if (ingredients && ingredients.length > 0) {
            const productIngredients = ingredients.map(ingredientId => ({
                productId: product.id,
                ingredientId
            }));
            await ProductIngredientsModel.bulkCreate(productIngredients);
        }

        res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// -------------------------------------------------------------------------------------------------------adminเพิ่มสินค้า

// -------------------------------------------------------------------------------------------------------admin เเก้ไขรายละเอียดข้อมูล
app.put('/products/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type, location, size, quantityInStock, price, imageUrl, isVisible } = req.body;

        // อัปเดตสินค้าโดยใช้ค่าจำนวนที่ส่งมาโดยตรง
        await ProductModel.update({
            name: name,
            description: description,
            type: type,
            location: location,
            size: size,
            quantityInStock: quantityInStock, // ไม่ต้องบวกกับค่าเดิม
            price: price,
            imageUrl: imageUrl,
            isVisible: isVisible
        }, {
            where: { id }
        });

        res.send({ message: 'Product updated successfully' });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
});



// -------------------------------------------------------------------------------------------------------admin เเก้ไขรายละเอียดข้อมูล

// เพิ่ม API endpoint สำหรับดึงข้อมูลชื่อผู้ใช้
app.get('/products/name/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await ProductModel.findByPk(productId);

        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        res.send({ product: product.name, message: 'success' });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
});

// Route to get products by ingredientId

//-------------------------------------------------------ส่งสินค้าเเนะนำไปหน้า detail 
app.get('/products/recommendation', async (req, res) => {
    try {
        const ids = req.query.ids.split(','); // ดึงค่าจาก query string และแปลงเป็น array
        if (!ids || ids.length === 0) {
            return res.status(400).send({ message: 'Product IDs are required' });
        }

        // ดึงสินค้าทั้งหมดที่ตรงกับ IDs และเช็ค isVisible
        const products = await ProductModel.findAll({
            where: {
                id: ids,
                isVisible: true // เงื่อนไข isVisible 
            },
            include: [{
                model: IngredientsModel,
                attributes: ['id']
            }]
        });

        if (!products || products.length === 0) {
            return res.status(404).send({ message: 'Products not found' });
        }

        res.send({ results: products });
    } catch (e) {
        console.error('Error:', e); // Logging the actual error
        res.status(500).send({ message: e.message });
    }
});


// ---------------------------------------ค้นหาสินค้าตามส่วนผสมที่คล้ายคลึงกัน หน้า rec
app.get('/products/similar', async (req, res) => {
    try {
        const memberId = req.query.memberId; // รับ memberId จาก query string

        if (!memberId) {
            return res.status(400).send({ message: 'Member ID is required' });
        }

        // ดึงส่วนผสมที่ผู้ใช้ชอบจากตาราง member_favorites
        const favoriteIngredients = await MemberFavoriteModel.findAll({
            where: {
                memberId: memberId
            },
            attributes: ['ingredientId']
        });

        if (!favoriteIngredients || favoriteIngredients.length === 0) {
            return res.status(404).send({ message: 'No favorite ingredients found for this member' });
        }

        const ingredientIds = favoriteIngredients.map(fav => fav.ingredientId);

        // ดึงสินค้าที่มีส่วนผสมตรงกับที่ผู้ใช้ชอบ และเช็ค isVisible
        const products = await ProductModel.findAll({
            where: {
                isVisible: true // เพิ่มเงื่อนไข isVisible ตรงนี้
            },
            include: [{
                model: IngredientsModel,
                attributes: ['id', 'name'],
                where: {
                    id: {
                        [Op.in]: ingredientIds
                    }
                }
            }]
        });

        if (!products || products.length === 0) {
            return res.status(404).send({ message: 'No products found with matching ingredients' });
        }

        res.send({ results: products });
    } catch (e) {
        console.error('Error:', e);
        res.status(500).send({ message: e.message });
    }
});

// ---------------------------------------ค้นหาสินค้าตามส่วนผสมที่คล้ายคลึงกัน





module.exports = app;
