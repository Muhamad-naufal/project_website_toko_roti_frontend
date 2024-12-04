import React from "react";
import Jumbotron from "../components/Jumbotron"; // Pastikan Anda import komponen Jumbotron
import ProductList from "../components/ProductList"; // Import ProductList

// Contoh data produk
const products = [
  {
    id: 1,
    name: "Roti Manis",
    description: "Roti manis dengan isian coklat lezat.",
    price: 15000,
    imageUrl:
      "https://th.bing.com/th/id/OIP.azWuGLqwpmjyftGTrmN4KgHaE7?rs=1&pid=ImgDetMain", // Ganti dengan URL gambar produk
  },
  {
    id: 2,
    name: "Roti Tawar",
    description: "Roti tawar lembut dan empuk.",
    price: 12000,
    imageUrl:
      "https://s2.bukalapak.com/uploads/content_attachment/7bc16140a62ae17b54a9acb5/original/resep_roti_bakar_1.jpg", // Ganti dengan URL gambar produk
  },
  {
    id: 3,
    name: "Croissant",
    description: "Croissant renyah dengan isian mentega.",
    price: 25000,
    imageUrl:
      "https://tukangreview.com/wp-content/uploads/2021/09/rotimeseskeju.jpg", // Ganti dengan URL gambar produk
  },
  {
    id: 4,
    name: "Bagel",
    description: "Bagel dengan taburan wijen di atasnya.",
    price: 20000,
    imageUrl:
      "https://i0.wp.com/www.tokomesin.com/wp-content/uploads/2017/10/Inilah-Cara-Membuat-Roti-Bagel-Yang-Bisa-Anda-Coba.jpg?w=663&ssl=1",
  },
  {
    id: 5,
    name: "Donat",
    description: "Donat empuk dengan taburan gula halus.",
    price: 10000,
    imageUrl:
      "https://img-global.cpcdn.com/recipes/4c7458364a916931/680x482cq70/donat-roti-empuk-dan-gurih-foto-resep-utama.jpg",
  },
  {
    id: 6,
    name: "Roti Gandum",
    description: "Roti gandum sehat dan bergizi.",
    price: 18000,
    imageUrl:
      "https://img.okezone.com/content/2017/02/21/298/1623840/selain-roti-tawar-ini-loh-4-jenis-roti-yang-paling-sering-dikonsumsi-masyarakat-indonesia-u3Mihn3ZBk.jpg",
  },
  {
    id: 7,
    name: "Roti Sosis",
    description: "Roti dengan isian sosis lezat.",
    price: 22000,
    imageUrl:
      "https://www.langsungenak.com/wp-content/uploads/2021/01/cara-membuat-roti-sosis-by-Hery-Kurniati.jpg",
  },
  {
    id: 8,
    name: "Roti Keju",
    description: "Roti dengan isian keju meleleh.",
    price: 24000,
    imageUrl:
      "https://img-global.cpcdn.com/recipes/c7f35b512aa67579/680x482cq70/roti-isi-keju-foto-resep-utama.jpg",
  },
  {
    id: 9,
    name: "Roti Pisang",
    description: "Roti dengan isian pisang manis.",
    price: 20000,
    imageUrl:
      "https://www.rukita.co/stories/wp-content/uploads/2022/03/resep-roti-pisang.jpg",
  },
  {
    id: 10,
    name: "Roti Kismis",
    description: "Roti dengan taburan kismis di dalamnya.",
    price: 21000,
    imageUrl:
      "https://th.bing.com/th/id/OIP.xi6Z4GzHL8MsmGr_tkC3hgHaHa?rs=1&pid=ImgDetMain",
  },
  // Tambahkan produk lainnya sesuai kebutuhan
];

const Home: React.FC = () => {
  return (
    <main>
      <Jumbotron />
      <div id="products">
        <ProductList products={products} />
      </div>
    </main>
  );
};

export default Home;
