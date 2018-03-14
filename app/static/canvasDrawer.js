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
buttons.push(createButton(30,5,20,20,function(){state.shape="Circle";}))
buttons.push(createButton(55,5,20,20,function(){state.shape="Ellipse";}))
buttons.push(createButton(80,5,20,20,function(){state=defaultState(); shapes=[]; resetCanvas();}))

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

// Creates a shape with given coordinates. Shape contains type, redraw function, isInside function and selected
function createShape(x0,y0,x,y,shape){
    function isInsideRect(pos){
        rect={
            x:x0,
            y:y0,
            w:x-x0,
            h:y-y0
        }
        return isInside(pos,rect);
    }
    function isInsideCircle(pos){
        circle={
            r: Math.pow(Math.pow(x-x0,2)+Math.pow(y-y0,2),1/2)/2,
            x: x0+(x-x0)/2,
            y: y0+(y-y0)/2
            
        }
        if (Math.pow(pos.x-circle.x,2)+Math.pow(pos.y-circle.y,2)<Math.pow(circle.r,2)){
            return true;
        }
        return false;
    }
    function isInsideEllipse(pos){
        
    }
    var fn=eval("isInside"+shape);
    return {
        shape:shape,
        x:x,
        y:y,
        x0:x0,
        y0:y0,
        w:x-x0,
        h:y-y0,
        redraw: function(){drawShape(x0,y0,x-x0,y-y0,shape);console.log(this.x);},
        isInside: fn,
        selected: false,
        move: function(pos){
            console.log(this.x);
            this.x=pos.x;
            console.log(this.x);
            this.y=pos.y;
            this.x0=pos.x+w;
            this.y0=pos.y+h;
        }
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
        console.log(shapes[i].shape);
        shapes[i].redraw();
    }
}

// Handles mouse activity for shape drawing
var flag=1;
element.addEventListener("mousedown", function(e){
    mP_0=getMousePos(drawCanvas,e);
    buttonPressed=false;
    shapePressed=false;
    // Check user is clicking canvas
    for (var i=0;i<buttons.length;i++){
        if (isInside(mP_0,buttons[i].rect)&&!buttonPressed){
            buttons[i].behaviour();
            buttonPressed=true;
        }
    }
    
    for (var i=0;i<shapes.length;i++){
        if (shapes[i].isInside(mP_0)&&!buttonPressed&&!shapePressed){
            shapePressed=true;
            state.selectedNo=i;
        }
    }
    if (isInside(mP_0,drawerRect)&&!buttonPressed&&!shapePressed&&shapes!=[]){
        flag = 0;
        t_0=e.timeStamp;
    }
}, false);
element.addEventListener("mousemove", function(e){
    shapeDrawn=false;
    if (state.selectedNo>-1){
        resetCanvas();
        shapes[state.selectedNo].move(mP);
    } else if (flag===0){
        mP=getMousePos(drawCanvas,e);
        t=e.timeStamp;
        // Check user is dragging (150 was chosen from experiments)
        if (state.shape!="None"&&t-t_0>150){ 
            resetCanvas();
            drawShape(mP_0.x,mP_0.y,mP.x-mP_0.x,mP.y-mP_0.y,state.shape);
            shapeDrawn=true;
        }
    }
}, false);
element.addEventListener("mouseup", function(e){
    flag=1;
    state.selectedNo=-1
    if (shapeDrawn){
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
        shape: "None",
        selectedNo: -1
    }
}

// Chooses the shape to draw
function drawShape(x0,y0,x,y,shape){
    var fn=window["draw"+shape];
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