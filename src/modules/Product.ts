// src/modules/product.ts

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string;
  description: string;
}

// Function to fetch a product by ID
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetch(`http://localhost:5000/api/products/${id}`);
    const data = await response.json();

    if (response.ok) {
      return data; // Return the product data
    } else {
      console.error("Error fetching product:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

// Function to fetch products by category
export const fetchProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  try {
    const response = await fetch("http://localhost:5000/api/products");
    const data = await response.json();

    if (response.ok) {
      // Filter the products based on the category
      return data.filter((product: Product) => product.category === category);
    } else {
      console.error("Error fetching products:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
