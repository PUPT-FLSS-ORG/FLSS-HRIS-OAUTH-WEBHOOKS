// userRoleModel.js
const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");
const Role = require("./roleModel");

const UserRole = sequelize.define(
  "UserRole",
  {
    UserID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    RoleID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "user_roles",
    timestamps: false,
  }
);

UserRole.belongsTo(Role, {
  foreignKey: "RoleID",
  targetKey: "RoleID",
});

module.exports = UserRole;
