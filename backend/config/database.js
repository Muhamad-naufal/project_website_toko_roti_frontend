import { Sequelize } from "sequelize";
// Koneksi ke MySQL
const sequelize = new Sequelize("toko_roti_1", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false, // Matikan log jika tidak diperlukan
});

export default sequelize;
