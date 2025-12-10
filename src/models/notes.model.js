import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const note = sequelize.define("note", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: "notes",
    indexes: [{
            name: "idx_notes_user_id",
            fields: ["user_id"]
        },
        {
            name: "idx_notes_created_at",
            fields: [
                { name: "createdAt", order: "DESC" }
            ]
        },
        {
            name: "idx_notes_title_content",
            fields: ["title", "content"], // Composite index search on title and content or one of them
        },
        {
            name: "idx_notes_id",
            fields: ["id"]
        }
    ]
})

export default note;