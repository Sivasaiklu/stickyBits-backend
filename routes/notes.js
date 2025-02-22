const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

// route 1 : get all the notes using GET method

router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured");
  }
});

// route 2 : to add the notes using POST method

router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "description must be 5 letters").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // If there are errors, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();

      res.json(note);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occured");
    }
  }
);

// route 3 : to update existing notes using PUT method
const mongoose = require("mongoose");

router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  try {
    // 🔹 Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    // 🔹 Find the note by ID
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // 🔹 Check if the logged-in user is the owner of the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not allowed" });
    }

    // 🔹 Create an updated note object
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    // 🔹 Update the note
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );

    res.json({ note });
  } catch (error) {
    console.error("Error updating note:", error.message);
    res.status(500).send("Internal server error occurred");
  }
});


// route 4 : delete notes using DELETE method

router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    // find the note to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).send("not found");
    }

    // allow delete if user owns this notes
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("not allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);

    res.json({ Success: "note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured");
  }
});

module.exports = router;
