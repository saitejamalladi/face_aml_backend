const response = require("../utils/response");
const moment = require("moment");
const TrendedScore = require("../models/content").TrendedScore;
const TodayScore = require("../models/content").TodayScore;

const {
  filterQueryBuilder,
  getDatabaseQueryResultPromise,
  getLabels,
} = require("../utils/helper");

class ContentService {
  async getStoresTracked(schema, requestBody) {
    try {
      const responseObject = {
        totalStoresTracked: 0,
        averageContentScore: 0,
      };
      //Build the Query
      let query = `select count(distinct(seller_id)) from ${schema}.content_overview_detailed where timeperiod between  1 AND 7 `;
      let query2 = `select sum(content_score)/count(content_score) as agc  from ${schema}.content_product_level_trended_score  where  as_of_date > (select load_date from ${schema}.logger) - interval '7 days'`;
      let query3 = `select  platform,  brand_name, content_score, sku  from ${schema}.content_product_level_trended_score  where  as_of_date > (select load_date from ${schema}.logger) - interval '7 days'`;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query2 = filterQueryBuilder(query2, requestBody);
      query3 = filterQueryBuilder(query3, requestBody);

      //Fetch the results
      const storeCountResult = getDatabaseQueryResultPromise(query);
      const averageContentScoreResult = getDatabaseQueryResultPromise(query2);
      const chartDataResult = getDatabaseQueryResultPromise(query3);

      //Transform the results
      let results = await Promise.all([
        storeCountResult,
        averageContentScoreResult,
        chartDataResult,
      ]);
      responseObject.totalStoresTracked = results[0][0]?.count || 0;
      responseObject.averageContentScore = results[1][0]?.agc || 0;
      responseObject.donutChartData = this.getDonutChartData(results[2]);

      //Return the response.
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  getDonutChartData = (list) => {
    let platformList = list.filter((item) =>
      ["Lazada", "Shopee", "Amazon"].includes(item.platform)
    );
    let othersList = list.filter(
      (item) => !["Lazada", "Shopee", "Amazon"].includes(item.platform)
    );
    let platforms = [...new Set(platformList.map((item) => item.platform))];
    const graphData = [];
    platforms.forEach((platform) => {
      const result = platformList.filter((item) => item.platform === platform);
      const getData = this.getDataBasedOnPlatform(result, platform);
      graphData.push(getData);
    });
    if (othersList.length > 0) {
      const getDataForOtherPlatforms = this.getDataBasedOnPlatform(
        othersList,
        "others"
      );
      graphData.push(getDataForOtherPlatforms);
    }
    return graphData;
  };

  getDataBasedOnPlatform = (result, platform) => {
    const widgetData = {
      data: [],
      labels: ["Excellent", "Good", "To be Improved"],
      colors: ["#7C90DB", "#202C56", "#DC1A4C"],
      value: "",
      brand: "",
      showTooltip: false,
    };
    widgetData.value =
      this.getFieldScore(result, "content_score") / result.length;
    widgetData.brand = platform;
    let response = {
      excellent: [
        ...new Set(
          result
            .filter((item) => item.content_score >= 80)
            .map((item) => item.sku)
        ),
      ].length,
      good: [
        ...new Set(
          result
            .filter(
              (item) => item.content_score >= 60 && item.content_score < 80
            )
            .map((item) => item.sku)
        ),
      ].length,
      toBeImproved: [
        ...new Set(
          result
            .filter((item) => item.content_score < 60)
            .map((item) => item.sku)
        ),
      ].length,
    };
    Object.entries(response).forEach(([responseKey, responseValue]) => {
      widgetData.data.push(responseValue);
    });
    return widgetData;
  };

  //sum of specific field data from list
  getFieldScore = (list, field) => {
    return list.reduce(
      (val, item) => parseFloat(item[field]) + parseFloat(val),
      0
    );
  };

  brandContentItems = [
    {
      heading: "Excellent",
      value: "",
      color: "#7C90DB",
      field: "excellent",
    },
    {
      heading: "Good",
      value: "",
      color: "#202C56",
      field: "good",
    },
    {
      heading: "To be improved",
      value: "",
      color: "#DC1A4C",
      field: "tobeimproved",
    },
  ];

  async contentBrandSummary(schema, requestBody) {
    try {
      const responseObject = {
        brandContentItems: [],
      };

      //Build the query
      let query = `select
                               sum(to_be_improved_sku_count)/(sum(good_sku_count)+sum(excellent_sku_count)+sum(to_be_improved_sku_count)) *100 tobeimproved,
                               sum(good_sku_count)/(sum(good_sku_count)+sum(excellent_sku_count)+sum(to_be_improved_sku_count)) *100 good,
                               sum(excellent_sku_count)/(sum(good_sku_count)+sum(excellent_sku_count)+sum(to_be_improved_sku_count)) *100 excellent
                   from ${schema}.content_brand_summary where 1=1`;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      // db.getPool().query(query, (err, results) => {
      //   if (err) {
      //     throw err;
      //   }
      //   responseObject.brandContentItems = brandContentItems.map((item) => {
      //     item.value = results[0]?.[item.field] || 0;
      //     return item;
      //   });
      //
      //   return res.status(200).json(responseObject);
      // });

      //Transform the data
      let results = await Promise.all([result]);
      responseObject.brandContentItems = this.brandContentItems.map((item) => {
        item.value = results[0][0]?.[item.field] || 0;
        return item;
      });

      //Return the response.
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async cbsGraphData(schema, requestBody) {
    try {
      const responseObject = {
        brandContentItems: [],
      };
      //Build the query
      let query = `select brand_name,to_be_improved_sku_count,good_sku_count,excellent_sku_count from ${schema}.content_brand_summary where 1=1`;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);

      //Fetch the results
      const result = getDatabaseQueryResultPromise(query);

      //Transform the results
      let results = await Promise.all([result]);
      responseObject.graphList = this.getBarChartDataPoints(results[0]);

      //Return the response.
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async trendedScore(schema, requestBody) {
    try {
      let graphData = {
        labels: [],
        dataPoints: {
          excellent: [],
          good: [],
          toBeImproved: [],
        },
      };

      //Build the query
      let query = `select platform, country, product_size, brand_name, seller_name, product_type, excellent_sku_count, 
       good_sku_count, to_be_improved_sku_count, timeperiod, frequency_bucket from ${schema}.content_trended_score 
        where 1=1`;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);

      //Fetch the results and map to the model
      const list = await getDatabaseQueryResultPromise(query, TrendedScore);

      //Transform the data
      let mainTitle = "Content Score";
      let colTitle = ["Country", "To Be Improved", "Good", "Excellent"];
      const frequency_bucket = requestBody.frequency_bucket;
      let timeperiods = [...new Set(list.map((item) => item.timeperiod))].sort(
        (a, b) => b - a
      );
      graphData.labels = getLabels(
        frequency_bucket,
        [...timeperiods],
        requestBody.loadTime
      );
      const response = this.CalculatePercentageScore1(list, timeperiods);
      const mappedData = this.getHorizontalBarChartMappedData(
        mainTitle,
        colTitle,
        graphData,
        timeperiods,
        response
      );
      //Return the response.
      return { ...mappedData };
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  getBarChartDataPoints = (list) => {
    let graphData = {
      labels: [],
      dataPoints: {
        excellent: [],
        good: [],
        toBeImproved: [],
      },
    };
    let dataPointsObject = {
      excellent: "excellent_sku_count",
      good: "good_sku_count",
      toBeImproved: "to_be_improved_sku_count",
    };
    // TODO: this can be optimized by using a single query
    // get all brands from list
    const uniqueBrands = [...new Set(list.map((item) => item.brand_name))];
    let brandsAbsoluteCounts = uniqueBrands
      .map((brand) => {
        let currentBrandCount = list
          .filter((item) => item["brand_name"] === brand)
          .reduce(
            (total, item) =>
              total +
              item.excellent_sku_count +
              item.good_sku_count +
              item.to_be_improved_sku_count,
            0
          );
        return {
          brand: brand,
          count: currentBrandCount,
        };
      })
      .sort((a, b) => b.count - a.count)
      .map((item) => item.brand);
    graphData.labels = [...brandsAbsoluteCounts];
    brandsAbsoluteCounts?.forEach((brand) => {
      const dataBasedOnBrand = list.filter(
        (item) => item["brand_name"] === brand
      );
      const calculatedSkuScore = this.CalculatePercentageScore(
        dataBasedOnBrand,
        dataPointsObject,
        false
      );
      const result = this.getBarChartMappedData(graphData, calculatedSkuScore);
      graphData = { ...result };
    });
    let datapointsPercent = Object.keys(graphData.dataPoints).reduce(
      (result, currBrand) => {
        let skuPercent = graphData.dataPoints[currBrand].map(
          (excellent, index) => {
            let totalSKU = Object.keys(graphData.dataPoints).reduce(
              (total, key) => total + graphData.dataPoints[key][index],
              0
            );
            if (totalSKU) {
              return 100 * (graphData.dataPoints[currBrand][index] / totalSKU);
            }
            return 0;
          }
        );
        if (result[`${currBrand}Percent`]) {
          result[`${currBrand}Percent`] += skuPercent;
        } else {
          result[`${currBrand}Percent`] = skuPercent;
        }
        return result;
      },
      {}
    );
    let maxValue = Math.max(
      ...Object.keys(graphData.dataPoints).map((key) =>
        Math.max(...graphData.dataPoints[key])
      )
    );

    graphData.dataPoints = {
      ...graphData.dataPoints,
      ...datapointsPercent,
      mainTitle: "Brand Content Overview",
      colTitle: "Brand",
      maxValue: maxValue,
    };
    Object.entries(graphData.dataPoints).forEach(([key, value]) => {
      const indexOfZer0 = [];

      for (let i = 0; i < graphData.dataPoints.excellent.length; i++) {
        if (
          graphData.dataPoints.excellent[i] === 0 &&
          graphData.dataPoints.good[i] === 0 &&
          graphData.dataPoints.toBeImproved[i] === 0
        ) {
          indexOfZer0.push(i);
        }
      }
      graphData.labels = graphData.labels.filter((item, index) => {
        return !indexOfZer0.includes(index);
      });
    });

    return graphData;
  };

  CalculatePercentageScore = (data, obj, isPercentage) => {
    const objValue = {
      excellent: 0,
      good: 0,
      toBeImproved: 0,
    };
    //get array of each sku total
    Object.entries(obj).map(([key, value]) => {
      return data.reduce((val, item) => {
        const res = item[value] + val;
        objValue[key] = res;
        return res;
      }, 0);
    });
    // get total sku count
    const total = Object.entries(objValue).reduce(
      (initialVal, [key, value]) => value + initialVal,
      0
    );
    return isPercentage
      ? {
          excellent: percentageOfEachSku(objValue.excellent, total),
          good: percentageOfEachSku(objValue.good, total),
          toBeImproved: percentageOfEachSku(objValue.toBeImproved, total),
        }
      : {
          excellent: objValue.excellent,
          good: objValue.good,
          toBeImproved: objValue.toBeImproved,
        };
  };

  percentageOfEachSku = (val, total) => {
    return ((val / total) * 100).toFixed(1);
  };

  //mapping data between list and graph data points
  getBarChartMappedData = (graphData, response) => {
    Object.entries(graphData.dataPoints).forEach(
      ([barGraphKey, barGraphValue]) => {
        Object.entries(response).forEach(
          ([averageDataKey, averageDataValue]) => {
            if (barGraphKey === averageDataKey) {
              graphData.dataPoints[barGraphKey].push(averageDataValue);
            }
          }
        );
      }
    );
    return graphData;
  };

  CalculatePercentageScore1 = (data, timeperiods) => {
    return timeperiods.map((timeperiod) => {
      let currentTimePeriodData = data.filter(
        (item) => item.timeperiod === timeperiod
      );
      return {
        timeperiod: timeperiod,
        excellent: currentTimePeriodData.reduce(
          (total, item) => total + item.excellent_sku_count,
          0
        ),
        good: currentTimePeriodData.reduce(
          (total, item) => total + item.good_sku_count,
          0
        ),
        toBeImproved: currentTimePeriodData.reduce(
          (total, item) => total + item.to_be_improved_sku_count,
          0
        ),
      };
    });
  };

  //mapping data between list and graph data points
  getHorizontalBarChartMappedData = (
    mainTitle,
    colTitle,
    graphData,
    timeperiods,
    response
  ) => {
    timeperiods.forEach((timeperiod) => {
      graphData.dataPoints["excellent"].push(
        response.find((item) => item.timeperiod === timeperiod).excellent
      );
      graphData.dataPoints["good"].push(
        response.find((item) => item.timeperiod === timeperiod).good
      );
      graphData.dataPoints["toBeImproved"].push(
        response.find((item) => item.timeperiod === timeperiod).toBeImproved
      );
    });

    let datapointsPercent = Object.keys(graphData.dataPoints).reduce(
      (result, currBrand) => {
        let skuPercent = graphData.dataPoints[currBrand].map(
          (excellent, index) => {
            let totalSKU = Object.keys(graphData.dataPoints).reduce(
              (total, key) => total + graphData.dataPoints[key][index],
              0
            );
            if (totalSKU) {
              return 100 * (graphData.dataPoints[currBrand][index] / totalSKU);
            }
            return 0;
          }
        );
        if (result[`${currBrand}Percent`]) {
          result[`${currBrand}Percent`] += skuPercent;
        } else {
          result[`${currBrand}Percent`] = skuPercent;
        }
        return result;
      },
      {}
    );
    let maxValue = Math.max(
      ...Object.keys(graphData.dataPoints).map((key) =>
        Math.max(...graphData.dataPoints[key])
      )
    );
    graphData.dataPoints = {
      ...graphData.dataPoints,
      ...datapointsPercent,
      mainTitle: mainTitle,
      colTitle: colTitle,
      maxValue: maxValue,
    };
    return graphData;
  };

  async todayScore(schema, requestBody) {
    try {
      //Build the query
      let query = `select country, platform, brand_name, product_type, seller_name, product_size, excellent_sku_count, 
       good_sku_count, to_be_improved_sku_count from ${schema}.content_platform_score 
        where 1=1`;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);

      //Fetch the results and map to the model
      const list = await getDatabaseQueryResultPromise(query, TodayScore);

      return list;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }
}
module.exports = new ContentService();
