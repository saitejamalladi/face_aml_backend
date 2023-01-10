const response = require("../utils/response");
const AWS = require("aws-sdk");
const config = require("../config");
const randomKeyService = require("./randomKey");
const axios = require("axios");
const FaceMapping = require("../models/mapping").FaceMapping;
let name = "Abdul Rahman";

class FaceAMLService {
  async compareFaces(requestBody, files) {
    const similarityThreshold = requestBody.similarity_threshold; //70 default
    let reguloResponse = [];

    let rosetteResponse = await this.getRosetteDataWithName(requestBody.name);

    if (rosetteResponse.length <= 0) {
      return await response.handleSuccessResponseWithData(
        "No Name hits for the customer",
        reguloResponse
      );
    }

    let osIds = rosetteResponse.map((item) => item.open_sanction_id);

    let faceMappings = await FaceMapping.findAll({
      where: {
        open_sanction_id: osIds,
      },
      attributes: [
        "open_sanction_id",
        "profile_id",
        "name",
        "dob",
        "remarks",
        "face_image",
        "web_link",
        "weblink_pdf",
      ],
      raw: true,
    });
    reguloResponse = rosetteResponse.map((item, index) => {
      return {
        hit_id: 1 + index,
        name_matched: item.rosetteResponse[0]?.resultFields?.name,
        name_confidence: item.rosetteResponse[0]?.score.toFixed(3),
        face_found:
          faceMappings.filter(
            (faceMapping) =>
              faceMapping.open_sanction_id === item.open_sanction_id
          ).length > 0,
        rosetteResponse: item.rosetteResponse,
        face_data: faceMappings.find(
          (faceMapping) =>
            faceMapping.open_sanction_id === item.open_sanction_id
        ),
      };
    });
    if (reguloResponse.length > 0) {
      let sourceImageS3Data = await this.uploadImage(files.image);
      try {
        let results = await Promise.all(
          reguloResponse.map((face) =>
            this.getAWSResponse(
              config.aws.source_bucket,
              sourceImageS3Data.key,
              config.aws.target_bucket,
              face.face_data?.face_image,
              similarityThreshold
            )
          )
        );
        reguloResponse = reguloResponse.map((item, index) => {
          let result = results[index];
          if (result) {
            return {
              face_match_score:
                Math.max(
                  ...result.FaceMatches.map((face) => face.Similarity)
                ) || 0,
              ...item,
              bucket: config.aws.target_bucket,
              aws_response: result,
            };
          } else {
            return item;
          }
        });
        reguloResponse.forEach((item) => {
          if (item.face_match_score) {
            item.face_matched = item.face_match_score > 75;
          }
        });
      } catch (error) {
        return await response.handleInternalServerError(error);
      }
    }
    return await response.handleSuccessResponseWithData(
      "Names found",
      reguloResponse
    );
    // let apiResponse = {
    //   faceCount: faceMappings.length,
    //   matchedFaces: faceAMLResponse?.filter((face) => face.similarity >= 75),
    //   unMatchedFaces: faceAMLResponse?.filter((face) => face.similarity < 75),
    // };
    // return await response.handleSuccessResponseWithData(
    //   "Face AML Response",
    //   apiResponse
    // );
  }

  async getAWSResponse(
    sourceBucket,
    sourceImage,
    targetBucket,
    targetImage,
    similarityThreshold
  ) {
    if (!targetImage) {
      return targetImage;
    }
    const awsConfig = new AWS.Config({
      accessKeyId: config.aws.access_key,
      secretAccessKey: config.aws.access_secret,
      region: config.aws.region,
    });
    const client = new AWS.Rekognition(awsConfig);
    const params = {
      SourceImage: {
        S3Object: {
          Bucket: sourceBucket,
          Name: sourceImage,
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: targetBucket,
          Name: targetImage,
        },
      },
      SimilarityThreshold: similarityThreshold || 0,
    };

    return new Promise((resolve, reject) => {
      client.compareFaces(params, function (err, response) {
        if (err) {
          console.log("Error"); // an error occurred
          console.log(err, err.stack); // an error occurred
          reject(err);
        } else {
          console.log("response");
          console.log(JSON.stringify(response));
          resolve(response);
        }
      });
    });
  }
  async uploadImage(image) {
    let sourceImageName = `${await randomKeyService.generate()}.jpg`;
    const awsConfig = new AWS.Config({
      accessKeyId: config.aws.access_key,
      secretAccessKey: config.aws.access_secret,
      region: config.aws.region,
    });
    const s3Client = new AWS.S3(awsConfig);
    const blob = await image.data;
    try {
      const uploadedImageResponse = await s3Client
        .upload({
          Bucket: config.aws.source_bucket,
          Key: sourceImageName,
          Body: blob,
        })
        .promise();
      console.log(uploadedImageResponse);
      return uploadedImageResponse;
    } catch (error) {
      console.log(error);
    }
  }
  async queryRosetteWithName(name) {
    let url = "http://13.214.192.45:8090/rs/identity/search-index/15";
    let payload = {
      fields: [
        {
          field: "name",
          value: name,
        },
        {
          field: "alias",
          value: name,
        },
      ],
      matchConfigurationId: 1,
      windowSize: 50,
    };

    let res = await axios.post(url, payload);
    return res.data;
  }
  async getRosetteDataWithName(name) {
    let rosetteResponse = await this.queryRosetteWithName(name);
    let osIds = [
      ...new Set(
        rosetteResponse.searchResponseEntities.map(
          (data) => data.resultFields.open_sanction_id
        )
      ),
    ];
    return osIds.map((osId) => {
      let maxScore = 0;
      let sortedResponse = rosetteResponse.searchResponseEntities.filter(
        (item) => item.resultFields.open_sanction_id === osId
      );
      maxScore = Math.max(...sortedResponse.map((item) => item.score));
      return {
        open_sanction_id: osId,
        rosetteResponse: sortedResponse
          .filter((item) => item.score === maxScore)
          .slice(0, 1),
      };
    });
  }
}
module.exports = new FaceAMLService();
