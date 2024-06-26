const express = require('express');
const fs = require('fs');
const router = express.Router();

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

module.exports = (io) => {
  // Listar todos los productos
  router.get('/', (req, res) => {
    const limit = req.query.limit;
    let products = readJSONFile(productsFilePath);

    if (limit) {
      products = products.slice(0, parseInt(limit));
    }

    res.json(products);
  });

  // Obtener un producto por ID
  router.get('/:pid', (req, res) => {
    const products = readJSONFile(productsFilePath);
    const product = products.find(p => p.id === req.params.pid);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  });

  // Agregar un nuevo producto
  router.post('/', (req, res) => {
    const products = readJSONFile(productsFilePath);
    const newProduct = {
      id: `${Date.now()}`, // Generar un ID único basado en la hora actual
      ...req.body,
      status: req.body.status || true
    };

    products.push(newProduct);
    writeJSONFile(productsFilePath, products);

    // Emitir actualización de productos a todos los clientes
    io.emit('product-update', products);

    res.status(201).json(newProduct);
  });

  // Actualizar un producto por ID
  router.put('/:pid', (req, res) => {
    let products = readJSONFile(productsFilePath);
    const productIndex = products.findIndex(p => p.id === req.params.pid);

    if (productIndex !== -1) {
      const updatedProduct = {
        ...products[productIndex],
        ...req.body,
        id: products[productIndex].id // Asegurarse de que el ID no cambie
      };

      products[productIndex] = updatedProduct;
      writeJSONFile(productsFilePath, products);

      // Emitir actualización de productos a todos los clientes
      io.emit('product-update', products);

      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  });

  // Eliminar un producto por ID
  router.delete('/:pid', (req, res) => {
    let products = readJSONFile(productsFilePath);
    const newProducts = products.filter(p => p.id !== req.params.pid);

    if (newProducts.length !== products.length) {
      writeJSONFile(productsFilePath, newProducts);

      // Emitir actualización de productos a todos los clientes
      io.emit('product-update', newProducts);

      res.json({ message: 'Producto eliminado' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  });

  return router;
};
