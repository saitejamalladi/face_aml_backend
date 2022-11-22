module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "TodayScore",
    {
      country: {
        type: DataTypes.STRING,
      },
      platform: {
        type: DataTypes.STRING,
      },
      brand_name: {
        type: DataTypes.STRING,
      },
      product_type: {
        type: DataTypes.STRING,
      },
      seller_name: {
        type: DataTypes.STRING,
      },
      product_size: {
        type: DataTypes.STRING,
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
