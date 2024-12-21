import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const EditKurir = () => {
  const { id } = useParams<{ id: string }>();

  const [kurir, setKurir] = useState({
    nama: "",
    user_name: "",
    no_hp: "",
    password: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/kurir/${id}`);
        const data = await response.json();
        if (response.ok) {
          setKurir({
            nama: data.nama,
            user_name: data.user_name,
            no_hp: data.no_hp,
            password: data.password,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed to fetch courier data",
            text: data.message || "Something went wrong",
          });
        }
      } catch (error) {
        console.error("Error fetching courier data:", error);
      }
    };
    fetchData();
  }, [id]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const data = {
      nama: kurir.nama,
      user_name: kurir.user_name,
      no_hp: kurir.no_hp,
      password: kurir.password,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/kurir/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const responseData = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: responseData.message,
        }).then(() => {
          window.location.href = "/kurir";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to update courier",
          text: responseData.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error updating courier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Edit Courier</h2>
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
            value={kurir.nama}
            name="kurirName"
            onChange={(e) => setKurir({ ...kurir, nama: e.target.value })}
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
            value={kurir.user_name}
            name="username"
            onChange={(e) => setKurir({ ...kurir, user_name: e.target.value })}
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
            value={kurir.no_hp}
            name="noHp"
            onChange={(e) => setKurir({ ...kurir, no_hp: e.target.value })}
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
            value={kurir.password}
            name="password"
            onChange={(e) => setKurir({ ...kurir, password: e.target.value })}
            placeholder="Enter password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          {isLoading ? "Updating..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default EditKurir;
