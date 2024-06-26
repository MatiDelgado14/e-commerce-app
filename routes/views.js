const express = require('express');
const router = express.Router();
const fs = require('fs');
const productsFilePath = './data/products.json';

// Helper function to read JSON file
const readJSONFile = (filePath) => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// Vista "home.handlebars"
router.get('/', (req, res) => {
  const products = readJSONFile(productsFilePath);
  res.render('home', { products });
});

// Vista "realTimeProducts.handlebars"
router.get('/realtimeproducts', (req, res) => {
  const products = readJSONFile(productsFilePath);
  res.render('realTimeProducts', { products });
});

module.exports = router;
