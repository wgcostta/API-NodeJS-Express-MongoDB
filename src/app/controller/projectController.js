const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Project = require("../model/Projects");
const Task = require("../model/Task");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate("user");
    return res.send({ projects });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ error: "Error loading projects", details: err });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      "user"
    );
    return res.send({ project });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ error: "Error loading project", details: err });
  }
});

router.post("/", async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, user: req.userId });
    return res.send({ project });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ error: "Error creating new project", details: err });
  }
});

router.put("/:projectId", async (req, res) => {
  res.send({ user: req.userId });
});

router.delete("/:projectId", async (req, res) => {
  res.send({ user: req.userId });
});

module.exports = (app) => app.use("/projects", router);
