module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "FaceMapping",
    {
      id: {
        autoIncrement: true,
        field: "id",
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        field: "name",
        type: DataTypes.STRING,
        allowNull: false,
      },
      s3_bucket: {
        field: "s3_bucket",
        type: DataTypes.STRING,
        allowNull: false,
      },
      s3_file_name: {
        field: "s3_file_name",
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        field: "created_at",
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        field: "updated_at",
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      schema: "face_aml",
      tableName: "face_mappings",
      timestamps: false,
    }
  );
};
