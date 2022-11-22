const response = require("../utils/response");
const {
  filterQueryBuilder,
  getDatabaseQueryResultPromise,
} = require("../utils/helper");

class HomeService {
  async getStoresTracked(schema, requestBody) {
    try {
      const responseObject = {
        totalStoresTracked: 0,
        averageContentScore: 0,
        platformWiseData: [],
      };
      let platformWiseAvgContentScore = [];

      //Build the Query
      let query = `select count(distinct(seller_id)) from ${schema}.content_overview_detailed where timeperiod between  1 AND 7 `;
      let query1 = `select count(distinct(seller_id)) from ${schema}.content_overview_detailed where timeperiod between  8 AND 14 `;
      let query2 = `select sum(content_score_sum)/sum(content_score_count) as agc  from ${schema}.content_overview_detailed where timeperiod between  1 AND 7`;
      let query3 = `select sum(content_score_sum)/sum(content_score_count) as agc, platform  from ${schema}.content_overview_detailed  where  timeperiod between  1 and 7  `;
      let query4 = `select sum(content_score_sum)/sum(content_score_count) as agc, platform  from ${schema}.content_overview_detailed  where  timeperiod between  8 and 14 `;
      let query5 = `select sum(content_score_sum)/sum(content_score_count) as agc  from ${schema}.content_overview_detailed  where  timeperiod between  1 and 7  `;
      let query6 = `select sum(content_score_sum)/sum(content_score_count) as agc  from ${schema}.content_overview_detailed  where  timeperiod between  8 and 14 `;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query1 = filterQueryBuilder(query1, requestBody);
      query2 = filterQueryBuilder(query2, requestBody);
      query3 = filterQueryBuilder(query3, requestBody);
      query3 += " group by platform";
      query4 = filterQueryBuilder(query4, requestBody);
      query4 += " group by platform";
      query5 = filterQueryBuilder(query5, requestBody);
      query5 += " group by platform";
      query6 = filterQueryBuilder(query6, requestBody);
      query6 += " group by platform";

      //Fetch the results
      const promise3 = getDatabaseQueryResultPromise(query);
      const promise5 = getDatabaseQueryResultPromise(query1);
      const promise4 = getDatabaseQueryResultPromise(query2);
      const promise1 = getDatabaseQueryResultPromise(query3);
      const promise2 = getDatabaseQueryResultPromise(query4);
      const promise6 = getDatabaseQueryResultPromise(query5);
      const promise7 = getDatabaseQueryResultPromise(query6);

      //Trasnform the results
      let results = await Promise.all([
        promise1,
        promise2,
        promise3,
        promise4,
        promise5,
        promise6,
        promise7,
      ]);
      platformWiseAvgContentScore.push(...results[0]);
      platformWiseAvgContentScore = platformWiseAvgContentScore.map((item) => {
        const previousItem = results[1].find(
          (i) => i.platform === item.platform
        );
        if (previousItem) {
          item.weeklyChange =
            ((parseFloat(item.agc) - parseFloat(previousItem.agc)) /
              parseFloat(previousItem.agc)) *
            100;
        }
        return item;
      });

      responseObject.totalStoresTracked = results[2][0]?.count || 0;
      responseObject.totalStoresTrackedInLastWeekPer =
        ((parseFloat(results[2][0]?.count) - parseFloat(results[4][0]?.count)) /
          parseFloat(results[4][0]?.count || 0)) *
        100;
      responseObject.averageContentScore = results[5][0]?.agc || 0;
      responseObject.averageContentScoreInLastWeekPer =
        ((parseFloat(results[5][0]?.agc) - parseFloat(results[6][0]?.agc)) /
          parseFloat(results[6][0]?.agc || 0)) *
        100;
      responseObject.platformWiseData.push(...platformWiseAvgContentScore);

      //Return the response
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async assortmentOverview(schema, requestBody) {
    try {
      const responseObject = {
        currentWeekInStock: 0,
        currentWeekTotal: 0,
        prevWeekInStock: 0,
        prevWeekTotal: 0,
        totalChangeInPercentage: 0,
        inStockChangeInPercentage: 0,
        onShelfAvailability: 0,
      };

      //Build the Queries
      let query = `select count(distinct(sku)) from ${schema}.assortment_availability_sku where timeperiod between  1 AND 7 `;
      let lastWeek = `select count(distinct(sku)) from ${schema}.assortment_availability_sku where timeperiod between  8 AND 14 `;
      let thisWeekInStock = `select count(distinct(sku)) from ${schema}.assortment_availability_sku where timeperiod between  1 AND 7 and inStock = true`;
      let lastWeekInStock = `select count(distinct(sku)) from ${schema}.assortment_availability_sku where timeperiod between  8 AND 14 and inStock = true`;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      lastWeek = filterQueryBuilder(lastWeek, requestBody);
      thisWeekInStock = filterQueryBuilder(thisWeekInStock, requestBody);
      lastWeekInStock = filterQueryBuilder(lastWeekInStock, requestBody);

      //Fetch the results
      const thisWeekResult = getDatabaseQueryResultPromise(query);
      const lastWeekResult = getDatabaseQueryResultPromise(lastWeek);
      const thisWeekInStockResult = getDatabaseQueryResultPromise(
        thisWeekInStock
      );
      const lastWeekInStockResult = getDatabaseQueryResultPromise(
        lastWeekInStock
      );

      //Transform the results
      let results = await Promise.all([
        thisWeekResult,
        lastWeekResult,
        thisWeekInStockResult,
        lastWeekInStockResult,
      ]);

      responseObject.currentWeekTotal = results[0][0]?.count || 0;
      responseObject.prevWeekTotal = results[1][0]?.count || 0;
      responseObject.totalChangeInPercentage =
        ((parseFloat(results[0][0]?.count) - parseFloat(results[1][0]?.count)) /
          parseFloat(results[1][0]?.count || 0)) *
        100;
      responseObject.currentWeekInStock = results[2][0]?.count || 0;
      responseObject.prevWeekInStock = results[3][0]?.count || 0;
      responseObject.inStockChangeInPercentage =
        (parseFloat(responseObject.currentWeekInStock) /
          parseFloat(responseObject.currentWeekTotal) -
          parseFloat(responseObject.prevWeekInStock) /
            parseFloat(responseObject.currentWeekTotal)) *
        100;

      responseObject.onShelfAvailability =
        (100 * parseFloat(results[2][0]?.count)) /
        parseFloat(results[0][0]?.count);

      //Return the response
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async assortmentAvailabilityPlatformWise(schema, requestBody) {
    try {
      const selectedFilter = requestBody?.selectedFilter || "platform";
      const responseObject = {
        platformWiseData: [],
      };

      //Build the Query
      let query = `select ${selectedFilter},  count(DISTINCT sku) AS total_sku,
  count(
    DISTINCT CASE
      WHEN instock THEN sku
      ELSE NULL :: text
    END
  ) AS instock_sku from ${schema}.assortment_availability_sku where timeperiod between  1 AND 7`;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query += ` group by ${selectedFilter}`;

      //Fetch the results
      const promise2 = getDatabaseQueryResultPromise(query);

      //Transform the results
      let results = await Promise.all([promise2]);
      responseObject.platformWiseData.push(...results[0]);

      //Return the response.
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async ratingReviewsTotalStores(schema, requestBody) {
    try {
      let responseObject = {
        currWeekStoreCount: 0,
        ratings_1_3star: 0,
      };

      //Build the Query
      let thisWeek = `select count(distinct(seller_id)) from ${schema}.content_overview_detailed where timeperiod between  1 AND 7 `;
      let query = `select sum(total_rating) as total, sum(total_1_star_rating + total_2_star_rating + total_3_star_rating) as starttotal from ${schema}.ratings_product_overview where 1=1`;

      //Apply the Filters
      thisWeek = filterQueryBuilder(thisWeek, requestBody);
      query = filterQueryBuilder(query, requestBody);

      //Fetch the results
      const thisWeekResult = getDatabaseQueryResultPromise(thisWeek);
      const startRatingResult = getDatabaseQueryResultPromise(query);

      //Transform the results
      let results = await Promise.all([thisWeekResult, startRatingResult]);
      responseObject.currWeekStoreCount = results[0][0]?.count || 0;
      responseObject.ratings_1_3star =
        100 * (results[1][0]?.starttotal / results[1][0]?.total) || 0;

      //Return the response.
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  async ratingReviewsDonutGraph(schema, requestBody) {
    try {
      //Build the query
      let query = `select total_1_star_rating , total_2_star_rating , total_3_star_rating , total_4_star_rating, 
       total_5_star_rating, platform from ${schema}.ratings_product_overview where 1=1`;
      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      //Fetch the results
      const graphDataResult = getDatabaseQueryResultPromise(query);
      //Transform and return the response
      let results = await Promise.all([graphDataResult]);
      return this.getDonutChartData(results[0]);
    } catch (err) {
      console.log(err);
      //handle  the exception
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

  //content overview - lazada, shopee and others calculations
  getDataBasedOnPlatform = (result, platform) => {
    const widgetData = {
      data: [],
      labels: ["5 star", "4 star", "1-3 star"],
      colors: ["#7C90DB", "#202C56", "#DC1A4C"],
      brand: "",
      showTooltip: false,
    };
    widgetData.brand = platform;
    let response = {
      star5: result.reduce(
        (total, item) => total + item.total_5_star_rating,
        0
      ),
      star4: result.reduce(
        (total, item) => total + item.total_4_star_rating,
        0
      ),
      start1_3: result.reduce(
        (total, item) =>
          total +
          item.total_1_star_rating +
          item.total_2_star_rating +
          item.total_3_star_rating,
        0
      ),
    };
    Object.entries(response).forEach(([responseKey, responseValue]) => {
      widgetData.data.push(responseValue);
    });
    return widgetData;
  };

  async priceAndPromoOverview(schema, requestBody) {
    try {
      const responseObject = {
        currWeekProductsOnPromoPercent: 0,
        weeklyChangeInPromo: 0,
        currWeekDiscountPercent: 0,
        weeklyChangeInDiscount: 0,
      };
      // Build the Query
      let query = `select sum(current_week_total_products) currWeekProducts, sum(current_week_promo_products) currWeekProductsOnPromo,  sum(prev_week_total_products) prevWeekProducts, sum(prev_week_promo_products) prevWeekProductsOnPromo , sum(current_week_discount_sum) currWeekDiscountSum , sum(current_week_discount_count) currWeekDiscountCount, sum(prev_week_discount_sum) prevWeekDiscountSum, sum(prev_week_discount_count) prevWeekDiscountCount from ${schema}.price_promo_overview_detailed where 1=1`;

      //Apply the Filters
      query = filterQueryBuilder(query, requestBody);

      //Fetch the results
      const priceAndPromoCardData = getDatabaseQueryResultPromise(query);

      //Transform the results
      let results = await Promise.all([priceAndPromoCardData]);
      responseObject.currWeekProductsOnPromoPercent =
        parseFloat(results[0][0].currweekproducts) > 0
          ? (100 * parseFloat(results[0][0].currweekproductsonpromo)) /
            parseFloat(results[0][0].currweekproducts)
          : 0;
      responseObject.weeklyChangeInPromo =
        100 *
        (parseFloat(results[0][0].currweekproductsonpromo) /
          parseFloat(results[0][0].currweekproducts) -
          parseFloat(results[0][0].prevweekproductsonpromo) /
            parseFloat(results[0][0].prevweekproducts));
      responseObject.currWeekDiscountPercent =
        parseFloat(results[0][0].currweekdiscountcount) > 0
          ? parseFloat(results[0][0].currweekdiscountsum) /
            parseFloat(results[0][0].currweekdiscountcount)
          : 0;
      responseObject.weeklyChangeInDiscount =
        parseFloat(results[0][0].currweekdiscountsum) /
          parseFloat(results[0][0].currweekdiscountcount) -
        parseFloat(results[0][0].prevweekdiscountsum) /
          parseFloat(results[0][0].prevweekdiscountcount);
      //Return the response
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }
  async priceAndPromoPlatform(schema, requestBody) {
    try {
      let responseObject = {};
      let responseObject2 = {};

      //Build the query
      let query = `select sum(current_week_total_products) totalProducts, sum(current_week_promo_products) totalPromoProducts,  sum(current_week_discount_sum) totalDiscountSum, sum(current_week_discount_count) totalDiscountCount , platform from ${schema}.price_promo_overview_detailed where 1=1`;
      let query2 = `select sum(current_week_total_products) totalProducts, sum(current_week_promo_products) totalPromoProducts,  sum(current_week_discount_sum) totalDiscountSum, sum(current_week_discount_count) totalDiscountCount  from ${schema}.price_promo_overview_detailed where 1=1`;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      query += ` group by platform`;
      query2 = filterQueryBuilder(query2, requestBody);

      //Fetch the Results
      const priceAndPromoDataByPlatform = getDatabaseQueryResultPromise(query);
      const priceAndPromoDataByTotalPlatform = getDatabaseQueryResultPromise(
        query2
      );

      //Transform the results
      let results = await Promise.all([
        priceAndPromoDataByPlatform,
        priceAndPromoDataByTotalPlatform,
      ]);
      responseObject = results[0].map((item) => {
        return {
          platform: item.platform,
          productsCount: item.totalproducts,
          productsOnPromo: item.totalpromoproducts,
          percentProductsOnPromo: parseFloat(item.totalproducts)
            ? (100 * parseFloat(item.totalpromoproducts)) /
              parseFloat(item.totalproducts)
            : 0,
          discountPercentage: parseFloat(item.totaldiscountcount)
            ? parseFloat(item.totaldiscountsum) /
              parseFloat(item.totaldiscountcount)
            : 0,
        };
      });
      responseObject2 = {
        platform: "Total",
        productsCount: results[1][0].totalproducts,
        productsOnPromo: results[1][0].totalpromoproducts,
        percentProductsOnPromo: parseFloat(results[1][0].totalproducts)
          ? (100 * parseFloat(results[1][0].totalpromoproducts)) /
            parseFloat(results[1][0].totalproducts)
          : 0,
        discountPercentage: parseFloat(results[1][0].totaldiscountcount)
          ? parseFloat(results[1][0].totaldiscountsum) /
            parseFloat(results[1][0].totaldiscountcount)
          : 0,
      };
      return [...responseObject, responseObject2];
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }
  async shareOfSearch(schema, requestBody) {
    try {
      let responseObject = {
        keywordsVolume: 0,
        numberOfResults: 0,
        avgRank: 0,
        platformWiseData: [],
      };

      //Build the query
      let query = `select count(DISTINCT(search_keyword)) AS keyword_vol, sum(count_of_products) AS num_of_results from ${schema}.search_total_keywords where 1=1`;
      let searchOverviewRanks = `select product_search_rank, platform ,timeperiod from ${schema}.search_product_trend where frequency_bucket='daily' AND timeperiod between  1 and 14`;
      let platforms = `select distinct(platform) from ${schema}.search_product_trend where frequency_bucket='daily' AND timeperiod between  1 and 14`;
      let searchOverviewRanksCurrDate = `select SUM(product_search_rank) total , count(product_search_rank) recordcount from ${schema}.search_product_trend where frequency_bucket='daily' AND timeperiod = 1`;

      //Apply the filters
      query = filterQueryBuilder(query, requestBody);
      searchOverviewRanks = filterQueryBuilder(
        searchOverviewRanks,
        requestBody
      );
      platforms = filterQueryBuilder(platforms, requestBody);
      searchOverviewRanksCurrDate = filterQueryBuilder(
        searchOverviewRanksCurrDate,
        requestBody
      );

      //Fetch the results
      const shareOfSearchCard = getDatabaseQueryResultPromise(query);
      const searchOverviewRanksResult = getDatabaseQueryResultPromise(
        searchOverviewRanks
      );
      const platformsResult = getDatabaseQueryResultPromise(platforms);
      const searchOverviewRanksCurrDateResult = getDatabaseQueryResultPromise(
        searchOverviewRanksCurrDate
      );

      //Transform the results
      let results = await Promise.all([
        shareOfSearchCard,
        searchOverviewRanksResult,
        searchOverviewRanksCurrDateResult,
        platformsResult,
      ]);
      responseObject.keywordsVolume = results[0][0].keyword_vol;
      responseObject.numberOfResults = results[0][0].num_of_results;
      responseObject.avgRank =
        parseFloat(results[2][0].total) / parseFloat(results[2][0].recordcount);

      const platformList = results[3];
      responseObject.platformWiseData = this.getPlatformWiseData(
        results[1],
        platformList
      );
      // Return the response
      return responseObject;
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }

  getPlatformWiseData = (data, platformList) => {
    const t = platformList.map((rowData) => {
      let currDayData = data.filter(
        (item) =>
          ["1"].includes(item.timeperiod) && item.platform === rowData.platform
      );
      let prevDayData = data.filter(
        (item) =>
          ["2"].includes(item.timeperiod) && item.platform === rowData.platform
      );
      let currWeekData = data.filter(
        (item) =>
          ["1", "2", "3", "4", "5", "6", "7"].includes(item.timeperiod) &&
          item.platform === rowData.platform
      );
      let prevWeekData = data.filter(
        (item) =>
          ["8", "9", "10", "11", "12", "13", "14"].includes(item.timeperiod) &&
          item.platform === rowData.platform
      );
      let currDayAvg =
        currDayData.length > 0
          ? this.getSum(currDayData, "product_search_rank") / currDayData.length
          : 0;
      let prevDayAvg =
        prevDayData.length > 0
          ? this.getSum(prevDayData, "product_search_rank") / prevDayData.length
          : 0;

      let currWeekAvg =
        currWeekData.length > 0
          ? this.getSum(currWeekData, "product_search_rank") /
            currWeekData.length
          : 0;
      let prevWeekAvg =
        prevWeekData.length > 0
          ? this.getSum(prevWeekData, "product_search_rank") /
            prevWeekData.length
          : 0;
      return {
        platform: rowData.platform,
        average_rank: currWeekAvg,
        changePerDay: prevDayAvg ? 100 * (currDayAvg / prevDayAvg - 1) : 0,
        changePerWeek: prevWeekAvg ? 100 * (currWeekAvg / prevWeekAvg - 1) : 0,
      };
    });
    return t;
  };

  getSum = (data, key) => {
    return data.reduce(
      (total, item) => parseFloat(total) + parseFloat(item[key]),
      0
    );
  };
}
module.exports = new HomeService();
