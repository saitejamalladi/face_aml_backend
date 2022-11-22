const response = require("../utils/response");

const {
  filterQueryBuilder,
  getDatabaseQueryResultPromise,
  randomColor,
  getLabels,
} = require("../utils/helper");

class PriceService {
  async averageDiscount(schema, requestBody) {
    try {
      let selectedPlatforms = requestBody?.selectedPlatforms;
      const templateObject = {
        heading: "",
        description: "Average Discount",
        value: 0,
        color: "",
      };

      //Build the query
      let query1 = `SELECT platform, round(cast(sum(discount_sum) as numeric), 2) as discount_sum,
                           round(cast(sum(sku_count) as numeric), 2) as sku_count from ${schema}.price_promo_summary where 1=1`;

      //Apply the filters
      query1 = filterQueryBuilder(query1, requestBody);
      query1 += ` GROUP BY platform order by platform`;

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query1);

      //Transform the results and return the response
      let results = await Promise.all([result]);

      const processedObjects = selectedPlatforms.map((platform) => {
        let currentPlatform = results[0].find(
          (item) => item.platform === platform
        );
        const template = { ...templateObject };
        template.heading = platform;
        if (currentPlatform)
          template.value =
            currentPlatform.discount_sum / currentPlatform.sku_count;
        template.color = randomColor(platform);
        return template;
      });

      let overallAvg = 0;
      if (processedObjects.length > 0)
        overallAvg =
          processedObjects.reduce((total, item) => total + item.value, 0) /
          processedObjects.length;

      const overallDiscountObject = [
        {
          heading: "overall",
          description: "Overall Discount",
          value: overallAvg,
          color: "#4f62aa",
        },
      ];
      return [...overallDiscountObject, ...processedObjects];
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async productsOnPromo(schema, requestBody) {
    try {
      //Build the query
      let query1 = `select as_of_date, count(sku) from ${schema}.price_promo_products ppp where 1=1`;

      //Apply the filters
      query1 = filterQueryBuilder(query1, requestBody);
      query1 += ` and discount_applied is true group by as_of_date order by as_of_date asc`;

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query1);

      //Transform the results and return the response
      let results = await Promise.all([result]);

      return results[0];
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }
  async assortmentDiscount(schema, requestBody) {
    try {
      //Build the query
      let query1 = `select as_of_date, 
        round(100 * cast(sum(case when discount_applied is true then 1 else 0 end) as decimal) / count(sku), 2) as count 
        from ${schema}.price_promo_products ppp where 1=1`;

      //Apply the filters
      query1 = filterQueryBuilder(query1, requestBody);
      query1 += ` group by as_of_date order by as_of_date asc`;

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query1);

      //Transform the results and return the response
      let results = await Promise.all([result]);

      return results[0];
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async trendedPromoPrice(schema, requestBody) {
    try {
      let responseObject = {
        labels: [],
        datasets: [],
      };
      let activeFilterType = requestBody?.activeFilter?.type;
      let activeFilterValue = requestBody?.activeFilter?.value;
      let frequency_bucket = requestBody?.frequency_bucket;
      let loadTime = requestBody?.loadTime;

      //Build the query
      let query = `SELECT timeperiod, sum(discounted_price_sum) /sum(sku_count) as avg_discount, ${activeFilterValue} from ${schema}.price_promo_trended where 1=1`;
      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query += ` GROUP BY timeperiod, ${activeFilterValue} ORDER BY timeperiod desc`;

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      //Transform the results
      let results = await Promise.all([result]);

      let mainTitle = "Trended Promo Price";
      let colTitle = [];
      colTitle.push(activeFilterType);
      colTitle.push("Product Price");

      let [chartData, labels] = this.trendedPromoPriceTransformer(
        mainTitle,
        colTitle,
        results[0],
        activeFilterValue
      );

      responseObject.labels = getLabels(frequency_bucket, labels, loadTime);
      responseObject.datasets = [...chartData];

      //Return the response.
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }
  trendedPromoPriceTransformer = (
    mainTitle,
    colTitle,
    result,
    activeFilterValue
  ) => {
    const templateObject = {
      label: "",
      fill: false,
      borderWidth: 3,
      hoverBorderWidth: 3,
      mainTitle: mainTitle,
      colTitle: colTitle,
      data: [],
    };

    let timeperiods = [...new Set(result.map((item) => item.timeperiod))].sort(
      (a, b) => b - a
    );
    const filterItemsAvgGrouped = this.lineGroupBy(
      timeperiods,
      result,
      activeFilterValue,
      "avg_discount"
    );

    const data = filterItemsAvgGrouped.map((item) => {
      const template = { ...templateObject };
      template.label = item.key;
      template.data = item.value;
      template.borderColor = randomColor(item.key);
      return template;
    });
    return [data, timeperiods];
  };
  lineGroupBy = (timeperiods, array, key, filter) => {
    let distinctValues = [...new Set(array.map((item) => item[key]))];
    return distinctValues.map((distinctValue) => {
      let value = timeperiods.map((timeperiod) => {
        let currObj = array.find(
          (item) =>
            item.timeperiod === timeperiod && item[key] === distinctValue
        );
        return currObj ? currObj[filter] : 0;
      });
      return {
        key: distinctValue,
        value: value,
      };
    });
  };

  async trendedPromoPricePerSpecificProduct(schema, requestBody) {
    try {
      //Build the query
      let query = `SELECT brand_name, product_name, sku, timeperiod, seller_name, discounted_price_sum, sku_count,
                          pack_count from ${schema}.price_promo_trended_per_product_uom where 1=1`;
      //Apply the filters
      query = filterQueryBuilder(query, requestBody);

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      //Transform the results and return the results
      let results = await Promise.all([result]);

      return results[0];
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }
  async detailedPrice(schema, requestBody) {
    try {
      //Build the query
      let query = `SELECT timeperiod, product_name, avg_price, original_price, avg_product_pack_size 
        from ${schema}.price_promo_min_max_avg_comparison where 1=1`;
      //Apply the filters
      query = filterQueryBuilder(query, requestBody);

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      //Transform the results and return the results
      let results = await Promise.all([result]);

      return results[0];
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }
}
module.exports = new PriceService();
