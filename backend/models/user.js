import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Mendefinisikan model User
const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default User;
