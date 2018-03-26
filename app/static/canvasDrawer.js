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
button_x_shift=5;
buttons.push(new Button(button_x_shift,5,20,20,function(){state.shape="Rect";}))
buttons.push(new Button(button_x_shift+=25,5,20,20,function(){state.shape="Circle";}))
buttons.push(new Button(button_x_shift+=25,5,20,20,function(){state.shape="Ellipse";}))
buttons.push(new Button(button_x_shift+=25,5,20,20,function(){state.resetSelected(); shapes.pop(); resetCanvas();}))
buttons.push(new Button(button_x_shift+=25,5,20,20,function(){state=defaultState(); shapes=[]; resetCanvas();}))

var Button=function(x, y, w, h, behaviour){
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
            x:this.x0,
            y:this.y0,
            w:this.w,
            h:this.h
        }
        return isInside(pos,rect);
    }
    function isInsideCircle(pos){
        circle=cartesianToPolar(this);
        // console.log("Circle x :"+circle.x+" y: "+circle.y+" r: "+circle.r);
        // console.log("Pos x :"+pos.x+" y: "+pos.y+" r: "+pos.r);
        // console.log("Diff x:"+Math.pow(pos.x-circle.x,2)+" y:"+Math.pow(pos.y-circle.y,2)+" r:"+Math.pow(circle.r,2));
        if (Math.pow(pos.x-circle.x,2)+Math.pow(pos.y-circle.y,2)<Math.pow(circle.r,2)){
            return true;
        }
        return false;
    }
    function isInsideEllipse(pos){
        
    }
    var fn=eval("isInside"+shape);
    
    function createBoundingRect(shape){
        boundingRect={};
        if (shape.shape=="Circle"){
            circle=cartesianToPolar(shape);
            boundingRect.x=circle.x-circle.r;
            boundingRect.y=circle.y-circle.r;
            boundingRect.w=circle.r*2;
            boundingRect.h=circle.r*2;
        } else {
            boundingRect=shape;
        }
        
        function drawBoundingRect(shape){
            console.log(shape);
            ctx.beginPath();
            ctx.rect(shape.x,shape.y,shape.w,shape.h);
            ctx.strokeStyle="rgba(255, 255, 255, 0.5)";
            ctx.stroke();
        }
        // console.log(boundingRect)
        // returning boundingRect directly was giving problems with 'this' object. below is a workaround
        return {
            x:boundingRect.x,
            y:boundingRect.y,
            w:boundingRect.w,
            h:boundingRect.h,
            redraw: function(){
                console.log(this)
                drawBoundingRect(this);
            },
            isInside: function(pos){
                return isInside(pos,{x:this.x,y:this.y,w:this.w,h:this.h});
            }
        };
    }
    
    return {
        shape:shape,
        x:x0,
        y:y0,
        x0:x0,
        y0:y0,
        w:x-x0,
        h:y-y0,
        redraw: function(){
            drawShape(this.x,this.y,this.w,this.h,shape); 
            if (this.selected) {
                this.createBoundingRect();
            }
        },
        isInside: fn,
        selected: false,
        move: function(pos,pos_0){
            this.x=this.x0+pos.x-pos_0.x;
            this.y=this.y0+pos.y-pos_0.y;
        },
        changePos: function(){
            this.x0=this.x;
            this.y0=this.y;
        },
        resetPos: function(){
            this.x=this.x0;
            this.y=this.y0;
        },
        boundingRect: 0,
        createBoundingRect: function(){
            this.boundingRect=createBoundingRect(this);
            this.boundingRect.redraw()
        },
        action: "move"
    }
}

// Deletes a given shape - Work an undo here??
function deleteShape(i){
    shapes.splice(i,1);
    state.resetSelected();
    resetCanvas();
}

function cartesianToPolar(shape){
    return {
        r: Math.pow(Math.pow(shape.w,2)+Math.pow(shape.h,2),1/2)/2,
        x: shape.x+shape.w/2,
        y: shape.y+shape.h/2
    };
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
        // console.log(shapes[i].shape);
        shapes[i].redraw();
    }
}

// ---------
// Handles mouse activity for shape drawing
// ---------

var flag=1;
element.addEventListener("mousedown", function(e){
    mP_0=getMousePos(drawCanvas,e);
    buttonPressed=false;
    shapePressed=false;
    
    t_0=e.timeStamp;
    // Check user is clicking canvas
    for (var i=0;i<buttons.length;i++){
        if (isInside(mP_0,buttons[i].rect)&&!buttonPressed){
            buttons[i].behaviour();
            buttonPressed=true;
        }
    }
    shapeAction=0;
    // Check user is clicking shapes (reverse loop for z-order)
    if (state.selectedNo>-1&&shapes[state.selectedNo].boundingRect.isInside(mP_0)){
        shapePressed=true;
        state.selectShape(state.selectedNo);
    } else {
        state.resetSelected();
        for (var i=shapes.length-1;i>=0;i--){
            if (shapes[i].isInside(mP_0)&&!buttonPressed&&!shapePressed){
                shapePressed=true;
                state.selectShape(i);
                shapes[state.focusNo].selected=true;
            }
        }
    }
    
    if (isInside(mP_0,drawerRect)&&!buttonPressed&&!shapePressed&&shapes!=[]){
        flag = 0;
    }
    resetCanvas();
}, false);
element.addEventListener("mousemove", function(e){
    shapeDrawn=false;
    t=e.timeStamp;
    mP=getMousePos(drawCanvas,e);
    if (state.focusNo>-1){
        if (t-t_0>25){
            shapes[state.focusNo].move(mP,mP_0);
            resetCanvas();
        }
    } else if (flag===0){
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
    if (state.focusNo>-1){
        shapes[state.focusNo].changePos();
    }
    if (shapeDrawn){
        shapes.push(createShape(mP_0.x,mP_0.y,mP.x,mP.y,state.shape));
        state.selectShape(shapes.length-1);
        shapes[state.focusNo].selected=true;
    }
    // Unfocus anything
    state.focusNo=-1
    resetCanvas();
}, false);
element.addEventListener("keydown", function(e){
    if (e.keyCode==46&&state.selectedNo>-1){
        deleteShape(state.selectedNo);
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
        focusNo: -1,
        selectedNo: -1,
        selectShape: function(i){
            this.focusNo=i;
            this.selectedNo=i;
        },
        resetSelected: function(){
            if (this.selectedNo>-1) {
                try{
                    shapes[this.selectedNo].selected=false;
                } catch(err) {}
            }
            this.focusNo=-1;
            this.selectedNo=-1;
        }
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