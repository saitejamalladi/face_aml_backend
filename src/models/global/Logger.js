module.exports = function (sequelize, DataTypes) {
  return sequelize.define("Logger", {
    id: {
      autoIncrement: true,
      field: "id",
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    load_date: {
      field: "load_date",
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      field: "updated_at",
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
};
