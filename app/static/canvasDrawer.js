// Setup
var canvasDraw = document.getElementById("canvasDraw");
var ctx = canvasDraw.getContext("2d");
var element=window;
init()

// Handles mouse activity for shape drawing
var flag=1;
element.addEventListener("mousedown", function(e){
    mP_0=getMousePos(canvasDraw,e);
    // Check user is clicking canvas
    if (mP_0.x>0&&mP_0.x<424&&mP_0.y>0&&mP_0.y<424){
        flag = 0;
        t_0=e.timeStamp;
    }
}, false);
element.addEventListener("mousemove", function(e){
    if (flag===0){
        mP=getMousePos(canvasDraw,e);
        t=e.timeStamp;
        // Check user is dragging (150 was chosen from experiments)
        if (t-t_0>150){
            resetCanvas();
            drawShape(mP_0.x,mP_0.y,mP.x-mP_0.x,mP.y-mP_0.y);
        }
    }
}, false);
element.addEventListener("mouseup", function(e){
    flag=1;
}, false);

function resetCanvas(){
    clrCanvas();
    init();
}

// Makes w/h of canvas same as image
function init(){
    var background = document.getElementById("canvasImage");
    canvasDraw.width=background.width;
    canvasDraw.height=background.height;
}

function clrCanvas(){
    ctx.clearRect(0,0,canvasDraw.width,canvasDraw.height);
}

// Returns mouse position relative to (passed) canvas
function getMousePos(canvasDraw, evt) {
    var rect = canvasDraw.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

// Chooses the shape to draw
function drawShape(x0,y0,x,y){
    var fn=window["draw"+state.shape];
    if(typeof fn === 'function') {
        fn(x0,y0,x,y);
    }
}

// Draws rectangle with given parameters
function drawRect(x0,y0,x,y){
    ctx.rect(x0,y0,x,y);
    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    ctx.fill();
}

// Draws circle with given parameters
function drawCircle(x0,y0,x,y){
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    ctx.arc(x0+x/2,y0+y/2,Math.sqrt(Math.pow(x/2,2)+Math.pow(y/2,2)),0,2*Math.PI);
    //ctx.arc(x0,y0,Math.sqrt(Math.pow(x,2)+Math.pow(y,2)),0,2*Math.PI);
    ctx.fill();
}

// Draws circle with given parameters
function drawEllipse(x0,y0,x,y){
    ctx.beginPath();
    // Transform coordinates
    x0=(x0+x/2); 
    y0=(y0+y/2);
    // Draw two bezier curves between top and bottom of bounding box
    ctx.moveTo(x0,y0-y/2);
    ctx.bezierCurveTo(
        x0+x/2,y0-y/2,
        x0+x/2,y0+y/2,
        x0,y0+y/2);
    ctx.bezierCurveTo(
        x0-x/2,y0+y/2,
        x0-x/2,y0-y/2,
        x0,y0-y/2);
    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    ctx.fill();
    ctx.closePath();
}

function saveShape(){
    
}