const response = require("../utils/response");

const {
  filterQueryBuilder,
  getDatabaseQueryResultPromise,
  getLabels,
  randomColor,
} = require("../utils/helper");

class RatingsService {
  async averageRatings(schema, requestBody) {
    try {
      let activeFilterValue = requestBody?.activeFilter?.value;

      //Build the query
      let query = `SELECT avg(average_rating) as average_rating, ${activeFilterValue} from ${schema}.ratings_product_overview where 1=1`;
      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query += ` GROUP BY ${activeFilterValue} order by ${activeFilterValue}`;

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      //Transform the results and return the response
      let results = await Promise.all([result]);

      return results[0].map((item) => {
        return {
          heading: item[activeFilterValue],
          description: "Average Ratings",
          value: item["average_rating"],
          isRating: true,
        };
      });
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async averageReviews(schema, requestBody) {
    try {
      let activeFilterValue = requestBody?.activeFilter?.value;

      //Build the query
      let query = `SELECT avg(total_reviews) as average_reviews, ${activeFilterValue} from ${schema}.reviews_product_overview where 1=1`;
      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query += ` GROUP BY ${activeFilterValue} order by ${activeFilterValue}`;

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      //Transform the results and return the response
      let results = await Promise.all([result]);

      return results[0].map((item) => {
        return {
          heading: item[activeFilterValue],
          description: "Avg # of reviews per product",
          value: item["average_reviews"],
          isRating: true,
        };
      });
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async trendedRatings(schema, requestBody) {
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
      let query = `SELECT timeperiod, avg(average_rating) as average_rating, ${activeFilterValue} from ${schema}.ratings_product where 1=1`;
      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query += ` GROUP BY timeperiod, ${activeFilterValue} ORDER BY timeperiod desc`;

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      //Transform the results
      let results = await Promise.all([result]);

      let mainTitle = "Trended Product Ratings";
      let colTitle = [];
      colTitle.push(activeFilterType);
      colTitle.push("Product Ratings");

      let [chartData, labels] = this.AverageProductRatingsLCTransformer(
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
  AverageProductRatingsLCTransformer = (
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
      "average_rating"
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

  async totalRatings(schema, requestBody) {
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
      let query = `SELECT timeperiod, sum(total_rating) as total_rating, ${activeFilterValue} from ${schema}.ratings_product where 1=1`;
      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query += ` GROUP BY timeperiod, ${activeFilterValue} ORDER BY timeperiod desc`;

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      //Transform the results
      let results = await Promise.all([result]);

      let mainTitle = "Trended Product Ratings";
      let colTitle = [];
      colTitle.push(activeFilterType);
      colTitle.push("Number of Ratings");

      let [chartData, labels] = this.TotalProductRatingsLCTransformer(
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
  TotalProductRatingsLCTransformer = (
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
      "total_rating"
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

  async totalReviews(schema, requestBody) {
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
      let query = `SELECT timeperiod, sum(total_review) as total_review, ${activeFilterValue} from ${schema}.reviews_trended_product where 1=1`;
      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query += ` GROUP BY timeperiod, ${activeFilterValue} ORDER BY timeperiod desc`;

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      //Transform the results
      let results = await Promise.all([result]);

      let mainTitle = "Trended Product Reviews";
      let colTitle = [];
      colTitle.push(activeFilterType);
      colTitle.push("Number of Reviews");

      let [chartData, labels] = this.TotalProductReviewsLCTransformer(
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

  TotalProductReviewsLCTransformer = (
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
      "total_review"
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
}
module.exports = new RatingsService();
