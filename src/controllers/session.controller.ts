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
    // 1. Ensure users exist with metadata
    const guest = await findUserById(guestId);
    if (!guest) {
      return responder(res, {
        message: "Guest user not found",
        httpCode: 404,
      });
    }

    console.log("before user upstream");

    // await streamClient.upsertUsers([
    //   {
    //     id: req.userId,
    //     name: user.username || user.email,
    //     role: user.role || undefined,
    //   },
    //   {
    //     id: guestId,
    //     name: guest.username || guest.email,
    //     role: guest.role || undefined,
    //   },
    // ]);

    console.log("test user");

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

    
    console.log("test stream data", streamData);

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
    console.error("Error while create session:", error);
    return res.status(500).json({
      message: "Failed to create session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
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

export const joinSessionController = async (req: Request, res: Response) => {
  try {
    console.log(req.params);
    const session = await Session.findByPk(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Verify user is a participant
    if (session.host_id !== req.userId && session.guest_id !== req.userId) {
      return res.status(403).json({
        message: "You are not authorized to join this session",
      });
    }

    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);

    if (now < startTime) {
      return res.status(403).json({ message: "Call not started yet" });
    }

    if (now > endTime) {
      return res.status(403).json({ message: "Call already ended" });
    }

    session.status = "active";
    await session.save();

    res.status(200).json({ streamCallId: session.stream_call_id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to join session" });
  }
};

export const endSessionController = async (req: Request, res: Response) => {
  try {
    const session = await Session.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Verify user is the host
    if (session.host_id !== req.userId) {
      return res.status(403).json({
        message: "Only the host can end the session",
      });
    }

    // End the Stream call
    await streamClient.video.call("default", session.stream_call_id).end();

    // Update session status
    session.status = "ended";
    await session.save();

    res.status(200).json({ message: "Session ended successfully" });
  } catch (error) {
    console.error("Error ending session:", error);
    return res.status(500).json({
      message: "Failed to end session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const tokenSessionController = async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.userId!);

    if (!user) {
      return responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    const token = streamClient.generateUserToken({ user_id: user.id });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to genarate token" });
  }
};
