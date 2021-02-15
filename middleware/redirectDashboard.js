module.exports = (req, res, next) => {
	// if the user is logged in, they will be redirected to the dashboard page
	if (req.user) {
		return res.redirect("/dashboard");
	}
	// if the user is logged in, perform the callback
	next();
};
