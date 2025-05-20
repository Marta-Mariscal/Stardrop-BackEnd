const express = require('express')
const Order = require('../models/order')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/order', auth, async (req, res) => {
    const order = new Order({
        ...req.body,
        owner: req.user._id
    })

    try {
        await order.save()
        res.status(201).send({ data: { order }, error: null })
    } catch (e) {
        res.status(400).send({ data: null, error: { status: 400, message: 'Create order failed', exception: e } })
    }
})

module.exports = router
