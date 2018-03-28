// Setup
var drawCanvas = document.getElementById("drawCanvas");
var ctx = drawCanvas.getContext("2d");
var element=window;
var parentDiv = document.getElementById("canv_cont");
var state=defaultState();
document.getElementById('drawCanvas').onmousedown = function(){
  return false;
};
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
button_x_inc=25;
buttons.push(createButton(button_x_shift,5,20,20,function(){state.shape="Rect";}))
buttons.push(createButton(button_x_shift+=button_x_inc,5,20,20,function(){state.shape="Circle";}))
buttons.push(createButton(button_x_shift+=button_x_inc,5,20,20,function(){state.shape="Ellipse";}))
buttons.push(createButton(button_x_shift+=button_x_inc,5,20,20,function(){state.resetSelected(); shapes.pop(); resetCanvas();}))
buttons.push(createButton(button_x_shift+=button_x_inc,5,20,20,function(){state=defaultState(); shapes=[]; resetCanvas();}))

function createRect(x, y, w, h){
    return {
        x:x,
        y:y,
        w:w,
        h:h
    };
}
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
        rect: createRect(x, y, w, h),
        behaviour: behaviour,
        redraw: redraw
    }
}

// Creates a shape with given coordinates. Shape contains type, redraw function, isInside function and selected
function createShape(x0,y0,x,y,shape){
    var shape_factor=1;
    normaliseCoords();
    function normaliseCoords(){
        var temp;
        if (x0>x){
            temp=x;
            x=x0;
            x0=temp;
        }
        if (y0>y){
            temp=y;
            y=y0;
            y0=temp;
        }
        if (shape=="Circle"){
            circle=cartesianToPolar({x:x0,y:y0,w:x-x0,h:y-y0});
            root_two=Math.pow(2,1/2);
            x0=circle.x-circle.r/root_two;
            y0=circle.y-circle.r/root_two;
            x=circle.x+circle.r/root_two;
            y=circle.y+circle.r/root_two;
            shape_factor=1/root_two;
        }
    }
    function isInsideRect(pos){
        rect=createRect(this.x0,this.y0,this.w,this.h);
        return isInside(pos,rect);
    }
    function isInsideCircle(pos){
        circle=cartesianToPolar(this);
        if (Math.pow(pos.x-circle.x,2)+Math.pow(pos.y-circle.y,2)<Math.pow(circle.r,2)){
            return true;
        }
        return false;
    }
    function isInsideEllipse(pos){
        
    }
    var fn=eval("isInside"+shape);
    
    var createBoundingRect=function(shape){
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
            ctx.beginPath();
            ctx.rect(shape.x,shape.y,shape.w,shape.h);
            ctx.strokeStyle="rgba(255, 255, 255, 0.5)";
            ctx.lineWidth=1;
            ctx.stroke();
            ctx.closePath();
        }
        
        var amendBoxes=function(){
            var amendBox=function(loc,dir){
                boxW=10;
                
                function drawAmendRect(shape){
                    ctx.beginPath();
                    ctx.rect(shape.x,shape.y,shape.w,shape.h);
                    ctx.fillStyle="rgba(255, 255, 255, 0.5)";
                    ctx.fill();
                    ctx.closePath();
                }
                
                return {
                    rect: createRect(loc.x-boxW/2,loc.y-boxW/2,boxW,boxW),
                    dir: dir,
                    isInside: function(pos){
                        return isInside(pos,this.rect);
                    },
                    redraw: function(){
                        drawAmendRect(this.rect);
                    }
                }
            }
            
            var j=0
            var x_n=boundingRect.x;
            var y_n=boundingRect.y;
            var w_n=boundingRect.w;
            var h_n=boundingRect.h;
            var amendBoxes=[];
            amendBoxes.push(amendBox({x:x_n+w_n/2,y:y_n},j++));     //Up
            amendBoxes.push(amendBox({x:x_n+w_n,y:y_n},j++));       //UpRight
            amendBoxes.push(amendBox({x:x_n+w_n,y:y_n+h_n/2},j++)); //Right
            amendBoxes.push(amendBox({x:x_n+w_n,y:y_n+h_n},j++));   //DownRight
            amendBoxes.push(amendBox({x:x_n+w_n/2,y:y_n+h_n},j++)); //Down
            amendBoxes.push(amendBox({x:x_n,y:y_n+h_n},j++));       //DownLeft
            amendBoxes.push(amendBox({x:x_n,y:y_n+h_n/2},j++));     //Left
            amendBoxes.push(amendBox({x:x_n,y:y_n},j++));           //UpLeft
            return {
                getBox: function(i){return amendBoxes[i];},
                redraw: function(){
                    for (var i=0;i<8;i++) amendBoxes[i].redraw();
                },
                isInside: function(pos){
                    for (var i=0;i<8;i++) {
                        if (amendBoxes[i].isInside(pos)) {
                            return i;
                        }
                    }
                    return -1;
                }
            }
        }
        
        // boundingRect object return
        return {
            x:boundingRect.x,
            y:boundingRect.y,
            w:boundingRect.w,
            h:boundingRect.h,
            amendBoxes:amendBoxes(),
            redraw: function(){
                drawBoundingRect(this);
                this.amendBoxes.redraw();
            },
            isInside: function(pos){
                // Check for amend points
                amendIdx=this.amendBoxes.isInside(pos);
                if (amendIdx>-1){
                    setSelfSelectedIdx(amendIdx);
                    return true
                } else if (isInside(pos,{x:this.x,y:this.y,w:this.w,h:this.h})) {
                    setSelfSelectedIdx(-1);
                    return true;
                }
            }
        };
    }
    
    var selfObj={
        shape:shape,
        x:x0,
        y:y0,
        x0:x0,
        y0:y0,
        w:x-x0,
        h:y-y0,
        w0:x-x0,
        h0:y-y0,
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
        amend: function(pos,pos_0,dir){
            var inc=0;
            console.log(dir);
            if (dir==0){
                this.y=this.y0+(pos.y-pos_0.y);
                this.h=this.h0-(pos.y-pos_0.y);
            }else if (dir==1){
                this.y=this.y0+(pos.y-pos_0.y);
                this.h=this.h0-(pos.y-pos_0.y);
                this.w=this.w0+(pos.x-pos_0.x);
            }else if (dir==2){
                this.w=this.w0+(pos.x-pos_0.x);
            }else if (dir==3){
                this.w=this.w0+(pos.x-pos_0.x);
                this.h=this.h0+(pos.y-pos_0.y);
            }else if (dir==4){
                this.h=this.h0+(pos.y-pos_0.y);
            }else if (dir==5){
                this.h=this.h0+(pos.y-pos_0.y);
                this.x=this.x0+(pos.x-pos_0.x);
                this.w=this.w0-(pos.x-pos_0.x);
            }else if (dir==6){
                this.x=this.x0+(pos.x-pos_0.x);
                this.w=this.w0-(pos.x-pos_0.x);
            }else if (dir==7){
                this.x=this.x0+(pos.x-pos_0.x);
                this.w=this.w0-(pos.x-pos_0.x);
                this.y=this.y0+(pos.y-pos_0.y);
                this.h=this.h0-(pos.y-pos_0.y);
            }
        },
        changePos: function(){
            this.normaliseCoords();
            this.x0=this.x;
            this.y0=this.y;
            this.w0=this.w;
            this.h0=this.h;
            this.selectedIdx=-1;
        },
        resetPos: function(){
            this.x=this.x0;
            this.y=this.y0;
            this.w=this.w0;
            this.h=this.h0;
            this.selectedIdx=-1;
        },
        boundingRect: 0,
        createBoundingRect: function(){
            this.boundingRect=createBoundingRect(this);
            this.boundingRect.redraw()
        },
        selectedIdx:-1,
        interact: function(pos,pos_0){
            if (this.selectedIdx==-1) this.move(pos,pos_0);
            else {
                this.amend(pos,pos_0,this.selectedIdx);
            }
        },
        normaliseCoords: function (){
            var temp;
            console.log(this);
            if (this.w<0){
                this.x+=this.w;
                this.w=-this.w;
            }
            if (this.h<0){
                this.y+=this.h;
                this.h=-this.h;
            }
            this.w+this.x-this.x0,
            this.h+this.y-this.y0,
            this.w0+this.x-this.x0,
            this.h0+this.y-this.y0,
            this.createBoundingRect();
        }
    }
    function setSelfSelectedIdx(idx){
        selfObj.selectedIdx=idx;
    }
    console.log(selfObj);
    
    return selfObj;
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
        if (t-t_0>75){
            shapes[state.focusNo].interact(mP,mP_0);
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