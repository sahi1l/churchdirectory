function Click(mode) {
    console.debug("Click! ",mode)
    $("section.active").removeClass("active")
    $("header .mode.active").removeClass("active")
    $("section#"+mode+"Panel").addClass("active")
    $("header .mode#"+mode+"Button").addClass("active")
}

function init() {
    $("#editButton").on("click",()=>Click("edit"));
    $("#staffButton").on("click",()=>Click("staff"));
    Click("edit");
    //FIX: Password protect things
}
$(init)
