import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const EditProduct = ({
  categories: initialCategories,
}: {
  categories: { id: string; nama_category: string }[];
}) => {
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<
    { id: string; nama_category: string }[]
  >(initialCategories || []); // Initialize categories to an empty array if undefined

  const [product, setProduct] = useState({
    id: id,
    name: "", // Default to empty string instead of undefined
    nama_category: "", // Default to empty string instead of undefined
    description: "", // Default to empty string instead of undefined
    price: "", // Default to empty string instead of undefined
    stock: "", // Default to empty string instead of undefined
    category_id: "", // Default to empty string instead of undefined
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/categories`);
        const data = await response.json();
        console.log("Categories API Response:", data);

        setCategories(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );
        const data = await response.json();
        if (response.ok) {
          setProduct({
            id: data.id,
            name: data.name || "", // Ensure it's never undefined
            nama_category: data.nama_category || "", // Ensure it's never undefined
            description: data.description || "", // Ensure it's never undefined
            price: data.price || "", // Ensure it's never undefined
            stock: data.stock || "", // Ensure it's never undefined
            category_id: data.category_id || "", // Ensure it's never undefined
          });
          if (data.image) {
            setPreview(data.image); // Assuming the API returns the image URL
          }
        } else {
          console.error("Failed to fetch product data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("category", product.category_id);
    if (image) formData.append("image", image);

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/update/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Product updated successfully!",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to update product",
          text: result.message,
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Product Image
          </label>
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                setImage(file);
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImage(file);
                  const reader = new FileReader();
                  reader.onload = () => setPreview(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {!preview ? (
              <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16l4-4m0 0l4 4m-4-4v12m12-12l4 4m-4-4l-4 4m4-4V4M7 4h10"
                  />
                </svg>
                <p className="text-sm text-center">
                  Drag & Drop an image here, or click to select
                </p>
              </div>
            ) : (
              <motion.div
                className="w-full h-48 flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden shadow-inner"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={(e) =>
              setProduct((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Description
          </label>
          <textarea
            name="description"
            value={product.description}
            onChange={(e) =>
              setProduct((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          ></textarea>
        </div>

        {/* Product Price and Stock */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={(e) =>
                setProduct((prev) => ({ ...prev, price: e.target.value }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={(e) =>
                setProduct((prev) => ({ ...prev, stock: e.target.value }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={product.category_id}
            onChange={(e) =>
              setProduct((prev) => ({ ...prev, category_id: e.target.value }))
            }
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nama_category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg focus:outline-none focus:ring focus:ring-blue-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditProduct;
