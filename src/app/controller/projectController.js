const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Project = require("../model/Projects");
const Task = require("../model/Task");
const { promises } = require("fs");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate(["user", "tasks"]);
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
    const project = await Project.findById(req.params.projectId).populate([
      "user",
      "tasks",
    ]);
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
    const { title, description, tasks } = req.body;

    const project = await Project.create({
      title,
      description,
      user: req.userId,
    });

    //Aguardar o método executar
    await Promise.all(
      tasks.map(async (task) => {
        const projectTask = new Task({ ...task, project: project._id });
        await projectTask.save();
        project.tasks.push(projectTask);
      })
    );

    await project.save();

    return res.send({ project });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ error: "Error creating new project", details: err });
  }
});

router.put("/:projectId", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        title,
        description,
      },
      { new: true } //Retornar o registro atualizado
    );

    //Remover antes de salvar novamente.
    project.tasks = [];
    await Task.remove({ project: project._id });

    //Aguardar o método executar
    await Promise.all(
      tasks.map(async (task) => {
        const projectTask = new Task({ ...task, project: project._id });
        await projectTask.save();
        project.tasks.push(projectTask);
      })
    );

    await project.save();

    return res.send({ project });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ error: "Error update project", details: err });
  }
});

router.delete("/:projectId", async (req, res) => {
  try {
    await Project.findByIdAndRemove(req.params.projectId);
    return res.send("Ok");
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ error: "Error remove project", details: err });
  }
});

module.exports = (app) => app.use("/projects", router);
