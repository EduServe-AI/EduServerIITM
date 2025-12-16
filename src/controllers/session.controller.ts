import { randomUUID } from "crypto";
import { Request, Response } from "express";
import Session from "../models/session.model";
import User from "../models/user.model";
import { findUserById } from "../services/user.service";
import responder from "../utils/responder";
import streamClient from "../utils/stream";

export const createSessionController = async (req: Request, res: Response) => {
  try {
    const { guestId, startTime, title, description, durationMinutes } =
      req.body;
    // getting the user by id
    const user = await findUserById(req.userId!);

    if (!user) {
      return responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    const start = new Date(startTime); // startTime is string
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const sessionId = randomUUID();

    // create stream video call
    // 1. Ensure users exist
    await streamClient.upsertUsers([{ id: req.userId }, { id: guestId }]);

    // 2. Create call
    const streamData = await streamClient.video
      .call("default", sessionId)
      .getOrCreate({
        data: {
          starts_at: new Date(startTime),
          created_by_id: req.userId,
          members: [{ user_id: req.userId }, { user_id: guestId }],
        },
      });

    const savedSession = await Session.create({
      title: title,
      description: description,
      host_id: req.userId!,
      guest_id: guestId,
      start_time: startTime,
      duration_minutes: durationMinutes,
      end_time: end.toISOString(),
      stream_call_id: sessionId,
      status: "scheduled",
    });

    console.log("test creation", savedSession);
    res.status(201).json({ savedSession });
  } catch (error) {
    console.error("Error while create session ");
  }
};

export const getSessionController = async (req: Request, res: Response) => {
  try {
    // getting the user by id
    const user = await findUserById(req.userId!);
    if (!user) {
      return responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    let whereClause = {};

    if (user.role === "student") {
      whereClause = { host_id: req.userId };
    } else if (user.role === "instructor") {
      whereClause = { guest_id: req.userId };
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const sessions = await Session.findAll({
      where: whereClause,
      order: [["start_time", "ASC"]],
      include: [
        {
          model: User,
          as: "host",
          attributes: ["id", "username", "email"],
        },
        {
          model: User,
          as: "guest",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    return res.json(sessions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch sessions" });
  }
};
