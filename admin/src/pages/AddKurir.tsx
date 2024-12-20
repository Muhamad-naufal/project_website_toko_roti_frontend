import React, { useState } from "react";
import Swal from "sweetalert2";

const AddKurir = () => {
  const [kurirName, setKurirName] = useState("");
  const [username, setUsername] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const fetchData = async (): Promise<void> => {
      try {
        const response: Response = await fetch(
          "http://localhost:5000/api/kurir/add",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              kurirName,
              username,
              no_hp: noHp,
              password,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.message === "Kurir already exists") {
            Swal.fire("Error", "Kurir sudah ada di database", "error");
          } else {
            throw new Error("Failed to add courier");
          }
        } else {
          const data = await response.json();
          Swal.fire("Success", data.message, "success");
          window.location.href = "/kurir";
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to add courier", "error");
      }
    };
    fetchData();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Add Courier</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="kurirName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nama Kurir
          </label>
          <input
            type="text"
            id="kurirName"
            value={kurirName}
            name="kurirName"
            onChange={(e) => setKurirName(e.target.value)}
            placeholder="Enter courier name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            name="username"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="noHp"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nomor HP
          </label>
          <input
            type="text"
            id="noHp"
            value={noHp}
            name="noHp"
            onChange={(e) => setNoHp(e.target.value)}
            placeholder="Enter phone number"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
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

export default AddKurir;
