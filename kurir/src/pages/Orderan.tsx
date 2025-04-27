import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: number;
  user_name: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  user_address: string;
}

interface OrderData {
  [orderDate: string]: {
    [orderTime: string]: Order[];
  };
}

const Orderan: React.FC = () => {
  const [orderData, setOrderData] = useState<OrderData>({});
  const [, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const getCookie = (name: string) => {
          const value = `${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift();
        };

        const id_kurir = getCookie("kurir_id");
        if (!id_kurir) {
          setError("ID kurir tidak ditemukan di cookies.");
          return;
        }
        const response = await fetch(
          `http://localhost:5000/api/kurir/order/${id_kurir}`
        );
        if (response.ok) {
          const orders = await response.json();
          setOrderData(orders);
        } else {
          setError("Gagal mengambil data dari server.");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    fetchOrders();
  }, []);

  const handleOpenModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setPreviewImage(null);
    setSelectedOrderId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !selectedOrderId) return;

    const formData = new FormData();
    formData.append("image", selectedImage); // Sesuaikan dengan backend
    formData.append("order_id", selectedOrderId.toString()); // Tambahkan order_id

    try {
      const response = await fetch("http://localhost:5000/api/kurir/complete", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil mengunggah bukti",
          text: "Pesanan berhasil diselesaikan.",
        });
        handleCloseModal();
        window.location.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal mengunggah bukti",
          text: "Terjadi kesalahan, coba lagi nanti.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal mengunggah bukti",
        text: "Terjadi kesalahan, coba lagi nanti.",
      });
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {Object.keys(orderData).map((orderDate) => (
        <div key={orderDate} className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">{orderDate}</h2>
          {Object.keys(orderData[orderDate]).map((orderTime) => (
            <div key={orderTime}>
              <h3 className="text-lg font-medium mb-2">{orderTime}</h3>
              {orderData[orderDate][orderTime].map((order) => (
                <div
                  key={order.order_id}
                  className="p-4 border rounded-lg mb-4"
                >
                  <p>
                    <strong>Nama:</strong> {order.user_name}
                  </p>
                  <p>
                    <strong>Alamat:</strong> {order.user_address}
                  </p>
                  <button
                    onClick={() => handleOpenModal(order.order_id)}
                    className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-indigo-600 transition"
                  >
                    Selesaikan Pesanan
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <div className="bg-gray-100 min-h-screen p-8">
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-700">
                Upload Foto
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-100 transition">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full rounded-md shadow-md"
                    />
                  ) : (
                    <div className="text-gray-500">
                      Klik untuk mengunggah foto
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
      );
    </div>
  );
};

export default Orderan;
