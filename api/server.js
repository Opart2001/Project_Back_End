const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const productController = require('./controllers/ProductController');
const memberController = require('./controllers/MemberController');
const orderController = require('./controllers/OrderController');
const ingredientsController = require('./controllers/IngredientsController');
const memberFavoritesController = require('./controllers/MemberFavoriteController');  
const productIngredientsController = require('./controllers/ProductIngredientsController')
const memberAllergyController = require('./controllers/MemberAllergyController')
const notificationController = require('./controllers/NotificationController')
const associationRuleMiningController = require('./controllers/associationRuleMiningController')




const ProductModel = require('./models/ProductModel');
const IngredientsModel = require('./models/IngredientsModel');
const ProductIngredientsModel = require('./models/ProductIngredientsModel');
const MemberFavoriteModel = require('./models/MemberFavoriteModel');
const IngredientModel = require('./models/IngredientsModel');
const MemberAllergyModel = require('./models/MemberAllergyModel');

const app = express();
const port = 3000;


app.use(cors()); // เพิ่ม middleware ของ CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// ตั้งค่าความสัมพันธ์ระหว่างโมเดล
ProductModel.belongsToMany(IngredientsModel, { through: ProductIngredientsModel, foreignKey: 'productId' });
IngredientsModel.belongsToMany(ProductModel, { through: ProductIngredientsModel, foreignKey: 'ingredientId' });

MemberFavoriteModel.belongsTo(IngredientModel, { foreignKey: 'ingredientId' });
IngredientModel.hasMany(MemberFavoriteModel, { foreignKey: 'ingredientId' });

ProductIngredientsModel.belongsTo(IngredientModel, { foreignKey: 'ingredientId' });
IngredientModel.hasMany(ProductIngredientsModel, { foreignKey: 'ingredientId' });


MemberAllergyModel.belongsTo(IngredientModel, { foreignKey: 'ingredientId' });
IngredientModel.hasMany(MemberAllergyModel, { foreignKey: 'ingredientId' });








// เพิ่มการใช้งานของ controller
app.use(productController);
app.use(memberController);
app.use(orderController);
app.use(ingredientsController);
app.use(memberFavoritesController);
app.use(productIngredientsController);
app.use(memberAllergyController);
app.use(notificationController);
//app.use(analysisRouter);
app.use(associationRuleMiningController);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
