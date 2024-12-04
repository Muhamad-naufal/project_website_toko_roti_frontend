import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import SingleProduct from "./pages/SingleProduct";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element=<Home /> />
        <Route path="/product/:id" element=<SingleProduct /> />
        <Route path="/cart" element=<Cart /> />
        <Route path="/login" element=<Login /> />
        <Route path="/register" element=<Register /> />
        <Route path="*" element=<NotFound /> />
        <Route path="/about" element=<About /> />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
