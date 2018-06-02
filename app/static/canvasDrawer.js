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



// Initialise buttons and shapes arrays
var buttons=[];
var shapes=[];
var id_count=0;
var button_x_shift=5;
var button_size=32;
var button_x_inc=button_x_shift+button_size;
buttons.push(createButton(button_x_shift,5,button_size,button_size,
    function(){state.shape="Rect";}))
buttons.push(createButton(button_x_shift+=button_x_inc,5,button_size,button_size,
    function(){state.shape="Circle";}))
buttons.push(createButton(button_x_shift+=button_x_inc,5,button_size,button_size,
    function(){state.shape="Ellipse";}))
buttons.push(createButton(button_x_shift+=button_x_inc,5,button_size,button_size,
    function(){state.shape="Line";}))
buttons.push(createButton(button_x_shift+=button_x_inc,5,button_size,button_size,
    function(){state.resetSelected(); shapes.pop(); resetCanvas(); updateTable(shapes);}))
buttons.push(createButton(button_x_shift+=button_x_inc,5,button_size,button_size,
    function(){state=defaultState(true); shapes=[]; resetCanvas(); updateTable(shapes);}))

// Returns an object (rectangle) with left, top, width and height attributes
function createRect(x, y, w, h,theta=0){
    return {
        x:x,
        y:y,
        w:w,
        h:h,
        theta:theta
    };
}

// Returns an object (button) with positional attributes and a function (behaviour) to run when pressed
function createButton(x, y, w, h, behaviour){
    o={
        rect: createRect(x, y, w, h),
        behaviour: behaviour,
        redraw: function redraw(){
            drawRect(this.rect,true);
        },
        cursor: "pointer"
    }
    o.redraw();
    
    
    return o;
}

// Creates a shape with given coordinates. Shape contains type, redraw function, isInside function and selected
function createShape(x0,y0,x,y,shape){
    var shape_factor=1;
    if (shape!="Line") normaliseCoords();
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
    function isInsideRect(pos,obj=this){
        if (obj.theta!=0) {
            if (typeof obj.p==="undefined"){
                var pos_r={
                    x:rotateXCoord(pos.x,pos.y,-obj.theta,obj.centre),
                    y:rotateYCoord(pos.x,pos.y,-obj.theta,obj.centre)
                }
            }else{
                var pos_r={
                    x:rotateXCoord(pos.x,pos.y,-obj.theta,obj.p),
                    y:rotateYCoord(pos.x,pos.y,-obj.theta,obj.p)
                }
            }
            pos=pos_r;
        }
        return isInside(pos,obj);
    }
    function isInsideCircle(pos){
        circle=cartesianToPolar(this);
        if (Math.pow(pos.x-circle.x,2)+Math.pow(pos.y-circle.y,2)<Math.pow(circle.r,2)){
            return true;
        }
        return false;
    }
    function isInsideEllipse(pos){
        ellipse=cartesianToElliptical(this);
        if (Math.pow((pos.x-ellipse.x)/ellipse.w,2)+Math.pow((pos.y-ellipse.y)/ellipse.h,2)<=1){
            return true;
        }
        return false;
    }
    function isInsideLine(pos){
        
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
            if (shape.shape=="Line"){
                
            } else {
                drawRect(shape,false,true)
                
            }
        }
        
        var amendBoxes=function(){
            var amendBox=function(loc,dir,theta=0,p={x:0,y:0}){
                boxW=10;
                console.log(this.p);
                function drawAmendRect(shape,p){
                    shape.p=p;
                    drawRect(shape,false,false,true);
                }
                
                return {
                    rect: createRect(loc.x-boxW/2,loc.y-boxW/2,boxW,boxW,theta),
                    p:p,
                    dir: dir,
                    cursor: "pointer",
                    isInside: function(pos){
                        this.rect.p=this.p;
                        return isInsideRect(pos,this.rect);
                    },
                    redraw: function(){
                        // console.log(this.p);
                        drawAmendRect(this.rect,this.p);
                    }
                }
            }
            
            var j=1;
            var amendBoxes=createAmendBoxes(shape);
            function createAmendBoxes(shape){
                var x_n=boundingRect.x;
                var y_n=boundingRect.y;
                
                var amendBoxes=[];
                if (shape.shape=="Line"){
                    var x1_n=boundingRect.x1;
                    var y1_n=boundingRect.y1;
                    var x2_n=boundingRect.x2;
                    var y2_n=boundingRect.y2;
                    var x3_n=boundingRect.x3;
                    var y3_n=boundingRect.y3;
                    amendBoxes.push(amendBox({x:x_n,y:y_n},j++));     //Up
                    amendBoxes.push(amendBox({x:x1_n,y:y1_n},j++));       //UpRight
                    amendBoxes.push(amendBox({x:x2_n,y:y2_n},j++));     //Up
                    amendBoxes.push(amendBox({x:x3_n,y:y3_n},j++));       //UpRight
                } else {
                    var w_n=boundingRect.w;
                    var h_n=boundingRect.h;
                    var t=boundingRect.theta;
                    var p={x:boundingRect.x+boundingRect.w/2,y:boundingRect.y+boundingRect.h/2}
                    amendBoxes.push(amendBox({x:x_n+w_n/2,y:y_n},j++,t,p));     //Up
                    amendBoxes.push(amendBox({x:x_n+w_n,y:y_n},j++,t,p));       //UpRight
                    amendBoxes.push(amendBox({x:x_n+w_n,y:y_n+h_n/2},j++,t,p)); //Right
                    amendBoxes.push(amendBox({x:x_n+w_n,y:y_n+h_n},j++,t,p));   //DownRight
                    amendBoxes.push(amendBox({x:x_n+w_n/2,y:y_n+h_n},j++,t,p)); //Down
                    amendBoxes.push(amendBox({x:x_n,y:y_n+h_n},j++,t,p));       //DownLeft
                    amendBoxes.push(amendBox({x:x_n,y:y_n+h_n/2},j++,t,p));     //Left
                    amendBoxes.push(amendBox({x:x_n,y:y_n},j++,t,p));           //UpLeft
                }
                return amendBoxes;
            }
            
            return {
                getBox: function(i){return amendBoxes[i-1];},
                redraw: function(){
                    for (var i=0;i<amendBoxes.length;i++) amendBoxes[i].redraw();
                },
                isInside: function(pos){
                    for (var i=0;i<amendBoxes.length;i++) {
                        if (amendBoxes[i].isInside(pos)) {
                            return amendBoxes[i].dir;
                        }
                    }
                    return 0;
                }
            }
        }
        
        // boundingRect object return
        return {
            x:boundingRect.x,
            y:boundingRect.y,
            w:boundingRect.w,
            h:boundingRect.h,
            theta:shape.theta,
            centre:shape.centre,
            shape: shape.shape,
            amendBoxes:amendBoxes(),
            redraw: function(){
                drawBoundingRect(this);
                this.amendBoxes.redraw();
            },
            selectBox: function(idx){
                setSelfSelectedIdx(idx);
            },
            isInside: function(pos){
                // Check for amend points
                amendIdx=this.amendBoxes.isInside(pos);
                if (amendIdx>0) return amendIdx;
                if (isInsideRect(pos,this)) {
                    return -1;
                }
                return 0;
            },
            getObj: function(idx){
                if (idx==-1) return this;
                return this.amendBoxes.getBox(idx);
            },
            cursor: "move"
        };
    }
    
    function amend(pos,pos_0,dir){
        var inc=0;
        if (this.shape=="Line") {
            if (dir==1){
                this.x=pos.x;
                this.y=pos.y;
            }else if (dir==2){
                this.x1=pos.x;
                this.y1=pos.y;
            }else if (dir==3){
                this.x2=pos.x;
                this.y2=pos.y;
            }else if (dir==4){
                this.x3=pos.x;
                this.y3=pos.y;
            }
        } else {
            if (this.theta==0){
                var x_shift=pos.x-pos_0.x;
                var y_shift=pos.y-pos_0.y;
            }else{
                var x_shift=rotateXCoord(pos.x-pos_0.x,pos.y-pos_0.y,-this.theta);
                var y_shift=rotateYCoord(pos.x-pos_0.x,pos.y-pos_0.y,-this.theta);
                // console.log("x_shift is "+x_shift+". y_shift is "+y_shift);
            }
            // console.log(dir);
            if (dir==1){
                this.y=this.y0+y_shift;
                this.h=this.h0-y_shift;
            }else if (dir==2){
                this.y=this.y0+y_shift;
                this.h=this.h0-y_shift;
                this.w=this.w0+x_shift;
            }else if (dir==3){
                this.w=this.w0+x_shift;
            }else if (dir==4){
                this.w=this.w0+x_shift;
                this.h=this.h0+y_shift;
            }else if (dir==5){
                this.h=this.h0+y_shift;
            }else if (dir==6){
                this.h=this.h0+y_shift;
                this.x=this.x0+x_shift;
                this.w=this.w0-x_shift;
            }else if (dir==7){
                this.x=this.x0+x_shift;
                this.w=this.w0-x_shift;
            }else if (dir==8){
                this.x=this.x0+x_shift;
                this.w=this.w0-x_shift;
                this.y=this.y0+y_shift;
                this.h=this.h0-y_shift;
            }
        }
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
        theta: 0,
        theta_0: 0,
        centre:{
            x:x0+(x-x0)/2,
            y:y0+(y-y0)/2
        },
        cursor: "pointer",
        id: id_count++,
        updateCentre: function(){
            this.centre.x=this.x+this.w/2;
            this.centre.y=this.y+this.h/2;
        },
        redraw: function(){
            if (this.shape=="Line") drawLine(this.x,this.y
                                            ,this.x3,this.y3
                                            ,this.x1,this.y1
                                            ,this.x2,this.y2);
            else drawShape(this.x,this.y,this.w,this.h,shape,this.theta,this.centre); 
            if (this.selected) {
                this.createBoundingRect();
            }
        },
        isInside: fn,
        selected: false,
        move: function(pos,pos_0){
            var x_shift=pos.x-pos_0.x;
            var y_shift=pos.y-pos_0.y;
            this.x=this.x0+x_shift;
            this.y=this.y0+y_shift;
            this.updateCentre();
        },
        amend: amend,
        changePos: function(){
            if (this.shape!="Line") this.normaliseCoords();
            this.x0=this.x;
            this.y0=this.y;
            this.w0=this.w;
            this.h0=this.h;
            this.selectedIdx=0;
            // this.updateCentre();
        },
        resetPos: function(){
            this.x=this.x0;
            this.y=this.y0;
            this.w=this.w0;
            this.h=this.h0;
            this.selectedIdx=0;
            // this.updateCentre();
        },
        boundingRect: 0,
        createBoundingRect: function(){
            this.boundingRect=createBoundingRect(this);
            this.boundingRect.redraw()
        },
        selectedIdx:-1,
        interact: function(pos,pos_0){
            if (this.selectedIdx==-1) this.move(pos,pos_0);
            else{
                this.amend(pos,pos_0,this.selectedIdx);
            }
        },
        normaliseCoords: function (){
            if (this.w<0){
                this.x+=this.w;
                this.w=-this.w;
            }
            if (this.h<0){
                this.y+=this.h;
                this.h=-this.h;
            }
            this.createBoundingRect();
        }
    }
    function setSelfSelectedIdx(idx){
        selfObj.selectedIdx=idx;
    }
    if (shape=="Line") {
        selfObj.x1=selfObj.x+selfObj.w/3;
        selfObj.y1=selfObj.y+selfObj.h/3;
        selfObj.x2=selfObj.x+2*selfObj.w/3;
        selfObj.y2=selfObj.y+2*selfObj.h/3;
        selfObj.x3=selfObj.x+selfObj.w;
        selfObj.y3=selfObj.y+selfObj.h;
        selfObj.w=0;
        selfObj.h=0;
    }
    return selfObj;
}

function getShapeByID(id){
    for (var j=0;j<shapes.length;j++){
        if (id==shapes[j].id) {
            return j;
        }
    }
}

// Deletes a given shape, default is selected shape - Work an undo here??
function deleteShape(i=state.selectedNo){
    if (i>-1) {
        shapes.splice(i,1);
        state.resetSelected();
        resetCanvas();
        updateTable(shapes);
    }
}

function cartesianToPolar(shape){
    return {
        r: Math.pow(Math.pow(shape.w,2)+Math.pow(shape.h,2),1/2)/2,
        x: shape.x+shape.w/2,
        y: shape.y+shape.h/2
    };
}

function cartesianToElliptical(shape){
    return {
        w: shape.w*(1/Math.pow(3,1/4))/2,
        h: shape.h/2,
        x: shape.x+shape.w/2,
        y: shape.y+shape.h/2
    };
}

// Makes w/h of canvas same as image
function init(){
    var background = document.getElementById("imageCanvas");
    drawCanvas.width=drawerRect.w
    drawCanvas.height=drawerRect.h;
    drawCanvas.cursor="auto";
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
        shapes[i].redraw();
    }
}

// ---------
// Handles mouse activity for shape drawing
// ---------

// Makes cursor change for buttons
// function updateCursor(pos){
    // if (isInsideButtons(pos)) document.body.style.cursor = "pointer";
    // else document.body.style.cursor = "auto";
// }

var flag=1;
var focusObject=null;
var buttonPressed=false;
var shapePressed=false;
var cursorLock=false;
element.addEventListener("mousedown", function(e){
    mP_0=getMousePos(drawCanvas,e);
    buttonPressed=false;
    shapePressed=false;
    cursorLock=true;
    updateRows();
    
    t_0=e.timeStamp;
    // Check user is clicking buttons
    for (var i=0;i<buttons.length;i++){
        if (isInside(mP_0,buttons[i].rect)&&!buttonPressed){
            buttons[i].behaviour();
            buttonPressed=true;
        }
    }
    
    // Check user is clicking shapes (reverse loop for z-order)
    var temp;
    if (state.selectedNo>-1&&(idx=shapes[state.selectedNo].boundingRect.isInside(mP_0))){
        shapes[state.selectedNo].boundingRect.selectBox(idx);
        state.selectShape(state.selectedNo);
    } else {
        state.resetSelected();
        for (var i=shapes.length-1;i>=0;i--){
            if (shapes[i].isInside(mP_0)&&!buttonPressed&&!shapePressed){
                state.selectShape(i);
                shapes[i].selectedIdx=-1;
            }
        }
    }
    
    if (isInside(mP_0,drawerRect)&&!buttonPressed&&!shapePressed&&shapes!=[]){
        flag = 0;
    }
    focusObject=getFocusObject(getMousePos(drawCanvas,e));
    updateCursor(focusObject.cursor);
    
    resetCanvas();
}, false);
element.addEventListener("mousemove", function(e){
    shapeDrawn=false;
    
    //Check if object is not currently being used
    if (!cursorLock) focusObject=getFocusObject(getMousePos(drawCanvas,e));
    updateCursor(focusObject.cursor);
    
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
    updateCursor(mP);
}, false);
element.addEventListener("mouseup", function(e){
    flag=1;
    cursorLock=false;
    if (state.focusNo>-1){
        shapes[state.focusNo].changePos();
    }
    if (shapeDrawn){
        shapes.push(createShape(mP_0.x,mP_0.y,mP.x,mP.y,state.shape));
        state.selectShape(shapes.length-1);
    }
    // Unfocus anything
    state.focusNo=-1
    resetCanvas();
}, false);
element.addEventListener("keydown", function(e){
    if (e.keyCode==46){
        deleteShape();
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

function updateCursor(c="auto"){
    document.body.style.cursor=c;
}

function getFocusObject(pos){
    for (var i=0;i<buttons.length;i++){
        if (isInside(pos,buttons[i].rect)){
            return buttons[i];
        }
    }
    
    var boundingIdx;
    if (state.selectedNo>-1&&(boundingIdx=shapes[state.selectedNo].boundingRect.isInside(pos))){
        return shapes[state.selectedNo].boundingRect.getObj(boundingIdx);
    } else {
        for (var i=shapes.length-1;i>=0;i--){
            if (shapes[i].isInside(pos)){
                return shapes[i];
            }
        }
    }
    
    if (isInside(pos,drawerRect)&&shapes!=[]){
        return drawCanvas;
    }
    return {cursor: "auto"}
}

// Check if a given position is inside a given rectangle
function isInside(pos,rect){
    return pos.x > rect.x && pos.x < rect.x+rect.w && pos.y < rect.y+rect.h && pos.y > rect.y
}

function isInsideButtons(pos){
    for (var i=0;i<buttons.length;i++) if (isInside(pos,buttons[i].rect)) return true;
}

function defaultState(keep_shape=false){
    var outObj={
        drawing: false,
        focusNo: -1,
        selectedNo: -1,
        selectShape: function(i){
            this.focusNo=i;
            this.selectedNo=i;
            shapePressed=true;
            shapes[i].selected=true;
            updateTable(shapes);
            updateRows(i);
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
    if (keep_shape) outObj.shape=state.shape;
    else outObj.shape="None";
    return outObj;
}

// Chooses the shape to draw
function drawShape(x,y,w,h,shape,theta=0,p={x:x+w/2,y:y+h/2}){
    var fn=window["draw"+shape];
    if (shape=="Line"){
        drawLine(x,y,x+w,y+h)
    }else if(typeof fn === 'function') {
        fn({x:x,y:y,w:w,h:h,theta:theta,p:p})
        // fn(x,y,w,h,theta);
    }
}

function drawRect(shape,button=false,bounding=false,amend=false){
    ctx.beginPath();
    if (shape.theta==0){
        ctx.rect(shape.x,shape.y,shape.w,shape.h);
    } else {
        if (amend) {
            rect=rotateRect(shape,shape.p)
        }
        else {
            if (!bounding&&!amend) rect=rotateRect(shape,shape.p);
            if (bounding) rect=rotateRect(shape,shape.centre);
        }
        ctx.moveTo(rect.x_t_l,rect.y_t_l);
        ctx.lineTo(rect.x_t_r,rect.y_t_r)
        ctx.lineTo(rect.x_b_r,rect.y_b_r)
        ctx.lineTo(rect.x_b_l,rect.y_b_l)
        ctx.lineTo(rect.x_t_l,rect.y_t_l)
    }
    
    if (button) ctx.fillStyle='rgba(255,255,255,0.2)';
    else if (bounding) {
        ctx.strokeStyle="rgba(255, 255, 255, 0.5)";
        ctx.lineWidth=1;
        ctx.stroke();
    } else if (amend) {
        ctx.strokeStyle="rgba(25, 25, 25, 0.5)";
        ctx.lineWidth=1;
        ctx.stroke();
        ctx.fillStyle="rgba(255, 255, 255, 0.5)";
    }
    else ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    
    if (!bounding) ctx.fill();
    ctx.closePath();
}

// Draws circle with given parameters
function drawCircle(shape){
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    ctx.arc(shape.x+shape.w/2,shape.y+shape.h/2,
        Math.sqrt(Math.pow(shape.w/2,2)+Math.pow(shape.h/2,2)),
        0,2*Math.PI);
    //ctx.arc(x0,y0,Math.sqrt(Math.pow(x,2)+Math.pow(y,2)),0,2*Math.PI);
    ctx.fill();
}

// Draws circle with given parameters
function drawEllipse(shape){
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

// Draws a bezier curve with given parameters
function drawLine(x,y,x3,y3,x1=x+(x3-x)/3,y1=y+(y3-y)/3,x2=x+2*(x3-x)/3,y2=y+2*(y3-y)/3){
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.bezierCurveTo(
        x1,y1,
        x2,y2,
        x3,y3);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.15)";
    ctx.stroke();
    ctx.closePath();
}

function rotateXCoord(x,y,theta,p={x:0,y:0}){
    x=x-p.x;
    y=y-p.y;
    return x*Math.cos(theta)+y*Math.sin(theta)+p.x;
}

function rotateYCoord(x,y,theta,p={x:0,y:0}){
    x=x-p.x;
    y=y-p.y;
    return -x*Math.sin(theta)+y*Math.cos(theta)+p.y;
}

function rotateRect(rect,p={x:rect.x+rect.w/2,y:rect.y+rect.h/2}){
    o={};
    o.x_t_l=rotateXCoord(rect.x,rect.y,rect.theta,p);
    o.y_t_l=rotateYCoord(rect.x,rect.y,rect.theta,p);
    o.x_t_r=rotateXCoord(rect.x+rect.w,rect.y,rect.theta,p);
    o.y_t_r=rotateYCoord(rect.x+rect.w,rect.y,rect.theta,p);
    o.x_b_l=rotateXCoord(rect.x,rect.y+rect.h,rect.theta,p);
    o.y_b_l=rotateYCoord(rect.x,rect.y+rect.h,rect.theta,p);
    o.x_b_r=rotateXCoord(rect.x+rect.w,rect.y+rect.h,rect.theta,p);
    o.y_b_r=rotateYCoord(rect.x+rect.w,rect.y+rect.h,rect.theta,p);
    
    if (shape="Ellipse"){
        
    }
    
    return o;
}