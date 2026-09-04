import { Association, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { MilestoneAttributes, MilestoneResource, MilestoneTask } from "./types";

type Project = import("./project.model").default;

interface MilestoneCreationAttributes
  extends Optional<
    MilestoneAttributes,
    "id" | "completionProgress" | "deliverables" | "resources" | "createdAt" | "updatedAt"
  > {}

class Milestone
  extends Model<MilestoneAttributes, MilestoneCreationAttributes>
  implements MilestoneAttributes
{
  public id!: string;
  public projectId!: string;
  public milestoneNumber!: number;
  public title!: string;
  public description!: string;
  public expectedTime!: string;
  public completionProgress!: number;
  public tasks!: MilestoneTask[];
  public deliverables?: string[];
  public resources?: MilestoneResource[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public project?: Project;

  public static associations: {
    project: Association<Milestone, Project>;
  };
}

Milestone.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    milestoneNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expectedTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completionProgress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tasks: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    deliverables: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    resources: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "Milestone",
    tableName: "milestones",
    timestamps: true,
    indexes: [
      {
        fields: ["projectId"],
      },
      {
        fields: ["projectId", "milestoneNumber"],
        unique: true,
      },
    ],
  }
);

export default Milestone;
