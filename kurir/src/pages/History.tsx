import { useEffect, useState } from "react";

const History = () => {
  interface HistoryItem {
    order_id: number;
    user_name: string;
    totalPrice: number;
    status: string;
    user_address: string;
  }

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift();
        };

        const id_kurir = getCookie("kurir_id"); // Ambil ID kurir dari cookies
        if (!id_kurir) {
          setError("ID kurir tidak ditemukan di cookies.");
          return;
        }
        const response = await fetch(
          `http://localhost:5000/api/kurir/history/${id_kurir}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Data fetched:", data); // Tambahkan ini
          setHistory(data);
        } else {
          setError("Gagal mengambil data dari server.");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      }
    };

    fetchHistory();
  }, []);

  const priceFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Order History</h1>
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded mb-4">{error}</div>
      )}
      {history.length === 0 && !error ? (
        <p className="text-gray-500">No order history available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item: HistoryItem) => (
            <div
              key={item.order_id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {item.user_name}
              </h2>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Total Price:</span>
                <span className="font-semibold">
                  {priceFormatter.format(item.totalPrice)}
                </span>
              </p>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`${
                    item.status === "completed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  } font-medium`}
                >
                  {item.status}
                </span>
              </p>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Address:</span>{" "}
                {item.user_address}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
