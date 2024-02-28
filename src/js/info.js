class PhotoAsset {
    constructor(name,title) {
	this.name = name;
        this.$root = $("<label>");
	this.$text = $("<caption>").html(title).appendTo(this.$root)
	this.src = `assets/${name}`;
        this.$img = $("<img>").attr({alt: title, src: this.src}).appendTo(this.$root);
        this.$div = $("<div>").addClass("changephoto").appendTo(this.$root);
        this.$input = $("<input>").attr({name: "file",
                                      type: "file",
                                      accept: "image/*"}).appendTo(this.$div);
        this.$button = $("<button>").html("Leave Blank")
	    .on("click",this.delete.bind(this))
            .addClass("deletephoto").appendTo(this.$div);
        this.$root.appendTo($("#assets"));
	this.$input.on("change",this.upload.bind(this));
    }
    async upload(e) {
	let tgt = e.target;
	let files = tgt.files;
	let formData = new FormData();
	let FILE = files[0]
	FILE.target = this.name;
	formData.append("file", FILE) //files[0])
	//formData.target = this.name;
	formData.append("target", this.name);
	fetch(`uploadasset?target=${this.name}`, {
	    method: "POST",
	    body: formData
	}).then(
	    res => {
		res.text()
	    })
	    .then(res => {
		this.reload();
	    })
	    .catch(res=>{
		console.debug("Error",res)
	    })
	    .finally(()=>{console.debug("done")});
    }
    delete() {
	fetch(`deleteasset?target=${this.name}`, {
	    method: "POST",
	}).then(
	    res => {
		this.$img.attr({src:""});
		   }
	)
	    .catch(res=> {console.debug("Error",res)
			 })
    }
	      
    reload() {
	this.$img.attr({src: this.src+"?"+new Date().getTime()});
	//force the image to reload
    }
}
function init() {
    new PhotoAsset("coverphoto.jpg","Cover Photo");
    new PhotoAsset("interstitial.png","For Blank Pages");
    new PhotoAsset("unknownphoto.jpg","Families Without Photos");
}
$(init)
