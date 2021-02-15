$(document).ready(() => {
	M.AutoInit();
	sessionStorage.setItem("edit", false);

	if ($(window).width() >= 600) {
		$("#drawing-list-section").height($("#canvas-section").height());
	} else {
		$("#drawing-list-section").height(150);
		console.log($("#drawing-list-section").height());
	}
});

$(window).resize(() => {
	$("#myCanvas").css({ width: "100%", height: "100%" });

	if ($(window).width() >= 600) {
		$("#drawing-list-section").height($("#canvas-section").height());
	} else {
		$("#drawing-list-section").height(150);
		console.log($("#drawing-list-section").height());
	}
});

const loadImage = new Event("load-image");
const clearCanvas = new Event("clear-canvas");
const saveButton = $("#saveButton");
const titleEl = $("#drawing-title");
const canvasDrawingTitle = $("#canvas-drawing-title");

// ---------- EVENT HANDLERS ------------->
// Creating new drawings; reference createElement() below.
$("#saveButtonModal").on("click", () => {
	const title = titleEl.val().trim();
	const body = window._json;
	const editMode = sessionStorage.getItem("edit");

	if (editMode !== "true") {
		$.post("/api/drawings", { title, body }).then(data => {
			createElement(data.title, data.id);
			// Reload if no drawings were previously saved
			if (!$("#drawing-list").length) {
				location.reload();
			}
			document.dispatchEvent(clearCanvas);
		});
	} else if (editMode) {
		const id = sessionStorage.getItem("current-drawing");

		$.ajax({
			url: `/api/drawings/${id}`,
			data: { title, body },
			type: "PUT",
		}).then(() => {
			$(`[data-id=${id}]`)
				.attr("data-title", title)
				.children("span")
				.text(title);

			setSession(false);
			canvasDrawingTitle.text("");
			document.dispatchEvent(clearCanvas);
		});
	}
	titleEl.val("");
});

// Clear the canvas
$("#clearButton").on("click", () => {
	const clearCanvas = new Event("clear-canvas");
	canvasDrawingTitle.text("");
	setSession(false);
	document.dispatchEvent(clearCanvas);
});

// Deleting drawings
$(document).on("click", ".delete-note", event => {
	event.stopPropagation();
	let $this = event.currentTarget;
	let drawingId = $this.dataset.id;
	let listEl = $this.parentElement;

	$.ajax({
		url: "/api/drawings/" + drawingId,
		type: "DELETE",
	}).then(() => {
		listEl.remove();

		// Reload if no drawings remain in the list;
		if (!$("#drawing-list").children().length) {
			location.reload();
		} else if (drawingId === sessionStorage.getItem("current-drawing")) {
			// Clear session and drawing title if rendered drawing is deleted
			canvasDrawingTitle.text("");
			document.dispatchEvent(clearCanvas);
			setSession(false);
		}
	});
});

// Render drawing to canvas
$(document).on("click", "#drawing-list li", event => {
	let $this = $(event.currentTarget);
	const id = $this.attr("data-id");
	const title = $this.attr("data-title");
	canvasDrawingTitle.text(title);
	setSession(true, title, id);

	$.get(`/api/drawings/${id}`, data => {
		window._json = data.body;
		document.dispatchEvent(loadImage);
	});
});

// ---------- FUNCTIONS ------------->
const createElement = (title, id) => {
	const $li = $("<li>")
		.attr("data-id", id)
		.attr("data-title", title)
		.addClass("list-item");
	const $span = $("<span>").addClass("lobster").text(title);

	const $i = $("<i>")
		.addClass("fas fa-trash-alt delete-note right")
		.attr("data-id", id)
		.attr("data-title", title);

	$li.append($span).append($i);
	$("#drawing-list").append($li);
};

const setSession = (edit, title, id) => {
	sessionStorage.setItem("edit", edit);

	if ((title && !id) || (!title && id)) {
		console.error(
			"setSession() cannot have only a title or only an id. Must have both or none"
		);
	} else if (edit) {
		sessionStorage.setItem("current-title", title);
		sessionStorage.setItem("current-drawing", id);
		titleEl.val(title);
		saveButton.html(`
		<i class="material-icons right" style='margin-right: 15px'>save</i>Update`);
	} else if (!edit && title && id) {
		sessionStorage.setItem("current-title", title);
		sessionStorage.setItem("current-drawing", id);
		titleEl.val("");
		saveButton.html(`
		<i class="material-icons right" style='margin-right: 15px'>save</i>Save`);
	} else {
		sessionStorage.setItem("current-title", null);
		sessionStorage.setItem("current-drawing", null);
		titleEl.val("");
		saveButton.html(`
		<i class="material-icons right" style='margin-right: 15px'>save</i>Save`);
	}
};
