import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const user = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        require: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        require: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true
    }
}, {
    timestamps: true,
    tableName: "users",

    indexes: [{
            name: "idx_users_username",
            unique: true,
            fields: ["username"]
        },
        {
            name: "idx_users_email",
            unique: true,
            fields: ["email"]
        }
    ]
})

export default user;