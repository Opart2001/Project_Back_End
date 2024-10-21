const { fetchData, fetchAllData } = require('./dataService');
const Apriori = require('node-apriori').Apriori;
const ProductIngredientsModel = require('../models/ProductIngredientsModel');
const MemberAllergyModel = require('../models/MemberAllergyModel'); 
const IngredientsModel = require('../models/IngredientsModel'); 

// ตรวจสอบว่ามีสินค้าที่ลูกค้าแพ้หรือไม่
const checkForAllergens = async (userId, productIds) => {
    // ส่วนผสมที่ลูกค้าแพ้
    const allergies = await MemberAllergyModel.findAll({
        where: { memberId: userId },
        include: [{
            model: IngredientsModel,
            attributes: ['id', 'name']
        }]
    });

    // ส่วนผสมที่เกี่ยวข้องกับสินค้า
    const productIngredients = await ProductIngredientsModel.findAll({
        where: { productId: productIds },
        include: [{
            model: IngredientsModel,
            attributes: ['id', 'name']
        }]
    });

    // ตรวจสอบว่าสินค้ามีส่วนผสมที่ลูกค้าแพ้หรือไม่
    const allergenIds = allergies.map(allergy => allergy.ingredientId);
    return productIngredients.some(ingredient => allergenIds.includes(ingredient.ingredientId));
};

// ฟังก์ชันสำหรับสร้างกฎความสัมพันธ์ พร้อมกรองกฎที่มีส่วนผสมที่แพ้ออก
async function generateAssociationRules(userId, frequentItemsets) {
    const rules = [];

    // ค้นหากฎจาก frequent itemsets
    for (const itemset of frequentItemsets) {
        const { items, support: supportAB } = itemset;

        if (items.length > 1) {
            for (let i = 0; i < items.length; i++) {
                for (let j = 0; j < items.length; j++) {
                    if (i !== j) {
                        const itemA = items[i];
                        const itemB = items[j];

                        const supportA = findSupportForItem(itemA, frequentItemsets);
                        const supportB = findSupportForItem(itemB, frequentItemsets);

                        if (supportA > 0 && supportB > 0) {
                            const confidence = (supportAB / supportA) * 100;
                            const lift = supportAB / (supportA * supportB); 

                            const rule = {
                                rule: `${itemA} -> ${itemB}`,
                                support: supportAB,
                                confidence: confidence.toFixed(2) + '%',
                                lift: lift.toFixed(2)
                            };

                            // ตรวจสอบว่าสินค้าในกฎมีส่วนผสมที่ลูกค้าแพ้หรือไม่
                            const containsAllergens = await checkForAllergens(userId, [itemA, itemB]);
                            if (!containsAllergens) {
                                rules.push(rule);
                            }
                        }
                    }
                }
            }
        }
    }

    return rules;
}

// ฟังก์ชันสำหรับหาค่า support ของรายการเดี่ยวๆ
function findSupportForItem(item, frequentItemsets) {
    const itemset = frequentItemsets.find(set => set.items.length === 1 && set.items.includes(item));
    return itemset ? itemset.support : 0;
}

// วิเคราะห์ของผู้ใช้คนเดียว พร้อมการกรองกฎที่มีส่วนผสมที่แพ้
async function performAnalysis(userId) {
    try {
        const transactions = await fetchData(userId);
        //console.log('Transactions for Analysis (User):', transactions);

        const apriori = new Apriori(0.1); // กำหนดค่า support

        const frequentItemsets = [];
        apriori.on('data', function (itemset) {
            const support = itemset.support;
            const items = itemset.items;
            frequentItemsets.push({ items, support });
        });

        const result = await apriori.exec(transactions);
        const associationRules = await generateAssociationRules(userId, frequentItemsets); // เพิ่มการกรองกฎ

        return {
            executionTime: result.executionTime,
            frequentItemsetsDetailed: frequentItemsets,
            associationRules: associationRules
        };
    } catch (error) {
        throw new Error(`Error during analysis: ${error.message}`);
    }
}

// วิเคราะห์ของผู้ใช้ทั้งหมด พร้อมการกรองกฎที่มีส่วนผสมที่แพ้
async function performAnalysisForAllUsers(userId) {
    try {
        const transactions = await fetchAllData(); 
        //console.log('Transactions for Analysis (All Users):', transactions);

        const apriori = new Apriori(0.01); // กำหนดค่า support 

        const frequentItemsets = [];
        apriori.on('data', function (itemset) {
            const support = itemset.support;
            const items = itemset.items;
            frequentItemsets.push({ items, support });
        });

        const result = await apriori.exec(transactions);
        const associationRules = await generateAssociationRules(userId, frequentItemsets); // เปลี่ยน userId เป็น null หรือค่าที่เหมาะสม

        return {
            executionTime: result.executionTime,
            frequentItemsetsDetailed: frequentItemsets,
            associationRules: associationRules
        };
    } catch (error) {
        console.error(`Error during analysis for all users: ${error.message}`);
        throw new Error(`Error during analysis for all users: ${error.message}`);
    }
}



module.exports = { performAnalysis, performAnalysisForAllUsers };
