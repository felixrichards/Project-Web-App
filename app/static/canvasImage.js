var canvasImage = document.getElementById("canvasImage");
var ctx = canvasImage.getContext("2d");
var galaxy=new Image();
galaxy.onload=function(){
    init();
};

galaxy.src={{file.filename}};

// Makes w/h of canvas same as image
function init(){
    var img = document.getElementById("galaxy");
    canvasImage.width=galaxy.width;
    canvasImage.height=galaxy.height;
    ctx.drawImage(galaxy, 0, 0);
}
