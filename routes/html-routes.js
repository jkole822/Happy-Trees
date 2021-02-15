const db = require("../models");
const requireLogin = require("../middleware/requireLogin");
const redirectDashboard = require("../middleware/redirectDashboard");

module.exports = app => {
	app.get("/", redirectDashboard, (req, res) => {
		res.render("landing");
	});

	app.get("/dashboard", requireLogin, async (req, res) => {
		const drawings = await db.Drawing.findAll({
			where: { UserId: req.user.dataValues.id },
			include: [db.User],
		});
		res.render("dashboard", { drawings });
	});
};
