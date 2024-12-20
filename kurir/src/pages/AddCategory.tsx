import React, { useState } from "react";
import Swal from "sweetalert2";

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const fetchData = async (): Promise<void> => {
      try {
        const response: Response = await fetch(
          "http://localhost:5000/api/categories/add",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ categoryName: categoryName }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.message === "Category already exists") {
            Swal.fire("Error", "Kategori Sudah ada di database", "error");
          } else {
            throw new Error("Failed to add category");
          }
        } else {
          const data = await response.json();
          Swal.fire("Success", data.message, "success");
          window.location.href = "/category";
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to add category", "error");
      }
    };
    fetchData();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Add Category</h2>
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
            value={categoryName}
            name="categoryName"
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
