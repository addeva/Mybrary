const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// books index
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

// add new book
router.post("/", async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishedDate: new Date(req.body.publishedDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect("books");
  } catch {
    renderFormPage(res, book, "new", true);
  }
});

// go to new book page
router.get("/new", async (req, res) => {
  renderFormPage(res, new Book(), "new");
});

// go to the a book's profile page
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", { book: book });
  } catch {
    res.redirect("/");
  }
});

// go to the edit page of a book's profile
router.get("/:id/edit", async (req, res) => {
  const book = await Book.findById(req.params.id);
  renderFormPage(res, book, "edit");
});

// update a book's info
router.put("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishedDate = new Date(req.body.publishedDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;

    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }

    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (err) {
    console.log(err);
    if (book != null) {
      renderFormPage(res, book, "edit", true);
    } else {
      res.redirect("/");
    }
  }
});

// delete a book
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id).populate("author").exec();
    await book.deleteOne();
    res.redirect("/books");
  } catch (err) {
    console.log(err);
    if (book != null) {
      res.render("books/show", {
        book: book,
        errorMessage: "Could not delete the book.",
      });
    } else {
      res.redirect("/");
    }
  }
});

// render pages
async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error updating Book";
      } else {
        params.errorMessage = "Error creating Book";
      }
    }
    res.render(`books/${form}`, params);
  } catch {
    res.redirect("books");
  }
}

// save book cover
function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
