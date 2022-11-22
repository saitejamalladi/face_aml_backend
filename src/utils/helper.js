const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");
const moment = require("moment");
const { COLOR_PALETTE } = require("../utils/colorPalette");
exports.filterQueryBuilder = (query, filter) => {
  const country = filter?.country;
  const platform = filter?.platform;
  const storeName = filter?.seller_name;
  const brand = filter?.brand_name;
  const type = filter?.product_type;
  const size = filter?.product_size;
  const timeperiod = filter?.timeperiod;
  const frequency_bucket = filter?.frequency_bucket;

  // brand array  replace  each item ' with ''' for sql query
  const brandName = brand?.map((item) => item.replace(/'/g, "''"));
  const storeNameName = storeName?.map((item) => item.replace(/'/g, "''"));

  if (country && country.length > 0) {
    query += ` and country in ('${country.join("','")}')`;
  }
  if (platform && platform.length > 0) {
    query += ` and platform in ('${platform.join("','")}')`;
  }
  if (storeName && storeName.length > 0) {
    query += ` and seller_name in ('${storeNameName.join("','")}')`;
  }
  if (brand && brand.length > 0) {
    query += ` and brand_name in ('${brandName.join("','")}')`;
  }
  if (type && type.length > 0) {
    query += ` and product_type in ('${type.join("','")}')`;
  }
  if (size && size.length > 0) {
    query += ` and product_size in ('${size.join("','")}')`;
  }
  if (frequency_bucket) {
    query += ` and frequency_bucket in ('${frequency_bucket.toLowerCase()}')`;
  }
  if (timeperiod) {
    query += ` and timeperiod >= ${timeperiod._gte} and timeperiod <= ${timeperiod._lte} `;
  }
  return query;
};

exports.getDatabaseQueryResultPromise = (query, model) => {
  if (model) {
    return sequelize.query(query, {
      mapToModel: true,
      model: model,
    });
  }
  return sequelize.query(query, {
    type: QueryTypes.SELECT,
  });
};

//mapping data between list and graph data points
exports.getLabels = (frequencyBucket, timeperiods, date) => {
  if (frequencyBucket === "monthly") {
    return timeperiods.map((timeperiod) =>
      moment(date)
        .subtract(timeperiod - 1, "months")
        .format("MMM YYYY")
    );
  } else if (frequencyBucket?.toLowerCase() === "weekly") {
    return timeperiods.map((timeperiod) =>
      moment(date)
        .startOf("week")
        .add(1, "days")
        .subtract(7 * timeperiod, "days")
        .format("MMM DD")
    );
  } else {
    return timeperiods.map((timeperiod) =>
      moment(date)
        .subtract(timeperiod - 1, "days")
        .format("DD MMM YY")
    );
  }
};

//Function to get the random color
exports.randomColor = (key) => {
  try {
    return (
      COLOR_PALETTE[key?.toUpperCase()] ||
      "#" + Math.random().toString(16).substr(2, 6)
    );
  } catch (error) {
    console.log(error);
    return "#000000";
  }
};
