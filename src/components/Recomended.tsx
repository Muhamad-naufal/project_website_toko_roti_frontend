import ProductList from "./ProductList";

const Recomended = () => {
  return (
    <div>
      <h2 className="text-4xl font-bold text-center mt-12 mb-12">
        Rekomendasi Produk
      </h2>
      <div className="products">
        <ProductList />
      </div>
    </div>
  );
};

export default Recomended;
