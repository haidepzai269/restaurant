const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.controller");

router.get("/", controller.getNotifications);
router.put("/:id/read", controller.markAsRead);
router.delete("/:id", controller.deleteNotification);

module.exports = router;
