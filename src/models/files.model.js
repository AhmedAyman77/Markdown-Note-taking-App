import { DataTypes } from "sequelize";
import sequelize from "../config/db.config";

const file = sequelize.define("file", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    note_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'notes',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    original_name: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true
    },
    stored_name: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true,
        unique: true
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true
    },
    mime_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: "files",
    indexes: [{
            name: "idx_files_note_id",
            fields: ["note_id"]
        },
        {
            name: "idx_files_stored_name",
            fields: ["stored_name"]
        },
        {
            name: "idx_files_created_at",
            fields: [
                { name: "createdAt", order: "DESC" }
            ]
        }
    ]
})

export default file;