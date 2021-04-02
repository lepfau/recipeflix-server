const express = require("express");
const router = express.Router();
const User = require("../models/User");
const requireAuth = require("../middlewares/requireAuth");
const salt = 10;
const bcrypt = require("bcrypt");

router.get("/", (req, res, next) => {
  User.find()
    .populate({
      path: "id_recipes",
      populate: {
        path: "ratings",
      },
    })
    .then((recipeDoc) => {
      res.status(200).json(recipeDoc);
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/profile", (req, res, next) => {
  User.findById(req.session.currentUser)
    .populate({
      path: "id_recipes",
      populate: {
        path: "ratings",
      },
    })
    .then((recipeDoc) => {
      res.status(200).json(recipeDoc);
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/:username", (req, res, next) => {
  User.findOne({ userName: req.params.username })
    .then((userDoc) => {
      res.status(200).json(userDoc);
    })
    .catch((error) => {
      next(error);
    });
});

router.patch("/:id", requireAuth, (req, res, next) => {
  const { email, password, firstName, lastName, userName } = req.body;
  const hashedPassword = bcrypt.hashSync(password, salt);
  const updatedUser = {
    email,
    lastName,
    firstName,
    userName,
    password: hashedPassword,
  };

  User.findByIdAndUpdate(req.params.id, updatedUser, {
    new: true,
  })
    .populate("recipes")
    .then((updatedUser) => {
      return res.status(200).json(updatedUser);
    })

    .catch(next);
});

module.exports = router;