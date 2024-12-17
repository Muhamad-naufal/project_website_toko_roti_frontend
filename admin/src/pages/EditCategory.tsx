import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const EditCategory = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState({
    nama_category: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/categories/${id}`
        );
        const data = await response.json();
        if (response.ok) {
          setCategory({
            nama_category: data.nama_category,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed to fetch category data",
            text: data.message || "Something went wrong",
          });
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };
    fetchData();
  }, [id]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!category.nama_category) {
      alert("Category name is required!");
      return;
    }

    setIsLoading(true);

    const data = {
      nama_category: category.nama_category,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/categories/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Category updated successfully!",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.href = "/category"; // Redirect after success
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to update category",
          text: result.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Edit Category</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="categoryName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category Name:
          </label>
          <input
            type="text"
            id="categoryName"
            value={category.nama_category}
            name="categoryName"
            onChange={(e) =>
              setCategory({ ...category, nama_category: e.target.value })
            }
            placeholder="Enter category name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default EditCategory;
