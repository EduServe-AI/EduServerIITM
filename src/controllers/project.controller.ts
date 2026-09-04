import { Request, Response } from "express";
import Milestone from "../models/milestone.model";
import Project from "../models/project.model";

// Get all projects with milestone summaries
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: Milestone,
          as: "milestones",
          attributes: ["id", "milestoneNumber", "title", "description", "expectedTime", "completionProgress"],
        },
      ],
      order: [
        ["createdAt", "ASC"],
        [{ model: Milestone, as: "milestones" }, "milestoneNumber", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("Error in getAllProjects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve projects",
      error: error.message,
    });
  }
};

// Get project by ID with full milestone details
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: Milestone,
          as: "milestones",
        },
      ],
      order: [[{ model: Milestone, as: "milestones" }, "milestoneNumber", "ASC"]],
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Error in getProjectById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve project",
      error: error.message,
    });
  }
};

// Get specific milestone details by project ID and milestone ID
export const getMilestoneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, milestoneId } = req.params;

    const milestone = await Milestone.findOne({
      where: {
        id: milestoneId,
        projectId: id,
      },
    });

    if (!milestone) {
      res.status(404).json({
        success: false,
        message: "Milestone not found for this project",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (error: any) {
    console.error("Error in getMilestoneById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve milestone",
      error: error.message,
    });
  }
};
