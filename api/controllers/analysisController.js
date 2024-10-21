const { performAnalysis } = require('../analysis/associationRuleMining');

async function analyzeOrderData(req, res) {
    try {
        const { userId } = req.params;
        if (!userId || isNaN(userId) || userId <= 0) {
            return res.status(400).json({ message: 'Invalid userId provided' });
        }

        const analysisResults = await performAnalysis(userId);
        res.status(200).json(analysisResults);
    } catch (error) {
        console.error('Error in analyzeOrderData:', error);
        res.status(500).json({ message: 'Error analyzing order data', error: error.message });
    }
}

module.exports = { analyzeOrderData };
