const response = require("../utils/response");
const AWS = require("aws-sdk");
const config = require("../config");
const randomKeyService = require("./randomKey");
const FaceMapping = require("../models/mapping").FaceMapping;
const { FACE_AML_SOURCE_BUCKET } = require("../constants");

class FaceAMLService {
  async compareFaces(requestBody, files) {
    const similarityThreshold = requestBody.similarity_threshold; //70 default
    let faceMappings = await FaceMapping.findAll({
      attributes: ["name", "s3_bucket", "s3_file_name"],
      raw: true,
    });
    let sourceImageS3Data = await this.uploadImage(files.image);
    try {
      let results = await Promise.all(
        faceMappings.map((faceMapping) =>
          this.getAWSResponse(
            FACE_AML_SOURCE_BUCKET,
            sourceImageS3Data.key,
            faceMapping.s3_bucket,
            faceMapping.s3_file_name,
            similarityThreshold
          )
        )
      );
      let faceAMLResponse = results.map((result, index) => {
        return {
          imageName: faceMappings[index].name,
          similarity:
            result.FaceMatches.length > 0
              ? Math.max(...result.FaceMatches.map((face) => face.Similarity))
              : 0,
        };
      });
      return response.handleSuccessResponseWithData(
        "Face AML Response",
        faceAMLResponse
      );
    } catch (error) {
      return response.handleInternalServerError(error);
    }
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
      SimilarityThreshold: similarityThreshold || 70,
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
          Bucket: FACE_AML_SOURCE_BUCKET,
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
