//Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//PDX-License-Identifier: MIT-0 (For details, see https://github.com/awsdocs/amazon-rekognition-developer-guide/blob/master/LICENSE-SAMPLECODE.)

const AWS = require("aws-sdk");
const bucket = "ada-test-emr";
const photo_source = "source.jpg";
const photo_target = "target.jpg";
const config = new AWS.Config({
  accessKeyId: "AKIAYDGNRUXAUFEWZ2H4",
  secretAccessKey: "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",
  region: "us-east-1",
});
const client = new AWS.Rekognition(config);
const params = {
  SourceImage: {
    S3Object: {
      Bucket: bucket,
      Name: photo_source,
    },
  },
  TargetImage: {
    S3Object: {
      Bucket: bucket,
      Name: photo_target,
    },
  },
  SimilarityThreshold: 70,
};
client.compareFaces(params, function (err, response) {
  if (err) {
    console.log("Error"); // an error occurred
    console.log(err, err.stack); // an error occurred
  } else {
    console.log("response");
    console.log(JSON.stringify(response));
    response.FaceMatches.forEach((data) => {
      let position = data.Face.BoundingBox;
      let similarity = data.Similarity;
      console.log(
        `The face at: ${position.Left}, ${position.Top} matches with ${similarity} % confidence`
      );
      console.log(JSON.stringify(data));
    }); // for response.faceDetails
  } // if
});
