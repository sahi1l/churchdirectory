class Asset {
    constructor(name) {
        let $root = $("label");
        let $img = $("img").attr({src: `assets/${name}.jpg`}).appendTo($root);
        let $div = $("div").addClass("changephoto").appendTo($root);
        let $input = $("input").attr({name: "file",
                                      type: "file",
                                      accept: "image/*"}).appendTo($div);
        let $button = $("button").html("Delete")
            .addClass("deletephoto").appendTo($div);
        $root.appendTo($("#assets"));
    }
}
function init() {
    new Asset("coverphoto");
    new Asset("interstitial");
    new Asset("unknownphoto");
}
