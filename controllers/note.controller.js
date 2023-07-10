
const NoteModel = require("../models/note.model")



exports.createNote = async (req, res) => {
    try {
        const { notes, exam } = req.body
        for (var element of notes) {
            var note = await NoteModel.findOneAndUpdate({ examen: exam, student: element._id }, { note: element.note })
            if (!note) {
                note = await NoteModel.create({ examen: exam, student: element._id, note: element.note })
                await note.save()
            }
        }
        return res.status(201).json({ created: true })
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).send({
                error: "conflictNote"
            })
        }
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}



exports.getExamNotes = async (req, res) => {
    try {
        const { examId } = req.params
        const notes = await NoteModel.find({ examen: examId })
        if (notes.length === 0)
            return res.status(204).json([])
        else
            return res.status(200).json(notes)
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}