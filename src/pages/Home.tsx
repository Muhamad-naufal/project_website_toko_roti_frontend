import React from "react";
import Jumbotron from "../components/Jumbotron"; // Pastikan Anda import komponen Jumbotron
import ProductList from "../components/ProductList"; // Import ProductList

const Home: React.FC = () => {
  return (
    <main>
      <Jumbotron />
      <div id="products">
        <ProductList />
      </div>
    </main>
  );
};

export default Home;
