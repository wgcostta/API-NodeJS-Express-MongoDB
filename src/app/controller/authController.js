const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const authConfig = require("../../config/auth");
const mailer = require("../../modules/mailer");

const User = require("../model/User");
const { Router } = require("express");

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.post("/register", async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "_User already existis" });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" + err });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(400).send({ error: "_User not found" });
  }
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: "Invalid _User or _Password" });

  user.password = undefined;

  res.send({ user, token: generateToken({ id: user.id }) });
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ error: "_User not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    //Data e o tempo de expitação (1 hr a mais)
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });

    console.log(token, now);
    mailer.sendEmail({
      to: email,
      from: "wg.o.costa@gmail.com",
      template: "",
    });
  } catch (err) {
    return res
      .status(400)
      .send({ error: "Erro on forgot password, try anain .." + err });
  }
});

module.exports = (app) => app.use("/auth", router);
