let initiating=true;
let numberspacing=256;
let $saving;
function $$(x) {
    let str="section#staffPanel "+x;
    let result=$(str);
    return result;
}
function $i(x) {
    let str="section#infoPanel "+x;
    let result=$(str);
    return result;
}    
function hash() {
    return Math.random().toString(16).slice(2) 
}
class Row {
    constructor(root,position) {
	let template = `
    <div class="sectionQ">
      <label class="switch">
	<input type="checkbox">
	<span class="slider"></span>
      </label>
    </div>
`;
	this.$w = $("<div>").addClass("row").attr("data-pos",position).appendTo(root);
	this.$switch = $("<div>").addClass("sectionQ").html(template).appendTo(this.$w);
	this.$sectionQ = $(this.$switch[0].querySelector("input"));
	this.$section = this.makeInput("sectionname","Section Name");
	this.$title = this.makeInput("title","Title");
	this.$name = this.makeInput("name","Name");
	this.$email = this.makeInput("email","Email");
	this.$insert = $("<button>").html("Insert ↑").appendTo(this.$w).on("click",(e,that=this)=>InsertBefore(that));
	this.$delete = $("<button>").html("Delete").appendTo(this.$w).on("click",()=>this.Delete());
	this.$pos = $("<span>").addClass("pos").html(position);//.appendTo(this.$w);
	this.position = position;
	this.hash = hash();
    }
    makeInput(className, placeholder) {
	let $obj = $("<input>").addClass(className).addClass("returnable").attr("placeholder",placeholder).appendTo(this.$w);
	$obj.on("change",(e)=>this.save());
	$obj.on("keypress",(e,that=this)=>Move(e,that));
	return $obj;
    }
    renumber(num) {
	this.position = num;
	this.$pos.html(num);
	this.save();
	//call sql too, using the hash
    }
    isHeader() {
	return this.$sectionQ.prop("checked")
    }
    Delete() {
	rows = rows.filter((a)=>a.position != this.position);
	this.$w.remove();
	this.save(true);
    }
    setup(item) {
	this.$sectionQ.prop("checked",item.name===null)
	if(item.hash) {this.hash = item.hash;}
	if(item.section) {this.$section.val(item.section);}
	if(item.title) {this.$title.val(item.title);}
	if(item.name) {this.$name.val(item.name);}
	if(item.email) {this.$email.val(item.email);}
	if(item.position) {this.position=item.position; this.$pos.html(this.position);}
    }
    save(del=false) {
	let item = {section: this.$section.val(),
		    hash: this.hash,
		    position: this.position,
		    name: (this.isHeader()?null:this.$name.val()),
		    title: this.$title.val(),
		    email: this.$email.val()
		   };
	if(del) {
	    item.del = true;
	}
	$.ajax({
	    url: "savestaff",
	    type: "POST",
	    contentType: "application/json",
	    data: JSON.stringify(item),
	    dataType: 'json',
	    success: (x) => {
		$saving.addClass("show");
		setTimeout(()=>{$saving.removeClass("show")},500);
	    },
	    error: (x)=>{console.error("Error: ",x);}
	});
	//call ajax to save this row to the database
	//if the row is empty, ignore
    }
}
function Move(e,w) {
    if(e.key == "Enter") {
	let returnables = $$("input.returnable");
	let idx = [...returnables].indexOf(e.target);
	let dir = e.shiftKey?-1:1;
	let nidx = idx;
	while (true) {
	    nidx += dir;
	    nidx = (nidx + returnables.length)%returnables.length;
	    let tgt = returnables[nidx];
	    if($(tgt).is(":visible")) {
		tgt.focus();
		return;
	    }
	}
    }	
}
function InsertBefore(which) {
    let idx = rows.indexOf(which);
    let pos2 = which.position;
    let pos1;
    if(idx==0) {
	pos1 = 0;
    } else {
	pos1 = rows[idx-1].position;
    }
    let newpos = Math.round((pos1+pos2)/2);
    let newrow = new Row($root,newpos);
    rows.splice(idx,0,newrow);
    newrow.$w.insertBefore(which.$w);
    newrow.$title.focus();
    if(newpos==pos1 || newpos==pos2) {
	Renumber();
    }
}
function Clear() {
    $("#staffPanel #info input").val("");
    
    $("#staffPanel .row:not(.header)").remove();
}
async function Load() {
    const response = await fetch("load");
    if (response.ok) {
	const json = await response.json();
	Populate(json.staff);
	InfoPopulate(json.info);
	initiating=false;
	window.scrollTo(0,0);
    //call fetch to get everything
    //Add rows as needed
    } else {
	console.error("Staff Load Error");
    }
}
function InfoPopulate(data) {
    for (let entry of data) {
	let $w = $i("#"+entry.name);
	$w.val(entry.value);
	$w.on("change",()=>UpdateInfo($w,entry.name));
    }
    console.debug(data);
    $("h1").html($i("#church").val()+" Directory");
    $("title").html($i("#church").val()+" Directory");
}
function UpdateInfo($w,name) {
    let value = $w.val();
    $("h1").html($i("#church").val()+" Directory");
    $.ajax({
	url: "saveinfo",
	type: "POST",
	contentType: "application/json",
	data: JSON.stringify({name: name, value: value}),
	dataType: "json",
	success: (x) => {
	    $saving.addClass("show");
	    setTimeout(()=>{$saving.removeClass("show")},500);
	},
	error: (x)=>{console.error("UpdateInfo Error: ",x);}
    });
    
}
function Populate(data) {
    for (let item of data) {
	let row = AddRow();
	row.setup(item);
    }
}
function Renumber() {
    let i=numberspacing;
    for(let row of rows) {
	row.renumber(i);
	i+=numberspacing;
    }
}
let $root;
let rows = [];
function AddRow(pos) {
    if(pos===undefined) {
	pos=(rows.length+1)*numberspacing;
    }
    let row = new Row($root,pos);
    rows.push(row);
    if(!initiating) {
	row.$title.focus();
    }
    return row;
}

//========================================
let dialog;
function ChangePassword(mode) {
    dialog.showModal();
    dialog.mode = mode;
    let modetext = mode[0].toUpperCase()+mode.slice(1);
    $i("#whichpassword").html(modetext);
}
function SubmitPassword() {
    let oldP = $i("#oldpassword").val();
    let newP = $i("#newpassword").val();
    let rnwP = $i("#renewpassword").val();
    if(newP != rnwP) {
        //passwords don't match, say something about that
        return;
    }
    let data = {mode: dialog.mode,
                oldP: oldP,
                newP: newP};
    console.debug(data);
    //send a post to /pwdupdate. react accordingly
    dialog.close();
}
//============================================================
function init() {
    $root = $$("#entry");
    $saving = $("#saving");
    dialog = $i("dialog")[0];
    $("#password").on("re-load",()=>{Load();});
    $("#password").on("un-load",()=>{Clear();});
    $$("#newrow").on("click",()=>AddRow());
    $i("#passwords>#viewing").on("click",()=>ChangePassword("view"));
    $i("#passwords>#editing").on("click",()=>ChangePassword("edit"));
    $i("dialog #Cancel").on("click",()=>dialog.close());
    $i("dialog #OK").on("click",SubmitPassword);
}
$(init);
