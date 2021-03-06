const mongoose = require("../../database");
const bcrypt = require("bcryptjs");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  project: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  ],
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.Now,
  },
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
