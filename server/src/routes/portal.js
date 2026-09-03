const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const portalOnly = require('../middleware/portal');
const { getOverview } = require('../controllers/portalController');
const router = express.Router();
router.use(authMiddleware, portalOnly);
router.get('/overview', getOverview);
module.exports = router;
