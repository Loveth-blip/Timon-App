// Test file to demonstrate the product endpoints
// Run this with: node test-products.js

const sampleProducts = [
  {
    title: 'Smartphone X',
    category: 'Electronics',
    description: 'The latest smartphone with advanced features and a stunning display.',
    price: 799.99,
    imageUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    title: 'Wireless Headphones',
    category: 'Electronics',
    description: 'Premium wireless headphones with noise cancellation and long battery life.',
    price: 199.99,
    imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    title: 'Fitness Tracker',
    category: 'Wearables',
    description: 'Track your fitness goals with this advanced fitness tracker.',
    price: 99.99,
    imageUrl: 'https://images.pexels.com/photos/4498482/pexels-photo-4498482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    title: 'Smart Watch',
    category: 'Wearables',
    description: 'Stay connected with this feature-packed smart watch.',
    price: 249.99,
    imageUrl: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    title: 'Laptop Pro',
    category: 'Computers',
    description: 'Powerful laptop for professionals and creatives.',
    price: 1299.99,
    imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    title: 'Wireless Mouse',
    category: 'Accessories',
    description: 'Ergonomic wireless mouse for comfortable use.',
    price: 49.99,
    imageUrl: 'https://images.pexels.com/photos/5082577/pexels-photo-5082577.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

// Example API calls (assuming server is running on localhost:3000)

// 1. Create a single product
const createSingleProduct = async () => {
  const response = await fetch('http://localhost:3000/api/v1/product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sampleProducts[0])
  });
  
  const result = await response.json();
  console.log('Single product created:', result);
};

// 2. Create multiple products (bulk import)
const createMultipleProducts = async () => {
  const response = await fetch('http://localhost:3000/api/v1/product/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ products: sampleProducts })
  });
  
  const result = await response.json();
  console.log('Multiple products created:', result);
};

// 3. Get all products
const getAllProducts = async () => {
  const response = await fetch('http://localhost:3000/api/v1/product');
  const result = await response.json();
  console.log('All products:', result);
};

// 4. Get a single product by ID
const getProductById = async (productId) => {
  const response = await fetch(`http://localhost:3000/api/v1/product/${productId}`);
  const result = await response.json();
  console.log('Product by ID:', result);
};

// 5. Update a product
const updateProduct = async (productId, updateData) => {
  const response = await fetch(`http://localhost:3000/api/v1/product/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData)
  });
  
  const result = await response.json();
  console.log('Product updated:', result);
};

// 6. Delete a product
const deleteProduct = async (productId) => {
  const response = await fetch(`http://localhost:3000/api/v1/product/${productId}`, {
    method: 'DELETE'
  });
  
  console.log('Product deleted:', response.status);
};

// Example usage:
console.log('Product API Test Examples:');
console.log('1. Create single product: createSingleProduct()');
console.log('2. Create multiple products: createMultipleProducts()');
console.log('3. Get all products: getAllProducts()');
console.log('4. Get product by ID: getProductById("product_id")');
console.log('5. Update product: updateProduct("product_id", { price: 899.99 })');
console.log('6. Delete product: deleteProduct("product_id")');

// Export functions for use in other files
export {
  createSingleProduct,
  createMultipleProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  sampleProducts
};
