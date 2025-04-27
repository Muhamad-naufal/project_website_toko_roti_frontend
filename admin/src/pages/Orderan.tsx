import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type OrderItem = {
  product_name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  user_name: string;
  totalPrice: number;
  items: OrderItem[];
  status: string;
  id_kurir: number;
  created_at: string;
};

const Orderan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>({});
  const [statusOptions] = useState(["Pending", "Proccess", "Delivered"]);
  const [couriers, setCouriers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/kurir");
        if (response.ok) {
          const couriersData = await response.json();
          setCouriers(couriersData);
        } else {
          setError("Gagal mengambil data kurir dari server.");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    fetchCouriers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/order");
        if (response.ok) {
          const orders = await response.json();
          console.log("Fetched orders:", orders);

          if (Array.isArray(orders)) {
            orders.sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );

            const grouped = orders.reduce(
              (acc: Record<string, Record<string, any[]>>, order: any) => {
                const date = new Intl.DateTimeFormat("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }).format(new Date(order.created_at));

                const time = new Intl.DateTimeFormat("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).format(new Date(order.created_at));

                if (!acc[date]) {
                  acc[date] = {};
                }

                if (!acc[date][time]) {
                  acc[date][time] = [];
                }

                acc[date][time].push(order);
                return acc;
              },
              {}
            );

            setOrderData(grouped);
          } else {
            setError("Data tidak valid: Orders is not an array.");
          }
        } else {
          setError("Gagal mengambil data dari server.");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (newStatus === "Delivered") {
      // Cek apakah ada kurir yang belum bertugas dan statusnya bukan "Completed"
      const availableCouriers = couriers.filter((courier) => {
        const isAssigned = Object.keys(orderData).some((dateKey) =>
          Object.keys(orderData[dateKey]).some((timeKey) =>
            orderData[dateKey][timeKey].some(
              (order: any) =>
                order.id_kurir === courier.id && order.status === "Delivered"
            )
          )
        );

        return !isAssigned && courier.status !== "Completed";
      });

      if (availableCouriers.length === 0) {
        availableCouriers.push(
          ...couriers.filter((courier) => courier.status === "Completed")
        );

        availableCouriers.sort((a, b) => a.id - b.id);
      } else {
        availableCouriers.sort((a, b) => {
          const aAssigned = Object.keys(orderData).some((dateKey) =>
            Object.keys(orderData[dateKey]).some((timeKey) =>
              orderData[dateKey][timeKey].some(
                (order: any) => order.id_kurir === a.id
              )
            )
          );

          const bAssigned = Object.keys(orderData).some((dateKey) =>
            Object.keys(orderData[dateKey]).some((timeKey) =>
              orderData[dateKey][timeKey].some(
                (order: any) => order.id_kurir === b.id
              )
            )
          );

          if (!aAssigned && bAssigned) return -1;
          if (aAssigned && !bAssigned) return 1;

          return a.id - b.id;
        });
      }

      const prioritizedCourier = availableCouriers[0];

      if (prioritizedCourier) {
        const order = Object.keys(orderData).flatMap((dateKey) =>
          Object.keys(orderData[dateKey]).flatMap((timeKey) =>
            orderData[dateKey][timeKey].filter(
              (order: any) => order.id === orderId
            )
          )
        )[0];

        if (order) {
          handlePrint(
            order,
            new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(new Date(order.created_at)),
            new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }).format(new Date(order.created_at))
          );

          try {
            const response = await fetch(
              `http://localhost:5000/api/orders/${orderId}/status`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: newStatus,
                  id_kurir: prioritizedCourier.id,
                }),
              }
            );

            if (response.ok) {
              const updatedOrder = await response.json();
              console.log("Order updated successfully:", updatedOrder);

              setOrderData((prev: Record<string, Record<string, any[]>>) => {
                const newData = { ...prev };
                Object.keys(newData).forEach((dateKey) => {
                  Object.keys(newData[dateKey]).forEach((timeKey) => {
                    newData[dateKey][timeKey] = newData[dateKey][timeKey].map(
                      (order) =>
                        order.id === orderId
                          ? {
                              ...order,
                              status: newStatus,
                              id_kurir: prioritizedCourier.id,
                            }
                          : order
                    );
                  });
                });
                return newData;
              });
            } else {
              const errorData = await response.json();
              console.error("Gagal memperbarui status:", errorData);
            }
          } catch (error) {
            console.error("Error:", error);
          }
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Tidak ada kurir tersedia",
          text: "Tidak ada kurir yang tersedia untuk mengantarkan pesanan ini.",
        });
      }
    } else {
      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/${orderId}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (response.ok) {
          const updatedOrder = await response.json();
          console.log("Order updated successfully:", updatedOrder);

          setOrderData((prev: Record<string, Record<string, any[]>>) => {
            const newData = { ...prev };
            Object.keys(newData).forEach((dateKey) => {
              Object.keys(newData[dateKey]).forEach((timeKey) => {
                newData[dateKey][timeKey] = newData[dateKey][timeKey].map(
                  (order) =>
                    order.id === orderId
                      ? { ...order, status: newStatus }
                      : order
                );
              });
            });
            return newData;
          });
        } else {
          const errorData = await response.json();
          console.error("Gagal memperbarui status:", errorData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handlePrint = (order: Order, orderDate: string, orderTime: string) => {
    const printContent = document.getElementById(`order-${order.id}`);

    if (printContent) {
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write("<html><head><title>Print</title>");
        // Add styles to match the order display
        printWindow.document.write(`
  <style>
    @media print {
      body {
        margin: 0;
        padding: 0;
        font-family: "Courier New", monospace;
        width: 80mm; /* Ukuran kertas struk */
        height: auto;
        box-sizing: border-box;
      }

      .printable {
        width: 100%;
        height: auto;
        padding: 10px;
        font-size: 12px;
        white-space: nowrap;
        text-align: left;
        border: 1px solid #ccc; /* Border seperti kartu */
      }

      .printable hr {
        border: 0;
        border-top: 1px dashed #ccc;
        margin: 10px 0;
      }

      .printable h1,
      .printable h2,
      .printable p {
        margin: 0;
        padding: 0;
      }

      .printable .order-header {
        text-align: center;
        margin-bottom: 10px;
      }

      .printable .order-details {
        margin-top: 10px;
      }

      .printable .order-total {
        font-weight: bold;
        margin-top: 10px;
      }

      .printable .status {
        margin-top: 15px;
      }

      .printable .item {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
      }

      .printable .footer {
        text-align: center;
        margin-top: 20px;
      }

      /* Sembunyikan tombol print saat mencetak */
      button {
        display: none;
      }
    }
  </style>
`);

        printWindow.document.write("</head><body>");
        // Add content for printing
        printWindow.document.write(`
        <div class="printable">
          <div class="order-header">
        <h1 class="font-bold">Restoran XYZ</h1>
        <p class="text-sm">Tanggal: ${orderDate}</p>
        <p class="text-sm">Waktu: ${orderTime}</p>
          </div>
          <hr />

          <div>
        <p>Kasir: Admin</p>
        <p>Pelanggan: ${order.user_name}</p>
          </div>
          <hr />

          <div class="order-details">
        <h2 class="font-bold">Detail Pesanan:</h2>
        <ul>
          ${order.items
            .map(
              (item) => `
            <li class="item">
              <span class="item-name">${item.product_name}</span>
              <span class="item-quantity">x${item.quantity}</span>
              <span class="item-price">Rp ${item.price.toLocaleString(
                "id-ID"
              )}</span>
            </li>
          `
            )
            .join("")}
        </ul>
          </div>
          <hr />

          <div class="order-total">
        <p>Total: Rp ${order.totalPrice.toLocaleString("id-ID")}</p>
          </div>
          <hr />

          <div class="status">
        <p><span class="font-bold">Kurir:</span> ${
          couriers.find((c) => c.id === order.id_kurir)
            ? couriers.find((c) => c.id === order.id_kurir).nama
            : "-"
        }</p>
        <p><span class="font-bold">Status:</span> ${order.status}</p>
          </div>
        </div>
      `);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
      }
    } else {
      alert("Struk tidak ditemukan!");
    }
  };

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg">
      <motion.h1
        className="text-4xl font-extrabold text-gray-800 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Orderan
      </motion.h1>
      <div className="p-4 bg-gray-50">
        {Object.keys(orderData).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(orderData).map((orderDate) =>
              Object.keys(orderData[orderDate]).map((orderTime) =>
                orderData[orderDate][orderTime]
                  .sort((a: Order, b: Order) => {
                    if (a.status === "Delivered" && b.status !== "Delivered") {
                      return 1;
                    }
                    if (a.status !== "Delivered" && b.status === "Delivered") {
                      return -1;
                    }
                    return 0;
                  })
                  .map((order: Order) => (
                    <div
                      key={`order-${order.id}`}
                      id={`order-${order.id}`} // ID unik untuk setiap order
                      className="p-4 bg-white border border-gray-300 rounded-lg shadow-md font-mono space-y-2"
                    >
                      {/* Header */}
                      <div className="text-center">
                        <h1 className="text-lg font-bold">Restoran XYZ</h1>
                        <p className="text-sm">Tanggal: {orderDate}</p>
                        <p className="text-sm">Waktu: {orderTime}</p>
                      </div>
                      <hr className="border-gray-300" />

                      {/* Info Pesanan */}
                      <div>
                        <p>Kasir: Admin</p>
                        <p>Pelanggan: {order.user_name}</p>
                      </div>
                      <hr className="border-gray-300" />

                      {/* Detail Pesanan */}
                      <div>
                        <h2 className="font-bold text-sm">Detail Pesanan:</h2>
                        <ul>
                          {order.items.map((item, index) => (
                            <li
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span>{item.product_name}</span>
                              <span>x{item.quantity}</span>
                              <span>
                                Rp {item.price.toLocaleString("id-ID")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <hr className="border-gray-300" />

                      {/* Total Harga */}
                      <div className="flex justify-between text-sm font-bold">
                        <span>Total:</span>
                        <span>
                          Rp {order.totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <hr className="border-gray-300" />

                      {/* Status Pesanan */}
                      <div className="text-sm">
                        <p>
                          <span className="font-bold">Kurir:</span>{" "}
                          {couriers.find((c) => c.id === order.id_kurir)
                            ? couriers.find((c) => c.id === order.id_kurir).nama
                            : "-"}
                        </p>
                        <div className="flex justify-between">
                          <p>
                            <span className="font-bold">Status:</span>{" "}
                            {order.status === "Delivered" ? (
                              <span>{order.status}</span> // Tampilkan status sebagai teks biasa
                            ) : (
                              <select
                                className="border border-gray-300 rounded px-2 py-1"
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusChange(order.id, e.target.value)
                                }
                              >
                                {statusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select> // Tampilkan dropdown untuk status lainnya
                            )}
                          </p>
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={() =>
                              handlePrint(order, orderDate, orderTime)
                            }
                          >
                            Print
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Tidak ada data order ditemukan.
          </p>
        )}
      </div>
    </div>
  );
};

export default Orderan;
