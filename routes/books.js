const express = require("express");
const router = express.Router();
const multer = require("multer");
const Book = require("../models/book");
const path = require("path");
const fs = require("fs");
const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const Author = require("../models/author");
const author = require("../models/author");
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

// books index router
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedAfter && req.query.publishedAfter != "") {
    query = query.gte("publishedDate", req.query.publishedAfter);
  }
  if (req.query.publishedBefore && req.query.publishedBefore != "") {
    query = query.lte("publishedDate", req.query.publishedBefore);
  }
  try {
    let books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishedDate: new Date(req.body.publishedDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description,
  });
  try {
    const newBook = await book.save();
    res.redirect("books");
  } catch {
    if (book.coverImageName) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true);
  }
});

// new book router
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// remove unwanted cover images
function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath + fileName)),
    (err) => {
      if (err) console.error(err);
    };
}

// async function render bokks/new page if no error
// else redirect to books page dsiplaying error message 'Error creating Book'
async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      params.errorMessage = "Error creating Book";
    }
    res.render("books/new", params);
  } catch {
    res.redirect("books");
  }
}

module.exports = router;
