/*global $**/
/*THIS IS THE COMMAND TO GENERATE THE DIRECTORY*/
import Cookies from "./lib/js.cookie.min.mjs"
let $password,$pwdDialog;
let $page = {};
let pagenumber = -1;
let booklet = false;
let cards = [];
async function Load() {
    const response = await fetch("load");
    if (response.ok) {
        const json = await response.json();
	console.debug(json);
        $pwdDialog.removeClass("show");
        Generate(json);
    } else {
        $pwdDialog.addClass("show");
        $password.addClass("error");
        console.error("Load Error");
    }
}

class Card {
    //Stores the information of one family
    constructor(family, swap=false) {
        this.data = family;
        this.$card = $("<family-card>").addClass("family");
        let $w = $("<div>").appendTo(this.$card);
        let names = [family.firstname, family.lastname, family.firstname2, family.lastname2];
        let contacts = [family.phone, family.email, family.phone2, family.email2];
        let F1,L1,F2,L2;
        let P1,E1,P2,E2;
        if (swap) {
            [F2,L2,F1,L1] = names;
            [P2,E2,P1,E1] = contacts;
        } else {
            [F1,L1,F2,L2] = names;
            [P1,E1,P2,E2] = contacts;
        }
        if (F1!="") {
            this.sort = L1+","+F1;
            this.name(F1,L1).appendTo($w);
            if(F2!="") {this.name(F2,L2).appendTo($w);}
            $("<div>")
                .addClass("children")
                .html(family.children)
                .appendTo($w);
            
            let $contact = $("<div>").addClass("contact").appendTo($w);
            $("<div>")
                .addClass("address")
                .html(family.address.replace("\n","<BR>\n"))
                .appendTo($contact);
            if((family.phone2??"") == "" && (family.email2??"") == "") {
                $("<div>")
                    .addClass("phone")
                    .html(family.phone)
                    .appendTo($contact);
                $("<div>")
                    .addClass("email")
                    .html(family.email)
                    .appendTo($contact);
            } else {
                if (F2=="" && F1.includes("&")) {[F1,F2] = F1.split("&")}
		else if (F2=="" & F1.includes(" and ")) {
		    [F1,F2] = F1.split(" and ");
		}
                let $C1 = $("<div>").addClass("Crow").appendTo($contact);
                $("<span>").addClass("Cname").html(F1.trim()).appendTo($C1);
                $("<span>").addClass("Cphone").html(P1).appendTo($C1);
                $("<span>").addClass("Cemail").html(E1).appendTo($C1);
                let $C2 = $("<div>").addClass("Crow").appendTo($contact);
                $("<span>").addClass("Cname" ).html(F2.trim()).appendTo($C2);
                $("<span>").addClass("Cphone").html(P2).appendTo($C2);
                $("<span>").addClass("Cemail").html(E2).appendTo($C2);
            }
	    if(family.photo == "") {
		family.photo = "assets/unknownphoto.jpg"
	    }
            this.$img = $("<img>")
                .addClass("photo")
                .attr({"src":family.photo, "alt": ""})
                .prependTo(this.$card);
        } else {
            this.delete = true;
            this.data = {};
        }
        
    }
    name(first,last) {
        let $w = $("<div>").addClass("name").html(first+" ");
        let $last = $("<span>").addClass("last").html(last).appendTo($w);
        return $w;
    }
}
function cmp(a,b) {
    if (a<b) {return -1;}
    if (a>b) {return 1;}
    return 0;
}

function Generate(data) {
    console.debug("Generate");
    cards = [];
    for (let family of data.families) {
        cards.push(new Card(family));
        cards.push(new Card(family,true));
    }
    cards = cards.filter((card)=>!card.delete);
    cards.sort((a,b)=>cmp(a.sort,b.sort))
    let N = cards.length;
    $page = {};
    $page[0] = CoverPage(data.info);
    $page[1] = StaffPage(data.staff);
    pagenumber = 1;
    for (let n=0; n<N; n++) {
        if(n%4==0) {
            pagenumber++;
            $page[pagenumber] = $(`<dir-page data-page=${pagenumber}>`).appendTo($main);
        }
        $page[pagenumber].append(cards[n].$card);
    }
    for (let pg of Object.keys($page)) {
        let page = $page[pg];
        $("<footer>").html(parseInt(pg)+1).appendTo(page);
    }
    Layout()
}
function Empty() {
    let $page = $("<dir-page>").addClass("empty").html("<family-card></family-card>");
//    $("<img>").attr("src","interstitial.png").attachTo($page);
    return $page
}
function CoverPage(listofinfo) {
    let info = {
	church: "",
	address: "",
	services: "",
	officehours: ""
    };
    for (let element of listofinfo) {
	info[element.name] = element.value;
    }
    document.title = info.church + " Directory";

    let $cover = $("<dir-page>").addClass("cover");
    $("<h1>").appendTo($cover).html(`${info.church} Directory`);
    $("<img>").appendTo($cover).attr({src: "assets/coverphoto.jpg", alt:""});
    let $div = $("<div>").appendTo($cover).addClass("subtext")
    $('<div class="address">').appendTo($div).html(info.address.replaceAll("\n","<BR>"));
    $('<div class="hours">').appendTo($div).html(`<table><tr>
<th>Holy Eucharist:</th><td>${info.services}</td>
</tr><tr>
<th>Office Hours:</th><td>${info.officehours}</td>
</tr>`)
    $("<h2>").appendTo($cover).html(
	new Date().toLocaleDateString('en-US',{month: "long",day: "numeric", year: "numeric"})
    );
    return $cover;
}
function StaffPage(data) {
    let $staff = $("<dir-page>").addClass("staff");
    let $list = null;
    let ndata = [];
    let tosort = [];
    for (let row of [...data,{title: null}]) {
	if (row.title == "" && row.name != null) {
	    console.debug(row.name);
	    tosort.push(row);
	} else {
	    if(tosort.length) {
		console.debug(tosort);
		tosort = tosort.sort((a,b) => {
		    let aLN = a.name.trim().replace(/^(.*) ([^ ]*)$/,(x,y,z)=>z+","+y);
		    let bLN = b.name.trim().replace(/^(.*) ([^ ]*)$/,(x,y,z)=>z+","+y);
		    console.debug(aLN);
		    console.debug(bLN);
		    if(aLN<bLN) {return -1;}
		    if(aLN>bLN) {return 1;}
		    return 0;
		});
		console.debug(tosort);
		ndata = [...ndata, ...tosort];
		tosort = [];
	    }
	    if(row.title!=null) {ndata.push(row);}
	}
    }
    for (let row of ndata) {
	if (row.name == null) {
	    $list=$("<table>").appendTo($staff)
	    let header = row.section
	    $("<caption>").html(header).appendTo($list);
	} else {
	    let $row = $("<tr>").appendTo($list)
	    let $title = $("<td class='title'>").appendTo($row).append($("<span>").html(row.title))
	    let $name = $("<td class='name'>").appendTo($row).append($("<span>").html(row.name))
	    let $contact = $("<td class='contact'>").appendTo($row).append($("<span>").html(row.email)).addClass("email");
	    if (row.title) {
		$title.addClass("leaders");
	    }
	    if (row.email) {
		$name.addClass("leaders");
	    }
	}
    }
    $("<div>").appendTo($staff);
    console.debug($staff)
    return $staff;
}
function Layout() {
    $main.toggleClass("booklet",booklet);
    if(booklet) {
	$("#landscape").html("@page {size: landscape}");
    } else {
	$("#landscape").html("@page {size: portrait}");
    }
    if (booklet) {
        let L = Object.keys($page).length;
        let C = Math.ceil(L/4);
        let n = 4*C-1;
        console.debug("A booklet",L,C,n);
        for (let i=0; i<=  2*C-1; i++) {
            let L,R;
            [L,R] = [i,n-i];
            if (i%2==0) {[L,R] = [R,L];}
	    let LPage = $page[L]??Empty();
	    let RPage = $page[R]??Empty();
            console.debug("page ",L,LPage);
            console.debug("page ",R,RPage);
            $main.append(LPage);
            $main.append(RPage);
        }
	console.debug($page);
    } else {
        console.debug("Not a booklet");
        $(".empty").remove();
        for (let i=0; i<=pagenumber; i++) {
            console.debug("page ",i);
            $main.append($page[i]);
        }
    }
}
let $main;
let cookie = "churchdirectoryRead";
function CheckPassword() {
    let password = $password.val();
    console.debug("Changing password to",password);
    if (password=="") {
        password = Cookies.get(cookie);
    } else {
        Cookies.set(cookie,password);
    }
    Load();
}
function init() {
    $main = $("section#dirPanel>#content");
    $password = $("section#dirPanel #password");
    $pwdDialog = $("section#dirPanel #passworddialog");
    Load();
    $("#booklet")[0].checked = booklet;
    $("#booklet").on("change",(e)=>{
        booklet = e.target.checked;
        Layout();
    })
    $password.on("keypress",()=>{$password.removeClass("error");});
    $password.on("change",CheckPassword);        
}

$(init)
