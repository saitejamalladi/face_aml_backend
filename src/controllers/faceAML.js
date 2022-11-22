const faceAMLService = require("../services/faceAML");

class FaceAMLController {
  async getFaceAMLScore(req, res) {
    try {
      let successResponse = await faceAMLService.compareFaces(
        req.body,
        req.files
      );
      res.status(200).send(successResponse);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
}

module.exports = new FaceAMLController();
