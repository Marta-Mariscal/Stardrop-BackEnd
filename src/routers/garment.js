const express = require('express')
const multer = require('multer')
const Garment = require('../models/garment')
const auth = require('../middleware/auth')
const router = new express.Router()

// Crear prenda
router.post('/garment', auth, async (req, res) => {
    const garment = new Garment({
        ...req.body,
        owner: req.user._id
    })

    try {
        await garment.save()
        res.status(201).send({ data: { garment }, error: null })
    } catch (e) {
        res.status(400).send({ data: null, error: { status: 400, message: 'Create garment failed', exception: e } })
    }
})

// Obtener todas las prendas del usuario autenticado
router.get('/garment', auth, async (req, res) => {
    try {
        const garments = await Garment.find({ owner: req.user._id })
        res.send({ data: { garments }, error: null })
    } catch (e) {
        res.status(500).send({ data: null, error: { status: 500, message: 'Fetch garments failed', exception: e } })
    }
})

// Obtener todas las prendas (para propósitos de administración)
router.get('/garment/allGarments', auth, async (req, res) => {
    try {
        const garments = await Garment.find({})
        res.send({ data: { garments }, error: null })
    } catch (e) {
        res.status(500).send({ data: null, error: { status: 500, message: 'Fetch all garments failed', exception: e } })
    }
})

// Eliminar una prenda por ID
router.delete('/garment/:id', auth, async (req, res) => {
    try {
        const garment = await Garment.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!garment) {
            return res.status(404).send({ data: null, error: { status: 404, message: 'Garment not found' } })
        }

        res.send({ data: { garment }, error: null })
    } catch (e) {
        res.status(500).send({ data: null, error: { status: 500, message: 'Delete garment failed', exception: e } })
    }
})

// Configuración de subida de imagen
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

// Subir imagen a prenda
router.post('/garment/:id/image', auth, upload.single('image'), async (req, res) => {
    try {
        const garment = await Garment.findOne({ _id: req.params.id, owner: req.user._id })

        if (!garment) {
            return res.status(404).send({ data: null, error: { status: 404, message: 'Garment not found' } })
        }

        garment.image = req.file.buffer.toString('base64') // guardado como string base64
        await garment.save()
        res.send({ data: { message: 'Image uploaded successfully' }, error: null })
    } catch (e) {
        res.status(400).send({ data: null, error: { status: 400, message: 'Image upload failed', exception: e } })
    }
}, (error, req, res, next) => {
    res.status(400).send({ data: null, error: { status: 400, message: 'Multer error', exception: error.message } })
})

// Eliminar imagen de una prenda
router.delete('/garment/:id/image', auth, async (req, res) => {
    try {
        const garment = await Garment.findOne({ _id: req.params.id, owner: req.user._id })

        if (!garment) {
            return res.status(404).send({ data: null, error: { status: 404, message: 'Garment not found' } })
        }

        garment.image = undefined
        await garment.save()
        res.send({ data: { message: 'Image deleted successfully' }, error: null })
    } catch (e) {
        res.status(500).send({ data: null, error: { status: 500, message: 'Delete image failed', exception: e } })
    }
})

// Obtener imagen de una prenda por ID
router.get('/garment/:id/image', async (req, res) => {
    try {
        const garment = await Garment.findById(req.params.id)

        if (!garment || !garment.image) {
            throw new Error('No image found')
        }

        const img = Buffer.from(garment.image, 'base64')
        res.set('Content-Type', 'image/png')
        res.send(img)
    } catch (e) {
        res.status(404).send({ data: null, error: { status: 404, message: 'Image not found', exception: e } })
    }
})

module.exports = router
