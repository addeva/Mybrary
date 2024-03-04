const express = require("express");
const router = express.Router();
const Author = require("../models/author");

// authors index router
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name.trim() != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors: authors,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });

  try {
    const newAuthor = await author.save();
    res.redirect("authors");
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating new author",
    });
  }
});

// new author router
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

module.exports = router;