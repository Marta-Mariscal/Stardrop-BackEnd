const express = require('express')
const fs = require("fs")
const mime = require('mime-types')
const User = require('../models/user')
const auth = require('../middleware/auth')
const upload = require('../controller/upload')
const router = new express.Router()

router.post('/users/signup', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({data: { user, token }, error: null})
    } catch (e) {
        console.log(e)
        res.status(400).send({data: null, error: {status: 400, message: 'Invalid signup', exception: e}})
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({data: { user, token }, error: null})
    } catch (e) {
        res.status(400).send({data: null, error: {status: 400, message: 'Invalid login credentials', exception: e}})
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send({data: { message: 'Logout successful' }, error: null})
    } catch (e) {
        res.status(500).send({data: null, error: {status: 500, message: 'Logout failed', exception: e}})
    }
})

//postman
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({data: { message: 'Logout all successful' }, error: null})
    } catch (e) {
        res.status(500).send({data: null, error: {status: 500, message: 'Logout All failed', exception: e}})
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send({data: { user: req.user }, error: null})
})

// postman
router.patch('/users/me', auth, upload.single("icon"), async (req, res) => {
    const newUser = JSON.parse(req.body.user)
    const updates = Object.keys(newUser)

    if (req.file) {
        updates.push("icon")
        newUser.icon = req.file.path
    }

    try {
        updates.forEach((update) => req.user[update] = newUser[update])
        await req.user.save()
        res.send({data: { user: req.user }, error: null})
    } catch (e) {
        res.status(400).send({data: null, error: {status: 400, message: e.message, exception: e}})
    }
})

// postman
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send({data: { user: req.user }, error: null})
    } catch (e) {
        res.status(500).send({data: null, error: {status: 500, message: 'Delete user failed', exception: e}})
    }
})

router.get('/assets/:id/imgs/:imageName', async (req, res) => {
    const _id = req.params.id
    const imageName = req.params.imageName

    try {
        const imagePath = `./assets/${_id}/imgs/${imageName}`

        if(fs.existsSync(imagePath)) {
            const file = fs.createReadStream(imagePath)
            const mimeType = mime.lookup(imagePath)
            res.setHeader('Content-Type', mimeType)
            file.pipe(res)
        } else {
            res.status(404).send({data: null, error: {status: 404, message: 'Image not found'}})
        }
    } catch (e) {
        res.status(500).send({data: null, error: {status: 500, message: e.message, exception: e}})
    }
})

module.exports = router