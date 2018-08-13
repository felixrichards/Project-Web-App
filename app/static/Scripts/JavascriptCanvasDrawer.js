// Setup
var drawCanvas = document.getElementById("drawCanvas");
var UICanvas = document.getElementById("UICanvas");

var ctx = drawCanvas.getContext("2d");
var ui_ctx = UICanvas.getContext("2d");

var element=window;
var parentDiv = document.getElementById("canv_cont");
var state=defaultState();

// Stops mouse activity on canvas interfering with content outside canvas (e.g. highlighting text)
document.getElementById('drawCanvas').onmousedown = function(){
  return false;
};

document.getElementById('UICanvas').onmousedown = function(){
  return false;
};

var drawerRect={
    x:0,
    y:0,
    w:document.getElementById("canv_cont").clientWidth,
    h:document.getElementById("canv_cont").clientHeight
};
UICanvas.width = document.getElementById("canv_cont").clientWidth;
init()

// Initialise buttons and shapes arrays
var buttons=[];
var shapes=[];
var id_count=0;
var button_x_shift=5;
var button_size=32;
var button_x_inc=button_x_shift+button_size;
var button_x_right_shift=drawerRect.w;
// button_x_right_shift=300

var exploringMode = true;
//Left sitting buttons
buttons.push(createButton(button_x_shift,5,button_size,button_size,
    function () { showAnnotation(); }, "Switch"))
buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
    function () {  }, "Layers"))

// Returns an object (rectangle) with left, top, width and height attributes
function showAnnotation() {
    exploringMode = false;
    if (buttons.length == 2)
    {
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].clear()
        }
        buttons = [];
        button_x_shift = 5;

        buttons.push(createButton(button_x_shift, 5, button_size, button_size,
            function () { showAnnotation(); }, "Switch"))
        document.getElementById("pencil").style.display = "none";
        document.getElementById("arrows").style.display = "block";
        document.getElementById("bin").style.display = "block";
        document.getElementById("undo").style.display = "block";
        document.getElementById("restart").style.display = "block";
        document.getElementById("table").style.display = "block";
        document.getElementById("info").style.display = "block";
        document.getElementById("redo").style.display = "block";
        document.getElementById("featureDropdownContainer").style.display = "block";

        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { state.shape = "Rect"; }, "Rect"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { state.shape = "Circle"; }, "Circle"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { state.shape = "Ellipse"; }, "Ellipse"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { state.shape = "Line"; }, "Line"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { deleteShape(); }, "Delete"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { undo();}, "Undo"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { redo();}, "Redo"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { clear(); }, "Reset"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { showHideTable(); }, "Table"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { showHideCheatSheet(); }, "Info"))

        $('.aladin-zoomControl').css('right', '4000');
        $('.aladin-layersControl-container').css('top', '4000');
        $('.aladin-layersControl-container').css('left', '4000');
        document.getElementById("aladin-lite-div").style.pointerEvents = "none";
        $('.aladin-layerBox').css('display', 'none');

        state.resetSelected();
        state = defaultState();
    }
    else {
        exploringMode = true;
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].clear()
        }
        buttons = [];
        button_x_shift = 5;

        buttons.push(createButton(button_x_shift, 5, button_size, button_size,
            function () { showAnnotation(); }, "Switch"))
        buttons.push(createButton(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { }, "Layers"))
        document.getElementById("pencil").style.display = "block";
        document.getElementById("arrows").style.display = "none";
        document.getElementById("bin").style.display = "none";
        document.getElementById("undo").style.display = "none";
        document.getElementById("restart").style.display = "none";
        document.getElementById("table").style.display = "none";
        document.getElementById("info").style.display = "none";
        document.getElementById("redo").style.display = "none";
        document.getElementById("featureDropdownContainer").style.display = "none";
        document.getElementById("myCheatSheet").style.width = "0";
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("aladin-lite-div").style.pointerEvents = "unset";

        $('.aladin-layersControl-container').css('top', '4');
        $('.aladin-layersControl-container').css('left', '41');
        $('.aladin-zoomControl').css('right', '8');
        noshapeDrawn();
        nextShape = false;

        state.resetSelected();
        state = defaultState();
    }
}

function undo(){
    state.undo();
    updateTable(shapes);
    allShapes();
    disableSelectReset=true;
}

function redo(){
    state.redo();
    updateTable(shapes);
    allShapes();
    disableSelectReset=true;
}

function clear(){
    state = defaultState(true, true);
    state.addUndo(-1, 'clear', shapes.slice());
    shapes = [];
    resetCanvas();
    updateTable(shapes);
}

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
function createButton(x, y, w, h, behaviour, img){
    drawButton=function(btn){
        btn.ctx.beginPath();
        btn.ctx.rect(btn.rect.x,btn.rect.y,btn.rect.w,btn.rect.h);
        btn.ctx.fillStyle='rgba(255,255,255,0.2)';
        btn.ctx.fill();
        btn.ctx.closePath();
        btn.ctx.font = "24px Arial";
        btn.ctx.textAlign = "center";
        
        if (btn.draw) btn.ctx.beginPath()
        if (btn.img=="Rect"){
            btn.ctx.rect(btn.rect.x+5,btn.rect.y+8,btn.rect.w-10,btn.rect.h-16);
        } else if (btn.img=="Circle"){
            btn.ctx.arc(btn.rect.x+btn.rect.w/2,btn.rect.y+btn.rect.h/2,
                Math.sqrt(Math.pow(btn.rect.w/4,2)+Math.pow(btn.rect.h/4,2)),
                0,2*Math.PI);
        } else if (btn.img=="Ellipse"){
            var x=btn.rect.x-2; var y=btn.rect.y+8;
            var w=btn.rect.w+4; var h=btn.rect.h-16;
            btn.ctx.moveTo(x+w/2,y);
            btn.ctx.bezierCurveTo(
                x+w,y,
                x+w,y+h,
                x+w/2,y+h);
            btn.ctx.bezierCurveTo(
                x,y+h,
                x,y,
                x+w/2,y);
            
        } else if (btn.img=="Line"){
            var x=btn.rect.x+5; var y=btn.rect.y+5;
            var w=22; var h=22;
            btn.ctx.moveTo(x,y)
            btn.ctx.bezierCurveTo(
                x+w,y,
                x,y+h,
                x+w,y+h);
        }
        
        if (btn.draw){
            if (btn.img!="Line"){
                btn.ctx.fillStyle="rgba(255, 0, 0, 0.4)";
                btn.ctx.fill();
            } else {
                btn.ctx.strokeStyle="rgba(255, 0, 0, 0.4)";
                btn.ctx.lineWidth=4;
                btn.ctx.stroke();
            }
            btn.ctx.closePath();
        }
    }
    o={
        rect: createRect(x, y, w, h),
        img: img,
        draw:false,
        ctx: ui_ctx,
        behaviour: behaviour,
        redraw: function redraw(){
            drawButton(this);
        },
        cursor: "pointer",
        clicked: false,
        click: function(){
            if (!this.clicked) {
                if (this.draw) resetButtons();
                this.clicked=true;
                this.redraw();
                this.behaviour();
                var temp_this=this;
                if (!this.draw){
                    setTimeout(function(){
                        temp_this.unclick();
                    }, 50);
                }
            }
        },
        unclick: function(){
            if (this.clicked) {
                this.clicked=false;
                this.clear();
                this.redraw();
            }
        },
        clear: function(){
            this.ctx.clearRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
        }
    }
    if (o.img=="Rect"||o.img=="Circle"||o.img=="Ellipse"||o.img=="Line") o.draw=true;
    o.redraw();
    
    
    return o;
}

function resetButtons(){
    for (var i=0;i<buttons.length;i++){
        buttons[i].unclick();
    }
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
            if (typeof obj.p==="undefined"){    // Check if object needs to be rotated its pivot, if not, use centre
                var pos_r=rotateCoords(pos.x,pos.y,-obj.theta,obj.centre);
            }else{
                var pos_r=rotateCoords(pos.x,pos.y,-obj.theta,obj.p);
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
    function isInsideEllipse(pos,obj=this){
        ellipse=cartesianToElliptical(this);
        if (obj.theta!=0){
            var pos_r=rotateCoords(pos.x,pos.y,-obj.theta,obj.centre);
            pos=pos_r;
        }
        if (Math.pow((pos.x-ellipse.x)/ellipse.w,2)+Math.pow((pos.y-ellipse.y)/ellipse.h,2)<=1){
            return true;
        }
        return false;
    }
    function isInsideLine(pos){
        if (isInside(pos,this.boundingRect)){
            for (var i=0; i<this.detectionBoxes.length; i++){
                var pos_r=rotateCoords(pos.x,pos.y,-this.theta,this.centre);
                if (this.detectionBoxes[i].isInside(pos_r)) {
                    console.log(i);
                    return true;
                }
            }
        }
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
        } else if (shape.shape=="Line"){
            boundingRect=Object.assign({},shape);
            boundingRect.x=Math.min(shape.x,shape.x1,shape.x2,shape.x3);
            boundingRect.y=Math.min(shape.y,shape.y1,shape.y2,shape.y3);
            boundingRect.w=Math.max(shape.x,shape.x1,shape.x2,shape.x3)-boundingRect.x;
            boundingRect.h=Math.max(shape.y,shape.y1,shape.y2,shape.y3)-boundingRect.y;
        } else {
            boundingRect=shape;
        }
        
        function drawBoundingRect(shape){
            if (shape.shape=="Line"){
                drawRect(shape,false,true);
            } else {
                drawRect(shape,false,true);
                
            }
        }
        
        var amendBoxes=function(){
            var amendBox=function(loc,dir,theta=0,p={x:0,y:0},r_shift=0){
                boxW=15;
                function drawAmendRect(shape,p){
                    shape.p=p;
                    if (dir==9) shape.colour="rgba(20, 200, 20, 0.5)";
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
                        drawAmendRect(this.rect,this.p);
                    }
                }
            }
            
            var j=1;
            var amendBoxes=createAmendBoxes(shape);
            function createAmendBoxes(shape){
                var x_n=shape.x;
                var y_n=shape.y;
                
                var amendBoxes=[];
                if (shape.shape=="Line"){
                    var x1_n=shape.x1;
                    var y1_n=shape.y1;
                    var x2_n=shape.x2;
                    var y2_n=shape.y2;
                    var x3_n=shape.x3;
                    var y3_n=shape.y3;
                    amendBoxes.push(amendBox({x:x_n,y:y_n},j++));     //Up
                    amendBoxes.push(amendBox({x:x1_n,y:y1_n},j++));       //UpRight
                    amendBoxes.push(amendBox({x:x2_n,y:y2_n},j++));     //Up
                    amendBoxes.push(amendBox({x:x3_n,y:y3_n},j++));       //UpRight
                } else {
                    x_n=boundingRect.x;
                    y_n=boundingRect.y;
                    var w_n=boundingRect.w;
                    var h_n=boundingRect.h;
                    var t=boundingRect.theta;
                    var p=shape.centre;
                    var r_shift=20;
                    amendBoxes.push(amendBox({x:x_n+w_n/2,y:y_n},j++,t,p));     //Up
                    amendBoxes.push(amendBox({x:x_n+w_n,y:y_n},j++,t,p));       //UpRight
                    amendBoxes.push(amendBox({x:x_n+w_n,y:y_n+h_n/2},j++,t,p)); //Right
                    amendBoxes.push(amendBox({x:x_n+w_n,y:y_n+h_n},j++,t,p));   //DownRight
                    amendBoxes.push(amendBox({x:x_n+w_n/2,y:y_n+h_n},j++,t,p)); //Down
                    amendBoxes.push(amendBox({x:x_n,y:y_n+h_n},j++,t,p));       //DownLeft
                    amendBoxes.push(amendBox({x:x_n,y:y_n+h_n/2},j++,t,p));     //Left
                    amendBoxes.push(amendBox({x:x_n,y:y_n},j++,t,p));           //UpLeft
                    if (shape.shape!="Circle") 
                        amendBoxes.push(amendBox({x:x_n+w_n/2,y:y_n-r_shift},j++,t,p,r_shift));           //Rotation
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
                this.selectedIdx=idx;
            },
            selectedIdx:-1,
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
        } else if (this.shape=="Circle") {
            var x_shift=(pos.x-pos_0.x)/shape_factor;
            var y_shift=(pos.y-pos_0.y)/shape_factor;
            if (dir==1){
                this.x=this.x0+y_shift/2;
                this.y=this.y0+y_shift/2;
                this.w=this.w0-y_shift;
                this.h=this.h0-y_shift;
            }else if (dir==2){
                this.x=this.x0-x_shift/2;
                this.y=this.y0+y_shift/2;
                this.w=this.w0+x_shift;
                this.h=this.h0-y_shift;
            }else if (dir==3){
                this.x=this.x0-x_shift/2;
                this.y=this.y0-x_shift/2;
                this.w=this.w0+x_shift;
                this.h=this.h0+x_shift;
            }else if (dir==4){
                this.x=this.x0-x_shift/2;
                this.y=this.y0-y_shift/2;
                this.w=this.w0+x_shift;
                this.h=this.h0+y_shift;
            }else if (dir==5){
                this.x=this.x0-y_shift/2;
                this.y=this.y0-y_shift/2;
                this.w=this.w0+y_shift;
                this.h=this.h0+y_shift;
            }else if (dir==6){
                this.x=this.x0+x_shift/2;
                this.y=this.y0-y_shift/2;
                this.w=this.w0-x_shift;
                this.h=this.h0+y_shift;
            }else if (dir==7){
                this.x=this.x0+x_shift/2;
                this.y=this.y0+x_shift/2;
                this.w=this.w0-x_shift;
                this.h=this.h0-x_shift;
            }else if (dir==8){
                this.x=this.x0+x_shift/2;
                this.y=this.y0+y_shift/2;
                this.w=this.w0-x_shift;
                this.h=this.h0-y_shift;
            }
        } else {
            if (this.theta==0){
                var x_shift=pos.x-pos_0.x;
                var y_shift=pos.y-pos_0.y;
            }else{
                var x_shift=rotateXCoord(pos.x-pos_0.x,pos.y-pos_0.y,-this.theta);
                var y_shift=rotateYCoord(pos.x-pos_0.x,pos.y-pos_0.y,-this.theta);
            }
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
            }else if (dir==9){
                this.theta=Math.atan((pos.x-this.x-this.w/2)/(pos.y-this.y-this.h/2))
            }
        }
    }
    
    var selfObj={
        shape: shape,
        noFeature: nextShapeValue,
        x:x0,
        y:y0,
        x0:x0,
        y0:y0,
        w:x-x0,
        h:y-y0,
        w0:x-x0,
        h0:y-y0,
        theta: 0,
        theta0: 0,
        centre:{
            x:x0+(x-x0)/2,
            y:y0+(y-y0)/2,
            x0:x0+(x-x0)/2,
            y0:y0+(y-y0)/2
        },
        cursor: "pointer",
        id: id_count++,
        moveCentre: function(){
            this.centre.x=this.centre.x0+this.x-this.x0;
            this.centre.y=this.centre.y0+this.y-this.y0;
        },
        recalculateCentre: function(x,y,w,h,theta,centre){
            // Calculates centre after amendment of rotated shape
            if (centre.x!=x+w/2||centre.y!=y+h/2){
                if (theta==0){
                    centre.x=x+w/2;
                    centre.y=y+h/2;
                } else {
                    var c=rotateCoords(x+w/2,y+h/2,theta,centre);
                    centre.x=c.x;
                    centre.y=c.y;
                }
            }
            return centre;
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
            if (this.shape=="Line"){
                this.x1=this.x10+x_shift;
                this.y1=this.y10+y_shift;
                this.x2=this.x20+x_shift;
                this.y2=this.y20+y_shift;
                this.x3=this.x30+x_shift;
                this.y3=this.y30+y_shift;
            }
            this.moveCentre();
        },
        amend: amend,
        changePos: function(){
            if (this.shape!="Line") this.normaliseCoords();
            this.centre=this.recalculateCentre(this.x,this.y,this.w,this.h,this.theta,this.centre);
            this.centre.x0=this.centre.x;
            this.centre.y0=this.centre.y;
            this.x0=this.centre.x-this.w/2;
            this.y0=this.centre.y-this.h/2;
            this.w0=this.w;
            this.h0=this.h;
            this.x=this.x0;
            this.y=this.y0;
            this.theta0=this.theta;
            if (this.shape=="Line") {
                this.x10=this.x1;
                this.y10=this.y1;
                this.x20=this.x2;
                this.y20=this.y2;
                this.x30=this.x3;
                this.y30=this.y3;
                this.createBoxes()
            }
            this.boundingRect.selectedIdx=0;
        },
        resetPos: function(){
            this.centre.x=this.centre.x0;
            this.centre.y=this.centre.y0;
            this.x=this.x0;
            this.y=this.y0;
            this.w=this.w0;
            this.h=this.h0;
            this.theta=this.theta0
            if (this.shape=="Line") {
                this.x1=this.x10;
                this.y1=this.y10;
                this.x2=this.x20;
                this.y2=this.y20;
                this.x3=this.x30;
                this.y3=this.y30;
            }
            this.boundingRect.selectedIdx=0;
        },
        boundingRect: 0,
        createBoundingRect: function(){
            var i = this.boundingRect.selectedIdx;
            this.boundingRect=createBoundingRect(this);
            this.boundingRect.redraw()
            this.boundingRect.selectedIdx=i;
        },
        interact: function(pos,pos_0){
            if (this.boundingRect.selectedIdx==-1) this.move(pos,pos_0);
            else{
                this.amend(pos,pos_0,this.boundingRect.selectedIdx);
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
        selfObj.boundingRect.selectedIdx=idx;
    }
    
    // Line specific object functionality
    // Hacky way to implement inheritance...
    if (shape=="Line"){
        selfObj.x1=selfObj.x+selfObj.w/3;
        selfObj.y1=selfObj.y+selfObj.h/3;
        selfObj.x2=selfObj.x+2*selfObj.w/3;
        selfObj.y2=selfObj.y+2*selfObj.h/3;
        selfObj.x3=selfObj.x+selfObj.w;
        selfObj.y3=selfObj.y+selfObj.h;
        selfObj.x10=selfObj.x1;
        selfObj.y10=selfObj.y1;
        selfObj.x20=selfObj.x2;
        selfObj.y20=selfObj.y2;
        selfObj.x30=selfObj.x3;
        selfObj.y30=selfObj.y3;
        selfObj.w=0;
        selfObj.h=0;
        selfObj.getCoord = function(t){
            return {
                x: Math.pow(1-t,3)*this.x+3*t*Math.pow(1-t,2)*this.x1+3*(1-t)*Math.pow(t,2)*this.x2+Math.pow(t,3)*this.x3,
                y: Math.pow(1-t,3)*this.y+3*t*Math.pow(1-t,2)*this.y1+3*(1-t)*Math.pow(t,2)*this.y2+Math.pow(t,3)*this.y3
            }
        }
        selfObj.getDiff = function(t){
            return {
                x: 3*Math.pow(1-t,2)*(this.x1-this.x0)+6*(1-t)*t*(this.x2-this.x1)+3*Math.pow(t,2)*(this.x3-this.x2),
                y: 3*Math.pow(1-t,2)*(this.y1-this.y0)+6*(1-t)*t*(this.y2-this.y1)+3*Math.pow(t,2)*(this.y3-this.y2)
            }
        }
        selfObj.getSecDiff = function(t){
            return {
                x: 6*(1-t)*(this.x2-2*this.x1+this.x0)+6*t*(this.x3-2*this.x2+this.x1),
                y: 6*(1-t)*(this.y2-2*this.y1+this.y0)+6*t*(this.y3-2*this.y2+this.y1)
            }
        }
        // Creates lots of rectangles for object detection
        selfObj.detectionBoxes=[];
        selfObj.drawBoxes = function(){
            for (var i=0; i<this.detectionBoxes.length; i++){
                this.detectionBoxes[i].draw()
            }
        }
        selfObj.createBoxes = function(){
            selfObj.detectionBoxes=[];
            var t=0; var t_n=0;
            var p=this.getCoord(t); var p_n;
            var d;
            var lambda;
            var h=12;
            // var phi0=Math.sqrt(Math.pow(this.x-this.x1,2)+Math.pow(this.y-this.y1,2))/250;
            // var phi1=Math.sqrt(Math.pow(this.x2-this.x3,2)+Math.pow(this.y2-this.y3,2))/250;
            // console.log(phi0,phi1);
            p.y=p.y-h/2-2.25;
            p.x=p.x-2.25;
            while (t<=1){
                d=this.getSecDiff(t);
                t_n=t+0.01
                p_n=this.getCoord(t_n);
                // p_n.x=p_n.x;
                p_n.y=p_n.y-h/2;
                if (t<0.3){
                    lambda=-Math.pow(5*(-t+0.3),2);
                    p_n.x=p_n.x+lambda;
                    p_n.y=p_n.y+lambda;
                    // h=12-lambda*6;
                }
                if (t>0.7){
                    lambda=Math.pow(5*(t-0.7),2);
                    p_n.x=p_n.x-lambda;
                    p_n.y=p_n.y+lambda;
                }
                
                theta=calcAngle(p,p_n);
                w=Math.sqrt(Math.pow(p_n.x-p.x,2)+Math.pow(p_n.y-p.y,2));
                this.detectionBoxes.push(createDetectionBox(p,w,theta,h));
                
                // Update parameters for next iteration
                t=t_n;
                p=p_n;
            }
            
            function calcAngle(p,p_n){
                if (Math.abs(p.x)<0.5) theta=-Math.PI/2*Math.sign(p.y);
                else theta=Math.atan((p_n.y-p.y)/(p_n.x-p.x));
                return -theta;
            }
            
            function createDetectionBox(p,w,theta,h=5){
                var obj={
                    x: p.x-1,
                    y: p.y,
                    w: w+5,
                    h: h,
                    centre: {
                        x: p.x+w/2,
                        y: p.y+h/2
                    },
                    theta: theta,
                    isInside: function(pos){
                        // pos=rotateCoords(pos.x,pos.y,-obj.theta,obj.c);
                        console.log(pos);
                        console.log(this);
                        return isInside(pos,this);
                    },
                    draw: function(){
                        drawRect(this,false,true);
                    }
                }
                return obj;
            }
        }
        selfObj.createBoxes();
    }
    if (shape=="Snake"){
        // Default thickness
        var l = 10;
        
        // Make start and end of line
        selfObj.points=[{x: x0, y: y0, l: l}, {x: x, y: y, l: l}];
        selfObj.create = function(pos){
            // Change last point to mouse position
            var n = this.points.length-1;
            pos.l = l;
            this.points[n]=pos;
            
            // If mouse position is more than 30 px from previous point, add a new point
            var dist = Math.pow(pos.x-this.points[n-1].x,2)+Math.pow(pos.y-this.points[n-1].y,2);
            if (dist>900) selfObj.points.append(pos);
        }
        selfObj.complete = function(){
            //
        }
        selfObj.redraw = function(){
            drawSnake(this);
        }
    }
    return selfObj;
}

function getShapeByID(id){
    for (var j = 0; j < shapes.length;j++){
        if (id == shapes[j].id) {
            return j;
        }
    }
}

// Deletes a given shape, default is selected shape - Work an undo here??
function deleteShape(i = state.selectedNo, addToUndo=true) {
    if (i>-1) {
        if (addToUndo) state.addUndo(i, 'create', Object.assign({}, shapes[i]));
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
    //var background = document.getElementById("imageCanvas");
    // UICanvas.width=drawerRect.w;
    drawCanvas.width = document.getElementById("canv_cont").clientWidth;
    drawCanvas.height = document.getElementById("canv_cont").clientHeight;
    drawCanvas.cursor="auto";
}

function clrCanvas(){
    ctx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
}

function resetCanvas(){
    clrCanvas();
    init();
    for (var i=0;i<shapes.length;i++){
        shapes[i].redraw();
    }
}

$(".UICanvas").hover(function () {
    document.getElementById("UICanvas").style.pointerEvents = "none";
});

// ---------
// Handles mouse activity for shape drawing
// ---------

var flag=1;
var focusObject=null;
var buttonPressed=false;
var shapePressed=false;
var shapeAmended=false;
var cursorLock = false;
var disableSelectReset=false;
var tablePressed;
var tableButton = 8;
element.addEventListener("mousedown", function(e){
    mP_0=getMousePos(drawCanvas,e);
    // console.log(mP_0);
    buttonPressed=false;
    shapePressed = false;
    shapeAmended=false
    tablePressed = false;
    disableSelectReset=false;
    cursorLock=true;
    updateRows();

    document.getElementById("UICanvas").style.pointerEvents = "none";

    if (!preventDrawing) {
        t_0 = e.timeStamp;
        // Check user is clicking buttons
        for (var i = 0; i < buttons.length; i++) {
            if (isInside(mP_0, buttons[i].rect) && !buttonPressed) {
                buttons[i].click();
                buttonPressed = true;
                tablePressed = false;
                // For keeping last highlighted shape when table button is clicked
                if (i == tableButton) {
                    tablePressed = true
                }

                document.getElementById("UICanvas").style.pointerEvents = "all";
            }
        }
    }
    
    // Check user is clicking shapes 
    // First check if user is clicking selected shape (if one is selected)
    var temp;
    if (state.selectedNo > -1 && (idx = shapes[state.selectedNo].boundingRect.isInside(mP_0)) && !preventDrawing && !exploringMode) {
        shapes[state.selectedNo].boundingRect.selectBox(idx);
        state.selectShape(state.selectedNo);
        // Ensures drop down cant be used
        shapeHighlighted = false;
    } else {
        console.log(disableSelectReset);
        if (!highlightRemoval&&!disableSelectReset)
        {
            state.resetSelected();
        }
        
        // Check collision for all shapes (reverse loop for z-order)
        for (var i = shapes.length - 1; i >= 0; i--) {
            if (shapes[i].isInside(mP_0) && !buttonPressed && !shapePressed && !preventDrawing && !exploringMode) {
                state.selectShape(i);
                shapes[i].boundingRect.selectedIdx = -1;
                allShapes();
                // Allow a prompt
                noAccess = false;
                // Give a feature to a selected shape
                getFeature(shapes[i]);
                updateRows(i);
                 // Ensures drop down cant be used
                stopDropDown = false;
                // Ensures drop down cant be used
                shapeHighlighted = false;
            }
        }
    }
    
    
    if (isInside(mP_0, drawerRect) && !buttonPressed && !shapePressed && shapes != [] && !preventDrawing && !exploringMode) {
        flag = 0;
        // Relevant prompt
        noshapeDrawn();
    }

    focusObject = getFocusObject(getMousePos(drawCanvas, e));
    updateCursor(focusObject.cursor); 
    
    resetCanvas();
    
    
}, false);

var stopDropDown = false;

element.addEventListener("mousemove", function(e){
    shapeDrawn=false;
    
    //Check if object is not currently being used
    if (!cursorLock) focusObject = getFocusObject(getMousePos(drawCanvas, e));
    updateCursor(focusObject.cursor);

    stopDropDown = false;

    t=e.timeStamp;
    mP = getMousePos(drawCanvas, e);
    if (state.focusNo > -1) {
        if (t-t_0>75){
            shapes[state.focusNo].interact(mP,mP_0);
            resetCanvas();
            shapeAmended = true;
            stopDropDown = true;
        }
    } else if (flag === 0) {
        // Check user is dragging (150 was chosen from experiments)
        if (state.shape!="None"&&t-t_0>150){ 
            resetCanvas();
            drawShape(mP_0.x,mP_0.y,mP.x-mP_0.x,mP.y-mP_0.y,state.shape);
            shapeDrawn = true;   
            stopDropDown = true;
        }
    }

    // Make dropdown unclickable when dragging a shape or amending it.
    if (stopDropDown & !shapeHighlighted) {
        document.getElementById("featureDropdownContainer").style.pointerEvents = "none"
        document.getElementById("submit").style.pointerEvents = "none"

    }
    else {
        document.getElementById("featureDropdownContainer").style.pointerEvents = "all"
        document.getElementById("submit").style.pointerEvents = "all"
    }
    updateCursor(mP);
}, false);
element.addEventListener("mouseup", function(e){
    flag=1;
    cursorLock=false;
    if (state.focusNo>-1){  // If user was interacting with a shape (amend, move)
        if (shapeAmended) state.addUndo(state.focusNo);
        shapes[state.focusNo].changePos();
    }
    if (shapeDrawn){
        shapes.push(createShape(mP_0.x, mP_0.y, mP.x, mP.y, state.shape));
        state.addUndo(shapes.length-1, 'delete', Object.assign({}, shapes[shapes.length-1]));
        allShapes();
        state.selectShape(shapes.length - 1);
        noAccess = false;
        getFeature(shapes[shapes.length - 1]);
    }
    // Unfocus anything
    state.focusNo=-1
    resetCanvas();
}, false);
element.addEventListener("keydown", function(e){
    if (e.keyCode==46) deleteShape();
    if (e.keyCode == 90 && e.ctrlKey) undo();
    if (e.keyCode == 89 && e.ctrlKey) redo();
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
    return pos.x >= rect.x && pos.x <= rect.x+rect.w && pos.y <= rect.y+rect.h && pos.y >= rect.y
}

function isInsideButtons(pos){
    for (var i=0;i<buttons.length;i++) if (isInside(pos,buttons[i].rect)) return true;
}

function defaultState(keep_shape=false, keepUndoRedoStacks=false){
    var outObj={
        drawing: false,
        focusNo: -1,
        selectedNo: -1,
        addUndo: function(idx, action='amend', shape=Object.assign({}, shapes[idx]), clearStack=true){
            // clearStack will be false if called from a redo: 
            //      interacting with the canvas should reset the redoStack
            // Have to copy centre object also since js has no deep copy
            if (action!='clear') shape.centre=Object.assign({},shape.centre);
            if (clearStack) this.redoStack=[];
            this.undoStack.push({
                shapeIndex: idx,
                shape: shape,
                action: action
            });
        },
        addRedo: function(obj){
            obj=Object.assign({}, obj)
            if (obj.action!='clear'){
                obj.shape=Object.assign({}, obj.shape);
                obj.shape.centre=Object.assign({}, obj.shape.centre);
            }
            this.redoStack.push(obj);
        },
        undoStack: [],
        redoStack: [],
        undo: function(){
            if (this.undoStack.length<1) return;
            this.resetSelected();
            undoObj=this.undoStack.pop();
            i=undoObj.shapeIndex;
            if (undoObj.action!='clear') this.addRedo(undoObj);
            if (undoObj.action=='amend'){
                shapes[i]=Object.assign({}, undoObj.shape);
                shapes[i].resetPos();
                this.selectShape(i);
            } else if (undoObj.action=='delete'){
                deleteShape(i,false);
            } else if (undoObj.action=='create'){
                shapes.splice(i,0,Object.assign({}, undoObj.shape));
                this.selectShape(i);
            } else if (undoObj.action=='clear'){
                shapes=undoObj.shape;
            }
            resetCanvas();
        },
        redo: function(){
            if (this.redoStack.length<1) return;
            this.resetSelected();
            redoObj=this.redoStack.pop();
            i=redoObj.shapeIndex;
            this.addUndo(i, redoObj.action, Object.assign({}, redoObj.shape), false);
            if (redoObj.action=='amend'){
                shapes[i]=Object.assign({}, redoObj.shape);
                shapes[i].changePos();
                this.selectShape(i);
            } else if (redoObj.action=='delete'){   // Should recreate the shape if undo deleted
                shapes.splice(i,0,Object.assign({}, redoObj.shape));
                this.selectShape(i);
            } else if (redoObj.action=='create'){   // vice versa
                deleteShape(i);
            }
            resetCanvas();
        },
        selectShape: function(i){
            this.focusNo=i;
            this.selectedNo=i;
            shapePressed=true;
            shapes[i].selected=true;
            updateTable(shapes);
            updateRows(globalShapes.findIndex(el => el.id === shapes[i].id));
        },
        resetSelected: function(){
            if (this.selectedNo > -1 && !tablePressed) {
                try{
                    shapes[this.selectedNo].selected=false;
                } catch (err) { }

                this.focusNo = -1;
                this.selectedNo = -1;
            }

            // If table button is pressed last highlighted shape is preserved
            if (tablePressed)
            {
                try {
                    shapes[this.selectedNo].selected = true; 
                    shapePressed = true;
                    updateTable(shapes);
                    updateRows(globalShapes.findIndex(el => el.id === shapes[this.selectedNo].id));
                } catch (err) { }
            }
        }
    }
    if (keep_shape) outObj.shape=state.shape;
    if (keepUndoRedoStacks){
        outObj.undoStack=state.undoStack;
        outObj.redoStack=state.redoStack;
    }
    else outObj.shape = "None";
    return outObj;
}

function getHighlightedShape(index) {
    let indexs = shapes.findIndex(el => el.id === index)
    return indexs
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

// Draws a rectangle with the given parameters
// Joins up the four corners and then fills: this allows the corners to be rotated
// Boolean parameters describe the type of box for styling purposes
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
        if (typeof shape.colour!="undefined") ctx.fillStyle=shape.colour;
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
    ctx.closePath();
}

// Draws circle with given parameters
function drawEllipse(shape){
    ctx.beginPath();
    // Transform coordinates
    var e;
    if (shape.theta!=0) {
        shape.shape="Ellipse";
        e=rotateRect(shape,shape.p); 
    }else{
        e={
            x_t_l:shape.x,              y_t_l:shape.y,
            x_t_c:shape.x+shape.w/2,    y_t_c:shape.y,
            x_t_r:shape.x+shape.w,      y_t_r:shape.y,
            x_b_l:shape.x,              y_b_l:shape.y+shape.h,
            x_b_c:shape.x+shape.w/2,    y_b_c:shape.y+shape.h,
            x_b_r:shape.x+shape.w,      y_b_r:shape.y+shape.h
        }
    }
    // Draw two bezier curves between top and bottom of bounding box
    ctx.moveTo(e.x_t_c,e.y_t_c);
    ctx.bezierCurveTo(
        e.x_t_r,e.y_t_r,
        e.x_b_r,e.y_b_r,
        e.x_b_c,e.y_b_c);
    ctx.bezierCurveTo(
        e.x_b_l,e.y_b_l,
        e.x_t_l,e.y_t_l,
        e.x_t_c,e.y_t_c);
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

function drawSnake(shape){
    for (var i=0; i<shape.points.length-1; i++){
        // Draw two quadratic bezier curves for snake boundaries
        ctx.beginPath();
        ctx.moveTo(shape.points[i].x,shape.points[i].y);,
        ctx.quadraticCurveTo(
            // figure out what this should be
            shape.points[i+1].x,shape.points[i+1].y
        )
    }
}

function rotateCoords(x,y,theta,p={x:0,y:0}){
    return {
        x:rotateXCoord(x,y,theta,p),
        y:rotateYCoord(x,y,theta,p)
    };
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
    
    if (rect.shape=="Ellipse"){
        o.x_t_c=rotateXCoord(rect.x+rect.w/2,rect.y,rect.theta,p)
        o.y_t_c=rotateYCoord(rect.x+rect.w/2,rect.y,rect.theta,p)
        o.x_b_c=rotateXCoord(rect.x+rect.w/2,rect.y+rect.h,rect.theta,p)
        o.y_b_c=rotateYCoord(rect.x+rect.w/2,rect.y+rect.h,rect.theta,p)
    }
    return o;
}

var currentShape;
var noAccess = true;
var nextShape = false;
var nextShapeValue = "-"

// Two prompts for no features and current features. 
function getFeature(shape)
{
    if (shape.noFeature == "-" && !noAccess)
    {
        document.getElementById("featureLabel").innerHTML = ("What feature is this " + shape.shape + "? " + "&nbsp; <i class='fa fa-caret-down'></i>")
    }
    else if (!noAccess)
    {
        document.getElementById("featureLabel").innerHTML = ("Feature: " + shape.noFeature + "&nbsp; <i class='fa fa-caret-down'></i>")
    }

    // If on submit a user clicks a shape then the colour of the dropdown goes from red to grey
    document.getElementById("featureLabel").style.backgroundColor = "rgba(0,0,0,0.1)"
    // Stores the highlighted shape until it is used in addFeatures();
    currentShape = shape;
    // Breaks out of "Next Feature"
    nextShape = false
    // Gives next shape no feature
    nextShapeValue = "-"
}

// When clicking any part of the canvas except a shape or a button, prompts user to pick a feature
function noshapeDrawn() {
    if (!nextShape)
    {
        document.getElementById("featureLabel").innerHTML = ("What feature will you draw? " + "&nbsp; <i class='fa fa-caret-down'></i>")
        document.getElementById("featureLabel").style.backgroundColor = "rgba(0,0,0,0.1)"
        // No access to other prompts above in getFeature()
        noAccess = true
    }
}

// Give a shape a feature
function addFeature(feature) {
    // If no access is true then an image is not highlighted hence "Next Feature"
    // If !noAccess then a shape is highlighted hence given a feature
    if (!noAccess)
    {
        globalShapes[getHighlightedShape(currentShape.id)].noFeature = feature;
        updateTable(shapes);
        updateRowsRed(getHighlightedShape(currentShape.id), "Red");
    }
    else {
        document.getElementById("featureLabel").innerHTML = ("Next Feature: " + feature + "&nbsp; <i class='fa fa-caret-down'></i>")
        // If this is true then it prevents asking what feature to draw when clicking the canvas and allows a future shape to be given a feature
        nextShape = true
        nextShapeValue = feature;
    }
     // IF on submit a user clicks a shape then the colour of the dropdown goes from red to grey
    document.getElementById("featureLabel").style.backgroundColor = "rgba(0,0,0,0.1)"
}

// Prevents drawing or clicking shapes when on drop down
// Keeps shape highlighted when clicking drop down feature
var highlightRemoval
function changeTo() {
    preventDrawing = true;
    highlightRemoval = false;
}

// Opposite of above
function changeBack() {
    preventDrawing = false;
    highlightRemoval = true;
}

// Prevent Drawing or clicking shapes when on a table
$(".HideTable").hover(function () {
    preventDrawing = true
}, function () {
    preventDrawing = false;
});

$(".FeatureList").hover(function () {
    preventDrawing = true
}, function () {
    preventDrawing = false;
});

$(".cheatSheet").hover(function () {
    preventDrawing = true
}, function () {
    preventDrawing = false;
});