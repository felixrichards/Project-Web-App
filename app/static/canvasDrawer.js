// Setup
var drawCanvas = document.getElementById("drawCanvas");
var ctx = drawCanvas.getContext("2d");
var element=window;
var parentDiv = document.getElementById("canv_cont");
var state=defaultState();
var drawerRect={
    x:0,
    y:0,
    w:parentDiv.clientWidth,
    h:parentDiv.clientHeight
};
init()

var buttons=[]
var shapes=[]
buttons.push(createButton(5,5,20,20,function(){state.shape="Rect";}))
buttons.push(createButton(35,5,20,20,function(){state.shape="Circle";}))
buttons.push(createButton(65,5,20,20,function(){state.shape="Ellipse";}))
buttons.push(createButton(95,5,20,20,function(){state.shape=null; shapes=[];}))

function createButton(x, y, w, h, behaviour){
    redraw()
    function redraw(){
        ctx.beginPath();
        ctx.rect(x,y,w,h);
        ctx.fillStyle='rgba(255,255,255,0.2)';
        ctx.fill();
        ctx.closePath();
    }
    
    return {
        rect: {
            x:x,
            y:y,
            w:w,
            h:h
        },
        behaviour: behaviour,
        redraw: redraw
    }
}

function createShape(x0,y0,x,x,shape){
    return {
        shape:shape,
        redraw: function(){drawShape(mP_0.x,mP_0.y,mP.x-mP_0.x,mP.y-mP_0.y);}
    }
}


// Makes w/h of canvas same as image
function init(){
    var background = document.getElementById("imageCanvas");
    drawCanvas.width=drawerRect.w
    drawCanvas.height=drawerRect.h;
}

function clrCanvas(){
    ctx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
}

function resetCanvas(){
    clrCanvas();
    init();
    for (var i=0;i<buttons.length;i++){
        buttons[i].redraw();
    }
    for (var i=0;i<shapes.length;i++){
        // shapes[i].redraw();
    }
}

// Handles mouse activity for shape drawing
var flag=1;
element.addEventListener("mousedown", function(e){
    mP_0=getMousePos(drawCanvas,e);
    buttonPressed=false;
    // Check user is clicking canvas
    for (var i=0;i<buttons.length;i++){
        if (isInside(mP_0,buttons[i].rect)&&!buttonPressed){
            buttons[i].behaviour();
            buttonPressed=true;
        }
    }
    if (isInside(mP_0,drawerRect)&&!buttonPressed){
        flag = 0;
        t_0=e.timeStamp;
    }
}, false);
element.addEventListener("mousemove", function(e){
    // console.log(flag);
    shapeDrawn=false;
    if (flag===0){
        mP=getMousePos(drawCanvas,e);
        t=e.timeStamp;
        // Check user is dragging (150 was chosen from experiments)
        if (t-t_0>150){
            resetCanvas();
            drawShape(mP_0.x,mP_0.y,mP.x-mP_0.x,mP.y-mP_0.y);
            shapeDrawn=true;
        }
    }
}, false);
element.addEventListener("mouseup", function(e){
    flag=1;
    if (shapeDrawn){
        console.log("helo");
        shapes.push(createShape(mP_0.x,mP_0.y,mP.x,mP.y,state.shape));
    }
}, false);

// Returns mouse position relative to (passed) canvas
function getMousePos(drawCanvas, evt) {
    var rect = drawCanvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

// Check if a given position is inside a given rectangle
function isInside(pos,rect){
    return pos.x > rect.x && pos.x < rect.x+rect.w && pos.y < rect.y+rect.h && pos.y > rect.y
}

function defaultState(){
    return {
        drawing: false,
        shape: "None"
    }
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
    ctx.beginPath();
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