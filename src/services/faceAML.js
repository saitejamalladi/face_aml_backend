const response = require("../utils/response");
const AWS = require("aws-sdk");
const config = require("../config");
const randomKeyService = require("./randomKey");
const FaceMapping = require("../models/mapping").FaceMapping;

class FaceAMLService {
  async compareFaces(requestBody, files) {
    const similarityThreshold = requestBody.similarity_threshold; //70 default
    let faceAMLResponse = [];
    let faceMappings = await FaceMapping.findAll({
      where: {
        name: requestBody.name,
      },
      attributes: [
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
    if (faceMappings.length > 0) {
      let sourceImageS3Data = await this.uploadImage(files.image);
      try {
        let results = await Promise.all(
          faceMappings.map((faceMapping) =>
            this.getAWSResponse(
              config.aws.source_bucket,
              sourceImageS3Data.key,
              config.aws.target_bucket,
              faceMapping.face_image,
              similarityThreshold
            )
          )
        );
        faceAMLResponse = results.map((result, index) => {
          return {
            ...faceMappings[index],
            bucket: config.aws.target_bucket,
            similarity:
              Math.max(...result.FaceMatches.map((face) => face.Similarity)) ||
              0,
            metadata: result,
          };
        });
      } catch (error) {
        return await response.handleInternalServerError(error);
      }
    }
    let apiResponse = {
      faceCount: faceMappings.length,
      matchedFaces: faceAMLResponse?.filter((face) => face.similarity >= 75),
      unMatchedFaces: faceAMLResponse?.filter((face) => face.similarity < 75),
    };
    return await response.handleSuccessResponseWithData(
      "Face AML Response",
      apiResponse
    );
  }

  async getAWSResponse(
    sourceBucket,
    sourceImage,
    targetBucket,
    targetImage,
    similarityThreshold
  ) {
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
          console.log(targetImage);
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
}
module.exports = new FaceAMLService();
