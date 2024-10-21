const express = require('express');
const app = express();
const { performAnalysis } = require('../analysis/associationRuleMining'); // นำเข้าฟังก์ชัน performAnalysis
const { performAnalysisForAllUsers } = require('../analysis/associationRuleMining');
app.use(express.json());

//  วิเคราะห์ข้อมูลคำสั่งซื้อคนเดียว 
app.get('/api/association/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        // เรียกใช้ฟังก์ชัน performAnalysis โดยส่ง userId และตรวจสอบการแพ้
        const analysisResults = await performAnalysis(userId);

        // ส่งผลลัพธ์การวิเคราะห์
        res.status(200).json({
            ...analysisResults,
            frequentItemsetsDetailed: analysisResults.frequentItemsetsDetailed,  // ส่งออก itemsets แบบเดิม (id)
            associationRules: analysisResults.associationRules  // ส่งออก association rules แบบเดิม (id)
        });
    } catch (error) {
        console.error('Error in analyzeOrderData:', error);
        res.status(500).json({ message: 'Error analyzing order data', error: error.message });
    }
});


//  วิเคราะห์ข้อมูลคำสั่งซื้อทั้งหมด
app.get('/api/association-all/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const analysisResults = await performAnalysisForAllUsers(userId);  
        res.status(200).json({
            ...analysisResults,
            frequentItemsetsDetailed: analysisResults.frequentItemsetsDetailed,
            associationRules: analysisResults.associationRules
        });
    } catch (error) {
        console.error('Error in analyzing order data for all users:', error);
        res.status(500).json({ message: 'Error analyzing order data for all users', error: error.message });
    }
});


module.exports = app;
