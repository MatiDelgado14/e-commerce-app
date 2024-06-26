const express = require('express');
const fs = require('fs');
const router = express.Router();

const cartsFilePath = './data/carts.json';
const productsFilePath = './data/products.json';

// Helper function to read JSON file
const readJSONFile = (filePath) => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// Helper function to write JSON file
const writeJSONFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Crear un nuevo carrito
router.post('/', (req, res) => {
  const carts = readJSONFile(cartsFilePath);
  const newCart = {
    id: `${Date.now()}`, // Generar un ID único basado en la hora actual
    products: []
  };

  carts.push(newCart);
  writeJSONFile(cartsFilePath, carts);

  res.status(201).json(newCart);
});

// Listar productos de un carrito por ID
router.get('/:cid', (req, res) => {
  const carts = readJSONFile(cartsFilePath);
  const cart = carts.find(c => c.id === req.params.cid);

  if (cart) {
    res.json(cart.products);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

// Agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
  const carts = readJSONFile(cartsFilePath);
  const products = readJSONFile(productsFilePath);
  const cart = carts.find(c => c.id === req.params.cid);
  const product = products.find(p => p.id === req.params.pid);

  if (cart && product) {
    const productInCart = cart.products.find(p => p.product === req.params.pid);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    writeJSONFile(cartsFilePath, carts);

    res.status(201).json(cart);
  } else {
    res.status(404).json({ error: 'Carrito o producto no encontrado' });
  }
});

module.exports = router;
