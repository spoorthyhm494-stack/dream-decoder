import DreamNote from "../models/dreamNoteModel.js";

// Create a new dream note
export const createDreamNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const note = await DreamNote.create({
      userId: req.user.id,   // ✅ FIXED (user.id, not user._id)
      title,
      content
    });

    res.status(201).json({ message: "Dream Note saved", note });
  } catch (error) {
    res.status(500).json({ message: "Error saving dream note", error });
  }
};

// Get all dream notes of the logged-in user
export const getDreamNotes = async (req, res) => {
  try {
    const notes = await DreamNote.find({ userId: req.user.id })  // ✅ FIXED
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error });
  }
};

// Update a dream note
export const updateDreamNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await DreamNote.findOneAndUpdate(
      { _id: id, userId: req.user.id },   // ✅ FIXED
      req.body,
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note updated", note });
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error });
  }
};

// Delete a dream note
export const deleteDreamNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await DreamNote.findOneAndDelete({
      _id: id,
      userId: req.user.id    // ✅ FIXED
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error });
  }
};
