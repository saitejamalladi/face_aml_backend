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
      open_sanction_id: {
        field: "open_sanction_id",
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_id: {
        field: "name",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        field: "name",
        type: DataTypes.STRING,
        allowNull: false,
      },
      dob: {
        field: "dob",
        type: DataTypes.STRING,
        allowNull: false,
      },
      remarks: {
        field: "remarks",
        type: DataTypes.STRING,
        allowNull: false,
      },
      face_image: {
        field: "face_image",
        type: DataTypes.STRING,
        allowNull: false,
      },
      web_link: {
        field: "web_link",
        type: DataTypes.STRING,
        allowNull: false,
      },
      weblink_pdf: {
        field: "weblink_pdf",
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      schema: "face_aml",
      tableName: "face_data_os",
      timestamps: false,
    }
  );
};
