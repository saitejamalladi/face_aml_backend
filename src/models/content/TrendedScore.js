module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "TrendedScore",
    {
      timeperiod: {
        type: DataTypes.INTEGER,
        get() {
          return parseInt(this.getDataValue("timeperiod"));
        },
      },
      frequency_bucket: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      excellent_sku_count: {
        type: DataTypes.INTEGER,
        get() {
          return parseInt(this.getDataValue("excellent_sku_count"));
        },
      },
      good_sku_count: {
        type: DataTypes.INTEGER,
        get() {
          return parseInt(this.getDataValue("good_sku_count"));
        },
      },
      to_be_improved_sku_count: {
        type: DataTypes.INTEGER,
        get() {
          return parseInt(this.getDataValue("to_be_improved_sku_count"));
        },
      },
    },
    {}
  );
};
