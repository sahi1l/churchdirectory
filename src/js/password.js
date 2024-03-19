import Cookies from "./lib/js.cookie.min.mjs"
import {Click} from "./edit.js"
let cookie = "churchdirectoryEdit";
export let $password;
let event = new Event("re-load");
async function UpdatePassword() {
    console.debug("updating password");
    let password = $password.val();
    if(password=="") {
	password = Cookies.get(cookie);
    } else {
	Cookies.set(cookie, password);
    }
    let ok = await fetch("canedit");
    if (ok.ok) {
	console.debug("ok");
	$("body").addClass("loggedin");
	Click("edit");
	$("#logout").show();
	$password.addClass("right");
	$password.trigger("re-load");
    } else {
	Logout();
    }
}
function Logout() {
    $("body").removeClass("loggedin");
    $password.val("");
    Cookies.set(cookie,"");
    $password.removeClass("right");
    $password.trigger("un-load");
    $("#logout").hide();
    Click("logout");
}
function init() {
    $password = $("#password");
    $password.on("change",UpdatePassword);
    $password.on("focusOut",UpdatePassword);
    
    $("#logout").on("click",Logout);
    setTimeout(UpdatePassword,100);
}
$(init)
