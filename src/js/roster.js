/*global $*/
import {$$,cmp,randomID} from "./aux.js";
import {$password} from "./password.js";
let fieldnames = [];
let $saving;
import Cookies from "./lib/js.cookie.min.mjs"
    
let roster;
let card;
let IO = new class {
    //Handles saving and loading via express
    constructor() {
        this.loading = true;
    }
    //----------------------------------------
    save(id) {
        if (this.loading) {
            console.log("Busy, didn't save");
            return;
        }
        let family = {...roster.families[id].data}
        $.ajax({
            url: "save",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(family),
            dataType: 'json',
            success: (x) => {
                $saving.addClass("show");
                setTimeout(()=>{$saving.removeClass("show")},500);
            },
            error: (x) => {console.error("Error: ",x);}
        });
    }
    //----------------------------------------
    async load() {
        this.loading = true;
        const response = await fetch("load");
        if (response.ok) {
            let json = await response.json();
	    console.debug(json.debug)
	    json = json.families;
            for (let family of json) {
                roster.add(family);
            }
            roster.populate();
	    try {
		roster.edit(roster.options.filter((x)=>x.listing()!="")[0].id);
	    } catch {
		this.loading = false;
		return;
	    }
        } else {
	    if(response.status != 401) {
		console.error("Load error",response);
	    }

        }
        this.loading = false;
        return true;
    }
}
//============================================================
function Delete() {
    let id = card.id;
    if (confirm(`Do you want to delete this family ${id}?`)) {
        roster.families[id].clear();
        roster.families[id] = undefined;
        $.ajax({
            url: "delete",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({id: id}),
            dataType: "json",
            success: (x) => {
                card.clear();
                roster.populate();
            },
            error: (x) => {
                console.debug("Delete error",x);
            }
        });
    }
}
//============================================================
class Family {
    constructor() {
        this.data = {id:randomID()};
        this.multi = {};
        this.clear();
        this.pull = this.pull.bind(this);
    }
    //----------------------------------------
    pull() {//pull data from the forms
        for (let field of fieldnames) {
            this.data[field] = card.fields[field].get();
        }
        this.multi.names = card.multi.names.get();
        this.multi.contacts = card.multi.contacts.get();
    }
    //----------------------------------------
    push() {//push data to the forms
        card.id = this.data.id;
        for (let field of fieldnames) {
            card.set(field,this.data[field]);
        }
        card.multi.names.set(this.multi.names);
        card.multi.contacts.set(this.multi.contacts);
    }
    //----------------------------------------
    clear() {
        //only clears the fields, NOTHING ELSE
        for (let field of fieldnames) {
            this.data[field] = "";
        }
	
        this.multi = {names: false, contacts: false};
    }
    //----------------------------------------
    listing(which) {
        let first = this.data["firstname"+[which==2?"2":""]];
        let last = this.data["lastname"+[which==2?"2":""]];
        if (last=="") {return ""
        } else {
            return last.toUpperCase() + ", " + first;
        }
    }
}
//========================================
class Roster {
    constructor() {
        this.edit = this.edit.bind(this);
        this.families = {}; //contains Families
        this.$list = $$(".directory")
            .on("input",(e)=>{
                this.edit(this.$list.val())});
        this.add = this.add.bind(this);
        this.new = this.new.bind(this);
        this.options = []; //a list of {listing, id, widget}
        this.populate = this.populate.bind(this);
    }
    clear() {
	this.families = {};
	this.options = [];
	this.$list.html("");
	card.clear();
    }
    add(data) {
        let family = new Family();
        if(data) {
            family.data = {...data};
            family.multi.names = (family.data.firstname2 != "");
            family.multi.contacts = (   (family.data.email2??"") != ""
                                        || (family.data.phone2??"") != "");
        }
        let id = family.data.id;
        for (let i of [1,2]) {
            let nid = id + "-" + String(i);
            this.options.push({id: nid,
                               listing: (f=family,j=i) =>  f.listing(j),
                               multiple: (f=family,j=i) => f.multiple,
                               $option: (f=family,j=i) => {
                                   return $("<option>")
                                       .attr("value",nid)
                                       .html(f.listing(j))
                               }
                              });
        }
        this.families[id] = family;
        card.clear();
        this.$list.val(id);
        $$("#firstname>input").focus()
        return id;
    }
    //----------------------------------------
    new() {
        let id = this.add();
        this.edit(id);
    }
    //----------------------------------------
    edit(id) {
        this.id = id; //this is to keep it highlighted in the listing
        this.$list.val(this.id);
        id = String(id).split("-")[0];
        let family = this.families[id];
        card.id = id;
        for (let field of fieldnames) {
            card.set(field,family.data[field]);
        }
        card.multi.names.set(family.multi.names);
        card.multi.contacts.set(family.multi.contacts);
    }
    //----------------------------------------
    update(id,field,value) {//Roster
        if (this.families[id]) {
            this.families[id].data[field] = value;
            IO.save(id);
            this.populate();
        }
    }
    //----------------------------------------
    sort() {
        this.options.sort((a,b) => cmp(a.listing(), b.listing()));
    }
    //----------------------------------------
    populate() {
        this.sort();
        this.$list.html("")
        //FIX: It would be better to rearrange the options
        for (let item of this.options) {
            if (item.listing() != "") {
                this.$list.append(item.$option())
            }
        }
        if (this.id!=null) {
            if (!this.id.includes("-")) {
                this.id = this.id+"-1";
            }
            this.$list.val(this.id);
        } 
    }
}
//========================================
class Field {
    constructor(id,onUpdate) {
        this.id = id;
        this.$root = $$("#"+id);
        this.onUpdate = onUpdate;
        this.defaultValue = "";
    }
    get() {
        return this.$field.val().trim();
    }
    set(text) {
        this.$field.val(text);
    }
    clear() {
        this.set(this.defaultValue);
    }
}
//========================================
class Input extends Field {
    constructor(id,label,onUpdate,multi=false){
        super(id,onUpdate);
        let $root = this.$root;
        this.register();
        this.$label = $(`<label for=#${id}>`)
            .html(label);
        this.multi = multi;
        if(multi) {
            this.$field = $("<textarea>")
                .attr("placeholder", label)
                .addClass("input")
                .appendTo($root);
        } else {
            this.$field = $("<input type=text>")
                .attr("placeholder", label)
                .addClass("input")
                .appendTo($root);
        }
        if(onUpdate) {
            this.$field.on("change",(e)=>{onUpdate(id,this.get.bind(this)());});
            /*            this.$field.on("keypress", (e)=>{
                          if(e.key==13) {onUpdate(this.get());}})
            */
        }
    }
    register() {
        fieldnames.push(this.id);
    }
}
//========================================
class CheckBox extends Field {
    constructor(id,callback) {
        super(id,callback);
        this.callback = callback;
        this.$field = this.$root;
        this.onChange = this.onChange.bind(this);
        this.$field.on("change",(e) => this.onChange());
        this.onChange();
    }
    onChange(checked){
        if (checked == undefined) {
            checked = this.get()??false;
        }
        if(this.onUpdate) {
            this.onUpdate(checked);
        }
    }
    set(val) {
        this.$field.prop("checked",val);
    }
    get() {
        return this.$field.prop("checked");
    }
}
//========================================
class MultContacts extends Field {
    constructor(id,callback,checkbox) {
        super(id,callback)
        this.checkbox = checkbox;
        this.defaultValue = "";
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
    }
    get() {
        if(this.checkbox.get()) {
            return GetNames(card.family.firstname,card.family.firstname2);
        } else {
            return "";
        }
    }
    set(val) {
        this.checkbox.set(val);
    }
}
//========================================
function GetNames(F1,F2) {
    if (F2!="") {return [F1,F2];}
    for (let splitter of ["&"," and "]) {
        if (F1.includes(splitter)) {
            [F1,F2] = F1.split(splitter);
            return [F1.trim(),F2.trim()];
        }
    }
    return [F1,""];
}
//========================================
class Photo {
    constructor(id,onUpdate) {
        let $root = $$("#"+id);
        this.$root = $root;
        this.$root.on("error", (e) => {
            let src = $(e.target).attr("src");
            if($(e.target).hasClass("reload")) {
                setTimeout(() => {
                     this.$root.attr({src: src})
                    }
                           ,1000);
                $(e.target).removeClass("reload");
            }
        });

        fieldnames.push(id);
        this.id = id;
        this.onUpdate = onUpdate;
        $$("#photoupload").on("change",this.upload.bind(this));
        $$("#deletephoto").on("click",() => {
            this.set.bind(this)();
        }
                            );
    }
    //----------------------------------------
    async upload(e) {
        let tgt = e.target;
        let files = tgt.files;
        let formData = new FormData();
        formData.append("file", files[0]);
        await fetch("upload", {
            method: "POST",
            body: formData
        }).then(res => res.json())
            .then(res => {
                this.$root.addClass("reload");
                this.set(res.path);
            });
    }

    show(path) {
	if(path==undefined || path=="") {
	    path="assets/unknownphoto.jpg";
	}
	this.$root.attr({src:path});
    }
    clear() {
	this.show("");
    }
    set(path) {
        this.onUpdate(this.id,path);
	this.show(path);
    }
    get() {
        return this.$root.attr("src");
    }
}
//========================================
class Card {
    constructor() {
        this.id = 0; //the id of the current display
        this.update = this.update.bind(this);
        this.multi = {};
        this.multi["names"] = new CheckBox("multi-names"); //,(checked) => {this.multiUpdate("names",checked)});
        this.multi["contacts"] = new CheckBox("multi-contacts");//, (checked) => {this.multiUpdate("contacts",checked)});
        this.fields = {
            firstname: new Input("firstname", "First Names", this.update),
            lastname: new Input("lastname", "Last Name", this.update),
            firstname2: new Input("firstname2", "First Name", this.update),
            lastname2: new Input("lastname2", "Last Name", this.update),
            children: new Input("children", "Children", this.update),
            address: new Input("address", "Address", this.update, true),
            phone: new Input("phone", "Phone", this.update),
            email: new Input("email", "Email", this.update),
            phone2: new Input("phone2", "Phone", this.update),
            email2: new Input("email2", "Email", this.update),
            photo: new Photo("photo", this.update),
        }
    }
//    multiUpdate(field,value) {
//        return;
/*        value=value??false;
        console.debug("multiUpdate",field,value);
        if(field=="names") {
            //if checked, then show #name2, hide #multiple>span
            $("#name2").children(".entry").toggle(value);
            $("#multiple>span").toggle(!value);
        } else if (field=="contacts") {
            //hide #multiplecontacts>span, show #phone2 and email2, 
            $("#contact").toggleClass("checked",value);
            }
*/
//    }
    clear() {
        for(let field of Object.values(this.fields)) {
            field.clear();
        }
        $$("#firstname>input").focus()
        $$("#contact .header").html("&nbsp;");
    }
    get(field,value) {
        return this.fields[field].get();
    }
    set(field,value) {
        this.fields[field].set(value);
    }
    update(field,value) {//card
        roster.update(this.id, field, value??"");
        let first1=this.get("firstname"),
            first2=this.get("firstname2");
        [first1,first2] = GetNames(first1,first2);
/*        if (first2=="" && first1.includes("&")) {
            [first1,first2] = first1.split("&");
        }*/
        $$("#contact1").html(first1);
        $$("#contact2").html(first2);
    }
}
//========================================
function init() {
    roster = new Roster();
    card = new Card();
    let family = new Family();
    $saving = $("#saving");
    $$("#new").on("click",roster.new);
    $$("#delete").on("click",Delete);
    $password.on("re-load",()=>{
	console.debug("re-load");
	roster.clear();
	IO.load();
    });
    $password.on("un-load",()=>{
	console.debug("un-load");
	roster.clear();
	roster.add();
    });
}

$(init)
