const roles = require("./roles");
const validations = require("./validations");

module.exports = {
  BCRY_SALT_ROUNDS: 10,
  USER_ID: "USER_ID",
  USER_ROLE: "USER_ROLE",
  VALIDATIONS: validations,
  ROLES: roles,
  PRODUCT_INDEX: "products",
  FACE_AML_SOURCE_BUCKET: "face-aml-source-bucket",
  FACE_AML_TARGET_BUCKET: "face-aml-target-bucket",
};
