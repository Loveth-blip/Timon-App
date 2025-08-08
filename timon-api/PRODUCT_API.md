# Product API Documentation

This document describes the Product API endpoints for the Timon application.

## Base URL
```
http://localhost:3000/api/v1/product
```

## Endpoints

### 1. Create a Single Product
**POST** `/api/v1/product`

Creates a single product in the database.

**Request Body:**
```json
{
  "title": "Smartphone X",
  "category": "Electronics",
  "description": "The latest smartphone with advanced features and a stunning display.",
  "price": 799.99,
  "imageUrl": "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "stock": 10,
  "tags": ["smartphone", "mobile", "tech"],
  "specifications": {
    "screen": "6.1 inch",
    "storage": "128GB",
    "ram": "8GB"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "product_id",
      "title": "Smartphone X",
      "category": "Electronics",
      "description": "The latest smartphone with advanced features and a stunning display.",
      "price": 799.99,
      "imageUrl": "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "stock": 10,
      "rating": 0,
      "numReviews": 0,
      "tags": ["smartphone", "mobile", "tech"],
      "specifications": {
        "screen": "6.1 inch",
        "storage": "128GB",
        "ram": "8GB"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. Create Multiple Products (Bulk Import)
**POST** `/api/v1/product/bulk`

Creates multiple products in the database at once.

**Request Body:**
```json
{
  "products": [
    {
      "title": "Smartphone X",
      "category": "Electronics",
      "description": "The latest smartphone with advanced features and a stunning display.",
      "price": 799.99,
      "imageUrl": "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      "title": "Wireless Headphones",
      "category": "Electronics",
      "description": "Premium wireless headphones with noise cancellation and long battery life.",
      "price": 199.99,
      "imageUrl": "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "products": [
      {
        "_id": "product_id_1",
        "title": "Smartphone X",
        "category": "Electronics",
        "description": "The latest smartphone with advanced features and a stunning display.",
        "price": 799.99,
        "imageUrl": "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "stock": 0,
        "rating": 0,
        "numReviews": 0,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "_id": "product_id_2",
        "title": "Wireless Headphones",
        "category": "Electronics",
        "description": "Premium wireless headphones with noise cancellation and long battery life.",
        "price": 199.99,
        "imageUrl": "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "stock": 0,
        "rating": 0,
        "numReviews": 0,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 3. Get All Products
**GET** `/api/v1/product`

Retrieves all products from the database.

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "products": [
      {
        "_id": "product_id_1",
        "title": "Smartphone X",
        "category": "Electronics",
        "description": "The latest smartphone with advanced features and a stunning display.",
        "price": 799.99,
        "imageUrl": "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "stock": 10,
        "rating": 4.5,
        "numReviews": 5,
        "averageRating": "4.5"
      }
    ]
  }
}
```

### 4. Get a Single Product
**GET** `/api/v1/product/:id`

Retrieves a single product by its ID.

**Response:**
```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "product_id",
      "title": "Smartphone X",
      "category": "Electronics",
      "description": "The latest smartphone with advanced features and a stunning display.",
      "price": 799.99,
      "imageUrl": "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "stock": 10,
      "rating": 4.5,
      "numReviews": 5,
      "averageRating": "4.5"
    }
  }
}
```

### 5. Update a Product
**PATCH** `/api/v1/product/:id`

Updates a product by its ID.

**Request Body:**
```json
{
  "price": 899.99,
  "stock": 15
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "product_id",
      "title": "Smartphone X",
      "category": "Electronics",
      "description": "The latest smartphone with advanced features and a stunning display.",
      "price": 899.99,
      "imageUrl": "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "stock": 15,
      "rating": 4.5,
      "numReviews": 5,
      "averageRating": "4.5",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 6. Delete a Product
**DELETE** `/api/v1/product/:id`

Deletes a product by its ID.

**Response:**
```json
{
  "status": "success",
  "data": null
}
```

## Product Schema

The product model includes the following fields:

- **title** (required): Product name (max 100 characters)
- **description** (required): Product description (max 500 characters)
- **category** (required): Product category (must be one of predefined categories)
- **price** (required): Product price (must be positive number)
- **imageUrl** (required): Product image URL (must be valid URL)
- **stock** (optional): Available stock quantity (default: 0)
- **isActive** (optional): Product availability (default: true)
- **rating** (optional): Average rating (0-5, default: 0)
- **numReviews** (optional): Number of reviews (default: 0)
- **tags** (optional): Array of product tags
- **specifications** (optional): Map of product specifications
- **createdAt** (auto): Creation timestamp
- **updatedAt** (auto): Last update timestamp

## Valid Categories

- Electronics
- Wearables
- Clothing
- Books
- Home & Garden
- Sports
- Beauty
- Toys
- Automotive
- Health
- Other

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Please provide an array of products"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "No product found with that ID"
}
```

## Testing

Use the provided `test-products.js` file to test the endpoints with sample data.

```bash
# Start the server
npm start

# Test the endpoints using the sample data
node test-products.js
```
