const express = require('express');
const router = express.Router();

const haveManga = require('./haveManga');
const uploadManga = require('./uploadManga');

router.use('/haveManga', haveManga);
router.use('/uploadManga', uploadManga);

module.exports = router;
