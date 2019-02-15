// Setup
var drawCanvas = document.getElementById("drawCanvas");
var UICanvas = document.getElementById("UICanvas");

var ctx = drawCanvas.getContext("2d");
var ui_ctx = UICanvas.getContext("2d");

var element=$('#target')[0];
var parentDiv = document.getElementById("canv_cont");
var state=State();

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
var button_map = {};
// button_x_right_shift=300

var exploringMode = true;
//Left sitting buttons
buttons.push(Button(button_x_shift,5,button_size,button_size,
    function () { showAnnotation(); }, "Switch", "D, N"))
buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
    function () {  }, "Layers"))


/**
 * Toggles between drawing tool and AladinLite
 * 
 * @returns {undefined}
 */
function showAnnotation() {
    exploringMode = false;
    if (buttons.length == 2)
    {
        // Activates drawing tool
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].clear()
        }
        button_map={};
        buttons = [];
        $("i.btn").remove()
        button_x_shift = 5;

        buttons.push(Button(button_x_shift, 5, button_size, button_size,
            function () { showAnnotation(); }, "Switch", "D, N"))
            
        $(".nav").hide()
        $(".annotate").show()

        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { drawWith("Rect"); }, "Rect", "R"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { drawWith("Circle"); }, "Circle", "C"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { drawWith("Ellipse"); }, "Ellipse", "E"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { drawWith("Line"); }, "Line", "L"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { drawWith("Snake"); }, "Snake", "S"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { drawWith("Region"); }, "Region", "A"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { drawWith("Freehand"); }, "Freehand", "F"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { deleteShape(); }, "Delete", "Del"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { undo();}, "Undo", "Ctrl+Z"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { redo();}, "Redo", "Ctrl+Y"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { clear(); }, "Reset"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { showHideTable(); }, "Table", "T"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { showHideCheatSheet(); }, "Info", "I"))

        $('.aladin-zoomControl').css('right', '4000');
        $('.aladin-layersControl-container').css('top', '4000');
        $('.aladin-layersControl-container').css('left', '4000');
        document.getElementById("aladin-lite-div").style.pointerEvents = "none";
        $('.aladin-layerBox').css('display', 'none');

        state.resetSelected();
        state = State(false,true);
    }
    else {
        // Activates AL
        exploringMode = true;
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].clear()
        }
        buttons = [];
        button_map={};
        $("i.btn").remove()
        button_x_shift = 5;

        buttons.push(Button(button_x_shift, 5, button_size, button_size,
            function () { showAnnotation(); }, "Switch", "D, N"))
        buttons.push(Button(button_x_shift += button_x_inc, 5, button_size, button_size,
            function () { }, "Layers"))
        $(".nav").show()
        $(".annotate").hide()
        document.getElementById("myCheatSheet").style.width = "0";
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("aladin-lite-div").style.pointerEvents = "unset";
        hideAll();

        $('.aladin-layersControl-container').css('top', '4');
        $('.aladin-layersControl-container').css('left', '41');
        $('.aladin-zoomControl').css('right', '8');
        noshapeDrawn();
        nextShape = false;

        state.resetSelected();
        state = State(false,true);
    }
}

/**
 * Changes the drawing tool to the passed shape
 * 
 * @param {string} shape The shape to draw: "Rect", "Circle", "Ellipse", "Line", "Snake", "Region", "Freehand"
 * @returns {number}
 */
function drawWith(shape){
    state.shape = shape;
}

/**
 * Performs an undo, removing the most recent action from the undo stack
 * 
 * @returns {number}
 */
function undo(){
    state.undo();
    updateTable(shapes);
    allShapes();
    disableSelectReset=true;
}

/**
 * Performs a redo, adding the most recent action from the redo stack
 * 
 * @returns {number}
 */
function redo(){
    state.redo();
    updateTable(shapes);
    allShapes();
    disableSelectReset=true;
}

/**
 * Deletes all shapes. Resets drawing tool to not chosen.
 * 
 * @returns {number}
 */
function clear(){
    state = State(true, true);
    state.addUndo(-1, 'clear', shapes.slice());
    shapes = [];
    resetCanvas();
    updateTable(shapes);
}

/** 
 *  @typedef Rect
 *  @type {Object}
 *  @property {number} x The X-coordinate of top left.
 *  @property {number} y The Y-coordinate of top left.
 *  @property {number} w The width.
 *  @property {number} h The height.
 *  @property {number} theta The angle of rotation.
 */

/** 
 *  Creates a Rect
 *  @param {number} x The X-coordinate of top left.
 *  @param {number} y The Y-coordinate of top left.
 *  @param {number} w The width.
 *  @param {number} h The height.
 *  @param {number} [theta=0] The angle of rotation.
 *  @returns {Rect}
 */
function Rect(x, y, w, h,theta=0){
    return {
        x:x,
        y:y,
        w:w,
        h:h,
        theta:theta
    }; 
}

/** 
 *  @typedef Point
 *  @type {Object}
 *  @property {number} x The X-coordinate.
 *  @property {number} y The Y-coordinate.
 *  @returns {Point}
 */

/** 
 *  Creates a Point
 *  @param {number} x The X-coordinate.
 *  @param {number} y The Y-coordinate.
 *  @returns {Point}
 */
function Point(x, y){
    return {
        x:x,
        y:y
    }; 
}

/** 
 *  @typedef Button
 *  @type {Object}
 *  @property {Rect} rect The positional attributes of button
 *  @property {string} img The icon to use. Possible options are 'Rect','Circle','Ellipse','Line'
 *  @property {boolean} toggle Whether the button acts as a toggle
 *  @property {CanvasRenderingContext2D} ctx The canvas context to draw on
 *  @method {function} behaviour The behaviour to execute when clicked.
 *  @property {function} redraw Redraws the button
 *  @property {string} cursor The cursor type that should appear when hovering
 *  @property {boolean} clicked Whether the button is toggled
 *  @property {function} click Executes behaviour, untoggles other buttons if button is a toggle
 *  @property {function} unclick Redraws the button as an untoggled button
 *  @property {function} clear Clears the canvas in over the button's space
 */

/** 
 * Returns an object (button) with positional attributes and a function (behaviour) to run when pressed.
 * 
 *  @param {number} x The X-coordinate of top left.
 *  @param {number} y The Y-coordinate of top left.
 *  @param {number} w The width.
 *  @param {number} h The height.
 *  @param {function} behaviour The behaviour to execute when clicked.
 *  @param {string} img The icon to use. Possible options are 'Rect','Circle','Ellipse','Line'
 *  @param {boolean} [toggle=false] Whether the button should act as a toggle
 *  @param {string} [hotkey=""] The hotkey for button
 *  @returns {Button}
 */
function Button(x, y, w, h, behaviour, img, hotkey=""){
    drawButton=function(btn){
        btn.ctx.beginPath();
        btn.ctx.rect(btn.rect.x,btn.rect.y,btn.rect.w,btn.rect.h);
        btn.ctx.fillStyle='rgba(255,255,255,0.2)';
        btn.ctx.fill();
        btn.ctx.closePath();
        btn.ctx.font = "24px Arial";
        btn.ctx.textAlign = "center";
        
        if (btn.toggle) btn.ctx.beginPath()
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
        
        if (btn.toggle){
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
        rect: Rect(x, y, w, h),
        img: img,
        toggle:false,
        ctx: ui_ctx,
        // element: ,
        behaviour: behaviour,
        redraw: function redraw(){
            drawButton(this);
        },
        cursor: "pointer",
        clicked: false,
        click: function(){
            if (!this.clicked) {
                if (this.toggle) resetButtons();
                this.clicked=true;
                this.redraw();
                this.behaviour();
                var temp_this=this;
                if (!this.toggle){
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
    if (o.img=="Rect"||o.img=="Circle"||o.img=="Ellipse"||o.img=="Line"||o.img=="Snake"||o.img=="Region"||o.img=="Freehand")
        o.toggle=true;

    button_map[img] = buttons.length;
    // Creates <i> elements for each button for hotkey to show when hovering
    var c = (exploringMode ? "nav" : "annotate");
    $("<i>", {
        'id': o.img+"Hotkey",
        'class': c +" btn",
        'title': hotkey,
        css: {
            position: "absolute",
            display: "inline",
            "z-index": 8,
            "left": o.rect.x,
            "top": o.rect.y,
            "width": o.rect.w,
            "height": o.rect.h
        }
    }).appendTo("#iconList");
    if (o.img=="Snake")
        $('#'+o.img+'Hotkey').html(
            "<svg><path fill='rgba(255, 0, 0, 0.4)' stroke='rgba(255, 0, 0, 0.4)' stroke-width='2' stroke-linejoin='round' stroke-dashoffset='' fill-rule='nonzero' marker-start='' marker-mid='' marker-end='' id='svg_21' d='M4.591836683604182,13.826530623192681 ' style='color: rgb(255, 0, 0);' class=''/><path fill='rgba(255, 0, 0, 0.4)' fill-opacity='1' stroke='rgba(255, 0, 0, 0.4)' stroke-opacity='1' stroke-width='1' stroke-dasharray='none' stroke-linejoin='round' stroke-linecap='butt' stroke-dashoffset='' fill-rule='nonzero' opacity='1' marker-start='' marker-mid='' marker-end='' id='svg_1' d='M5.979592806053161,6.153060827274323 C5.081632806053162,6.071430827274322 13.408162806053161,4.683670827274323 13.571432806053162,4.683670827274323 C13.734692806053161,4.683670827274323 20.51020280605316,9.500000827274322 20.673472806053162,9.581630827274322 C20.836732806053163,9.663260827274323 25.08163280605316,15.540820827274324 25.061222806053163,15.510200827274321 C25.08163280605316,15.540820827274324 26.38775280605316,22.31633082727432 26.367342806053163,22.285710827274322 C26.38775280605316,22.31633082727432 25.979592806053162,27.70408082727432 25.95918280605316,27.673470827274322 C25.979592806053162,27.70408082727432 18.061222806053163,29.173470827274322 18.04081280605316,29.142860827274323 C18.061222806053163,29.173470827274322 7.530612806053162,29.581630827274324 7.510202806053162,29.55102082727432 C7.530612806053162,29.581630827274324 7.122452806053161,25.09184082727432 7.102042806053161,25.061220827274322 C7.122452806053161,25.09184082727432 16.836732806053163,24.765310827274323 16.81632280605316,24.734690827274324 C16.836732806053163,24.765310827274323 20.91836280605316,23.70408082727432 20.91836280605316,23.540820827274324 C20.91836280605316,23.377550827274323 21.16326280605316,21.581630827274324 21.16326280605316,21.581630827274324 C21.16326280605316,21.581630827274324 19.530612806053163,15.948980827274323 19.530612806053163,15.948980827274323 C19.530612806053163,15.948980827274323 16.51020280605316,13.091840827274323 16.489792806053163,13.061220827274322 C16.51020280605316,13.091840827274323 13.163262806053162,9.418370827274323 13.142852806053162,9.387750827274322 C13.163262806053162,9.418370827274323 5.8163228060531615,10.153060827274322 5.897962806053162,10.071430827274323 C5.979592806053161,9.989800827274323 5.734692806053162,6.2346908272743224 5.979592806053161,6.153060827274323 z' style='color: rgb(255, 0, 0);' class=''/></svg>"
        )
    if (o.img=="Region")
        $('#'+o.img+'Hotkey').html(
            "<svg><path fill='rgba(255, 0, 0, 0.4)' stroke='rgba(255, 0t, 0, 0.4)' stroke-width='2' stroke-linejoin='round' stroke-dashoffset='' fill-rule='nonzero' marker-start='' marker-mid='' marker-end='' id='svg_3' d='M3.897959453058099,15.521695094925727 L15.156072723376898,6.729899569180732 L22.526167808348127,13.46307285668531 L19.258463985547973,17.461318636075841 L26.71428523690031,21.37910091091367 L19.705514133852965,24.47272107003739 L10.424653656481786,27.02040825990399 L3.897959453058099,15.521695094925727 z' style='color: rgb(255, 0, 0);' class='selected'/></svg>"
        )
    if (o.img=="Freehand")
        $('#'+o.img+'Hotkey').html(
            "<svg><polyline fill='none' stroke='rgba(255, 0, 0, 0.4)' stroke-width='2' stroke-linejoin='round' stroke-dashoffset='' fill-rule='nonzero' marker-start='' marker-mid='' marker-end='' id='svg_1' points='8.532993354100519,8.532993354100526 8.532993354100519,8.837561870224008 8.32994767668486,9.548221741178807 7.314719289606578,11.071064321796229 7.01015077348309,11.680201354043206 6.908627934775261,11.680201354043206 7.11167361219092,11.578678515335369 7.517764967022238,10.969541483088406 8.32994767668486,10.360404450841429 10.157358773425777,9.44669890247097 12.695429741121487,8.736039031516171 14.218272321738915,8.329947676684867 14.522840837862397,8.329947676684867 14.725886515278056,8.634516192808348 14.421317999154576,9.852790257302289 13.406089612076286,10.969541483088406 12.289338386290176,12.593906902413664 10.868018644380577,14.116749483031086 9.852790257302289,14.928932192693708 9.751267418594459,15.030455031401543 9.751267418594459,15.131977870109367 9.852790257302289,15.131977870109367 10.055835934717948,15.030455031401543 10.969541483088406,14.015226644323265 12.390861224998005,12.289338386290169 13.710658128199775,10.969541483088406 15.538069224940683,9.954313096010125 15.944160579771998,9.751267418594466 15.538069224940683,10.360404450841429 14.218272321738915,12.187815547582346 12.086292708874517,14.015226644323265 9.751267418594459,15.741114902356344 8.43147051539269,17.162434644265943 8.025379160561378,17.467003160389424 8.025379160561378,17.56852599909726 8.126901999269208,17.56852599909726 9.04060754763966,16.756343289434625 10.055835934717948,15.233500708817203 11.680201354043206,13.609135289491945 13.609135289491945,11.680201354043206 15.131977870109372,10.563450128257088 16.147206257187655,9.954313096010125 16.451774773311143,9.852790257302289 16.553297612018966,9.852790257302289 16.553297612018966,10.258881612133607 16.553297612018966,11.375632837919724 15.538069224940683,13.304566773368464 13.913703805615427,15.233500708817203 11.375632837919717,17.56852599909726 10.868018644380577,17.974617353928565 10.868018644380577,17.670048837805084 11.781724192751028,16.045683418479825 13.304566773368455,13.812180966907604 15.538069224940683,12.187815547582346 17.263957482973765,11.071064321796229 18.279185870052054,10.664972966964925 17.974617353928565,11.274109999211888 16.857866128142454,12.695429741121487 15.639592063648513,14.522840837862402 13.507612450784116,16.85786612814246 11.883247031458858,18.27918587005206 11.172587160504058,18.888322902299024 11.071064321796229,18.98984574100686 11.172587160504058,18.98984574100686 12.187815547582346,17.873094515220743 13.507612450784116,16.553297612018966 15.131977870109372,14.725886515278063 16.451774773311143,13.203043934660625 16.553297612018966,12.99999825724497 16.451774773311143,13.710658128199766 15.436546386232857,15.741114902356344 13.913703805615427,17.873094515220743 11.883247031458858,19.903551289377305 10.868018644380577,20.51268832162428 10.664972966964918,20.71573399903994 10.868018644380577,20.71573399903994 11.375632837919717,20.309642644208623 13.710658128199775,18.0761401926364 15.944160579771998,15.944160579772003 18.786800063591194,14.319795160446745 20.00507412808514,13.913703805615427 20.208119805500793,13.812180966907604 20.208119805500793,14.116749483031086 20.208119805500793,14.624363676570226 19.497459934545994,16.045683418479825 17.771571676512913,18.177663031344224 16.147206257187655,20.00507412808514 14.827409353985887,21.324871031286904 14.421317999154576,21.527916708702563 14.522840837862397,21.527916708702563 15.842637741064173,20.309642644208623 17.873094515220743,18.482231547467705 19.90355128937731,16.85786612814246 21.73096238611822,15.842637741064168 21.83248522482605,15.741114902356344 21.83248522482605,16.045683418479825 20.309642644208623,17.974617353928565 18.380708708759883,20.00507412808514 16.045683418479825,21.73096238611822 14.421317999154576,22.94923645061216 14.522840837862397,22.84771361190434 15.741114902356344,21.832485224826044 17.263957482973765,20.614211160332104 18.685277224883365,19.70050561196166 19.497459934545994,19.192891418422505 19.802028450669482,18.888322902299024 19.700505611961653,19.497459934546 19.091368579714683,20.817256837747763 17.568525999097254,22.84771361190434 17.060911805558113,23.456850644151302 16.857866128142454,23.65989632156696 17.162434644265943,23.65989632156696 18.076140192636394,23.253804966735643 20.208119805500793,21.93400806353388 22.137053740949533,20.817256837747763 23.35532780544348,20.309642644208623 23.65989632156696,20.2081198055008 23.65989632156696,20.411165482916445 23.65989632156696,20.817256837747763 23.05075928931999,21.832485224826044 21.83248522482605,24.167510515106102 21.426393869994733,24.77664754735308 21.426393869994733,24.8781703860609 21.93400806353388,24.675124708645242 22.94923645061216,23.86294199898262 23.35532780544348,23.55837348285914 23.45685064415131,23.35532780544348 23.45685064415131,23.456850644151302 23.45685064415131,23.761419160274798 22.847713611904332,24.675124708645242 22.64466793448868,24.979693224768738 22.94923645061216,24.979693224768738 23.35532780544348,24.472079031229597 23.558373482859132,24.37055619252176 23.76141916027479,24.37055619252176 23.86294199898262,24.37055619252176 23.86294199898262,24.57360186993742 23.76141916027479,24.77664754735308 ' style='color: rgb(255, 0, 0);'/></svg>"
        )
    

    o.redraw();
    
    return o;
}

/**
 * Resets all buttons from a clicked state
 * @returns {undefined}
 */
function resetButtons(){
    for (var i=0;i<buttons.length;i++){
        buttons[i].unclick();
    }
}

/** 
 *  @typedef Shape
 *  @type {Object}
 *  @property {Rect} rect The positional attributes of button
 *  @property {string} img The icon to use. Possible options are 'Rect','Circle','Ellipse','Line'
 *  @property {boolean} toggle Whether the button acts as a toggle
 *  @property {HTMLElement} ctx The canvas context to draw on
 *  @property {function} behaviour The behaviour to execute when clicked.
 *  @property {function} redraw Redraws the button
 *  @property {string} cursor The cursor type that should appear when hovering
 *  @property {boolean} clicked Whether the button is toggled
 *  @property {function} click Executes behaviour, untoggles other buttons if button is a toggle
 *  @property {function} unclick Redraws the button as an untoggled button
 *  @property {function} clear Clears the canvas in over the button's space
 */

/**
 *  Returns an object (shape) with positional attributes and a function (behaviour) to run when pressed.
 * 
 *  @param {number} x The X-coordinate of top left.
 *  @param {number} y The Y-coordinate of top left.
 *  @param {number} x The X-coordinate of bottom right.
 *  @param {number} y The Y-coordinate of bottom right.
 *  @param {string} shape The type of shape. Possible options are ('Rect','Circle','Ellipse','Line','Snake','Region','Freehand')
 *  @returns {Shape}
 */
function Shape(x0,y0,x,y,shape){
    var shape_factor=1;
    if (shape!="Line") normaliseCoords();

    /**
     * Swaps (x,y) and (x0,y0) if they are bottom right, top left order.
     * Changes circle coords to be at 7pi/4 and 3pi/4 on circumference.
     * 
     * @returns {number}
     */
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

    /**
     * Checks if the given coordinate is inside rectangle shape
     * 
     * @param {Point} pos The coordinate to be checked
     * @param {Object} [obj=this] The rectangle shape object to check (used for bounding box and amend box)
     * @returns {boolean}
     */
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
    /**
     * Checks if the given coordinate is inside circle shape
     * 
     * @param {Point} pos The coordinate to be checked
     * @returns {boolean}
     */
    function isInsideCircle(pos){
        circle=cartesianToPolar(this);
        if (Math.pow(pos.x-circle.x,2)+Math.pow(pos.y-circle.y,2)<Math.pow(circle.r,2)){
            return true;
        }
        return false;
    }
    /**
     * Checks if the given coordinate is inside ellipse shape
     * 
     * @param {Point} pos The coordinate to be checked
     * @returns {boolean}
     */
    function isInsideEllipse(pos){
        ellipse=cartesianToElliptical(this);
        if (this.theta!=0){
            var pos_r=rotateCoords(pos.x,pos.y,-this.theta,this.centre);
            pos=pos_r;
        }
        if (Math.pow((pos.x-ellipse.x)/ellipse.w,2)+Math.pow((pos.y-ellipse.y)/ellipse.h,2)<=1){
            return true;
        }
        return false;
    }
    /**
     * Checks if the given coordinate is inside line shape
     * 
     * @param {Point} pos The coordinate to be checked
     * @returns {boolean}
     */
    function isInsideLine(pos){
        if (isInside(pos,this.boundingRect)){
            for (var i=0; i<this.detectionBoxes.length; i++){
                var pos_r=rotateCoords(pos.x,pos.y,-this.theta,this.centre);
                if (this.detectionBoxes[i].isInside(pos_r)) {
                    return true;
                }
            }
        }
    }
    /**
     * Checks if the given coordinate is inside snake shape
     * 
     * @param {Point} pos The coordinate to be checked
     * @returns {boolean}
     */
    function isInsideSnake(pos){
        if (isInside(pos,this.boundingRect)){
            return this.pointInPolygon(this.points, pos);
        }
    }
    /**
     * Checks if the given coordinate is inside region shape
     * 
     * @param {Point} pos The coordinate to be checked
     * @returns {boolean}
     */
    function isInsideRegion(pos){
        if (isInside(pos,this.boundingRect)){
            return this.pointInPolygon(this.points, pos);
        }
    }
    /**
     * Checks if the given coordinate is inside freehand shape
     * 
     * @param {Point} pos The coordinate to be checked
     * @returns {boolean}
     */
    function isInsideFreehand(pos){
        if (isInside(pos,this.boundingRect)){
            return this.pointInPolygon(this.points, pos);
        }
    }
    // A probably incorrect way to dynamically call the correct function depending on shape type
    var fn=eval("isInside"+shape);
    
    /** 
     *  @class BoundingRect
     *  @type {Object}
     *  @param {Shape} shape - The shape to create a bounding rectangle around
     *  @param {string} shape.shape - The type of shape
     * 
     *  @property {number} x The X-coordinate of top left.
     *  @property {number} y The Y-coordinate of top left.
     *  @property {number} w The width.
     *  @property {number} h The height.
     *  @property {number} theta The angle of rotation.
     *  @property {Point} centre The centre of the box.
     *  @property {array} amendBoxes An array containing each AmendBox object.
     *  @property {function} redraw Redraws the bounding box and its amendBoxes
     *  @property {function} selectBox Selects the AmendBox with given index. If zero, the box itself is selected.
     *  @property {number} selectedIdx The index of the selected object. If none, -1
     *  @property {function} isInside Checks if a given position is inside the BoundingRect or the amendBoxes
     *  @property {function} getObj Returns AmendBox object with given index. If -1, return this
     *  @property {string} cursor The cursor type that should appear when hovering 
     */
    function BoundingRect(shape){
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
        } else if (shape.shape=="Snake"){
            boundingRect=Object.assign({},shape);
            var min_x=99999, min_y=99999, max_x=0, max_y=0;
            var x_n,y_n;
            for (var i=0; i<shape.points.length; i++){
                if ((x_n=Math.min(shape.points[i].x_t,shape.points[i].x_b))<min_x) min_x=x_n;
                if ((y_n=Math.min(shape.points[i].y_t,shape.points[i].y_b))<min_y) min_y=y_n;
                if ((x_n=Math.max(shape.points[i].x_t,shape.points[i].x_b))>max_x) max_x=x_n;
                if ((y_n=Math.max(shape.points[i].y_t,shape.points[i].y_b))>max_y) max_y=y_n;
            }
            boundingRect.x=min_x;
            boundingRect.y=min_y;
            boundingRect.w=max_x-min_x;
            boundingRect.h=max_y-min_y;
        } else if (shape.shape=="Region"){
            boundingRect=Object.assign({},shape);
            var min_x=99999, min_y=99999, max_x=0, max_y=0;
            var x_n,y_n;
            for (var i=0; i<shape.points.length; i++){
                if ((x_n=shape.points[i].x)<min_x) min_x=x_n;
                if ((y_n=shape.points[i].y)<min_y) min_y=y_n;
                if (x_n>max_x) max_x=x_n;
                if (y_n>max_y) max_y=y_n;
            }
            boundingRect.x=min_x;
            boundingRect.y=min_y;
            boundingRect.w=max_x-min_x;
            boundingRect.h=max_y-min_y;
        } else if (shape.shape=="Freehand"){
            boundingRect=Object.assign({},shape);
            var min_x=99999, min_y=99999, max_x=0, max_y=0;
            var x_n,y_n;
            for (var i=0; i<shape.points.length; i++){
                if ((x_n=shape.points[i].x)<min_x) min_x=x_n;
                if ((y_n=shape.points[i].y)<min_y) min_y=y_n;
                if (x_n>max_x) max_x=x_n;
                if (y_n>max_y) max_y=y_n;
            }
            boundingRect.x=min_x;
            boundingRect.y=min_y;
            boundingRect.w=max_x-min_x;
            boundingRect.h=max_y-min_y;
        } else {
            boundingRect=shape;
        }
        
        /**
         * Draws the bounding rectangle
         * 
         * @param {BoundingRect} shape The boundingRect object to draw
         * @param {string} shape.shape - The type of shape
         * @returns {undefined}
         */
        function drawBoundingRect(shape){
            if (shape.shape=="Line"){
                drawRect(shape,false,true);
            } else {
                drawRect(shape,false,true);
                
            }
        }
        
        /** 
         *  @class AmendBoxes
         *  @type {Object}
         *  @param {Shape} shape - The shape to create amend boxes for
         *  @param {string} shape.shape - The type of shape
         * 
         *  @property {function} getBox Get's a single amend box with the given dir
         *  @property {function} redraw Redraws all amend boxes
         *  @property {function} isInside Checks if the given pos is inside any boxes
         */
        function AmendBoxes(shape){

            /** 
             *  @class AmendBox
             *  @type {Object}
             *  @param {Point} loc - The point to create an amend box at
             *  @param {number} dir - A unique identifier for the box (can be used to restrict direction of amendment)
             *  @param {number} theta - The angle of rotation of the box
             *  @param {Point} p - The point to rotate on
             *  @param {string} [type=""] - The type of amend box, options are "" (white), "length" (yellow), "rotate" green
             * 
             *  @property {Rect} rect The rectangle object describing the box
             *  @property {Point} p The point to rotate around
             *  @property {number} dir A unique identifier for the box (can be used to restrict direction of amendment)
             *  @property {string} cursor The cursor type to appear when user hovers
             *  @property {function} isInside Checks if the given pos is inside the amend box
             *  @property {function} redraw Redraws the amend box
             */
            function AmendBox(loc,dir,theta=0,p=Point(0,0),type=""){
                boxW=15;

                /**
                 * Draws the amend box
                 * 
                 * @param {AmendBox} shape The AmendBox object to draw
                 * @returns {undefined}
                 */
                function drawAmendRect(shape,p){
                    shape.p=p;
                    if (shape.type=="rotate") shape.colour="rgba(20, 200, 20, 0.5)";
                    if (shape.type=="length") shape.colour="rgba(220, 220, 20, 0.5)";
                    drawRect(shape,false,false,true);
                }
                
                return {
                    rect: Rect(loc.x-boxW/2,loc.y-boxW/2,boxW,boxW,theta),
                    p:p,
                    dir: dir,
                    cursor: "pointer",
                    isInside: function(pos){
                        this.rect.p=this.p;
                        return isInsideRect(pos,this.rect);
                    },
                    redraw: function(){
                        this.rect.type=type;
                        drawAmendRect(this.rect,this.p);
                    }
                }
            }

            var j=1;
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
                amendBoxes.push(AmendBox({x:x_n,y:y_n},j++));
                amendBoxes.push(AmendBox({x:x1_n,y:y1_n},j++));
                amendBoxes.push(AmendBox({x:x2_n,y:y2_n},j++));
                amendBoxes.push(AmendBox({x:x3_n,y:y3_n},j++));
            } else if (shape.shape=="Snake"){
                for (var i=0; i<shape.points.length; i++){
                    amendBoxes.push(AmendBox({x:shape.points[i].x_t, y:shape.points[i].y_t}, j++,0,0,"length"));
                    amendBoxes.push(AmendBox({x:shape.points[i].x_b, y:shape.points[i].y_b}, j++,0,0,"length"));
                }
                for (var i=0; i<shape.points.length; i++){
                    amendBoxes.push(AmendBox({x:shape.points[i].x, y:shape.points[i].y}, j++));
                }
            } else if (shape.shape=="Region"){
                for (var i=0; i<shape.points.length; i++){
                    amendBoxes.push(AmendBox({x:shape.points[i].x, y:shape.points[i].y}, j++));
                }
            } else if (shape.shape=="Freehand"){
                for (var i=0; i<shape.points.length; i++){
                    amendBoxes.push(AmendBox({x:shape.points[i].x, y:shape.points[i].y}, j++));
                }
            } else {
                x_n=boundingRect.x;
                y_n=boundingRect.y;
                var w_n=boundingRect.w;
                var h_n=boundingRect.h;
                var t=boundingRect.theta;
                var p=shape.centre;
                var r_shift=20;
                amendBoxes.push(AmendBox({x:x_n+w_n/2,y:y_n},j++,t,p));     //Up
                amendBoxes.push(AmendBox({x:x_n+w_n,y:y_n},j++,t,p));       //UpRight
                amendBoxes.push(AmendBox({x:x_n+w_n,y:y_n+h_n/2},j++,t,p)); //Right
                amendBoxes.push(AmendBox({x:x_n+w_n,y:y_n+h_n},j++,t,p));   //DownRight
                amendBoxes.push(AmendBox({x:x_n+w_n/2,y:y_n+h_n},j++,t,p)); //Down
                amendBoxes.push(AmendBox({x:x_n,y:y_n+h_n},j++,t,p));       //DownLeft
                amendBoxes.push(AmendBox({x:x_n,y:y_n+h_n/2},j++,t,p));     //Left
                amendBoxes.push(AmendBox({x:x_n,y:y_n},j++,t,p));           //UpLeft
                if (shape.shape!="Circle") 
                    amendBoxes.push(AmendBox({x:x_n+w_n/2,y:y_n-r_shift},j++,t,p,"rotate"));           //Rotation
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
            amendBoxes:AmendBoxes(shape),
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
    
    /**
     * Amends the shape based on the dir of the amend box clicked
     * 
     * @param {Point} pos Current position of cursor (during mouse drag)
     * @param {Point} pos_0 Initial position of cursor (at mouse click)
     * @param {number} dir The dir of the amend box that is being interacted with
     * @returns {undefined}
     */
    function amend(pos,pos_0,dir,modifier=false){
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
        } else if (this.shape=="Snake") {
            var idx;
            // A bit of maths to properly calculate which point is to be amended and how
            // thickness boxes have dir 0 to points.length*2-1, loc boxes have dir points.length*2 to points.length*3-1
            if (dir<this.points.length*2+1){
                if (!modifier){
                    idx=Math.floor((dir-1)/2);
                    this.points[idx].l=Math.pow(Math.pow(this.points[idx].x-pos.x,2)+Math.pow(this.points[idx].y-pos.y,2),1/2)
                } else {
                    for (var i = 0; i < this.points.length; i++) {
                        this.points[2].l = Math.pow(Math.pow(this.points[i].x-pos.x,2)+Math.pow(this.points[i].y-pos.y,2),1/2)
                    }
                }
            } else {
                idx=dir-this.points.length*2-1;
                this.points[idx].x=pos.x;
                this.points[idx].y=pos.y;
            }
            this.updatePoint(idx);
        } else if (this.shape=="Region") {
            var idx=dir-1;
            this.points[idx].x=pos.x;
            this.points[idx].y=pos.y;
        } else if (this.shape=="Freehand") {
            var idx=dir-1;
            this.points[idx].x=pos.x;
            this.points[idx].y=pos.y;
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
    
    /**
     * Updates the shape's pixel-based positional attributes from the world-based positional attributes
     * 
     * @returns {undefined}
     */
    function worldToPix(){
        if (this.shape=="Line"){
            [this.x,this.y]=aladin.world2pix(this.ra_xy,this.dec_xy);
            [this.x1,this.y1]=aladin.world2pix(this.ra1,this.dec1);
            [this.x2,this.y2]=aladin.world2pix(this.ra2,this.dec2);
            [this.x3,this.y3]=aladin.world2pix(this.ra3,this.dec3);
        } else if (this.shape=="Snake"){
            for (var i=0; i<this.points.length; i++){
                [this.points[i].x,this.points[i].y]=aladin.world2pix(this.points[i].ra_xy,this.points[i].dec_xy);
                [this.points[i].x_t,this.points[i].y_t]=aladin.world2pix(this.points[i].ra_xy_t,this.points[i].dec_xy_t);
                [this.points[i].x_b,this.points[i].y_b]=aladin.world2pix(this.points[i].ra_xy_b,this.points[i].dec_xy_b);
                this.points[i].l=Math.sqrt(Math.pow(this.points[i].x_t-this.points[i].x,2)+Math.pow(this.points[i].y_t-this.points[i].y,2));
            }
        } else if (this.shape=="Region"){
            for (var i=0; i<this.points.length; i++){
                [this.points[i].x,this.points[i].y]=aladin.world2pix(this.points[i].ra_xy,this.points[i].dec_xy);
            }
        } else if (this.shape=="Freehand"){
            for (var i=0; i<this.points.length; i++){
                [this.points[i].x,this.points[i].y]=aladin.world2pix(this.points[i].ra_xy,this.points[i].dec_xy);
            }
        } else {
            [this.x,this.y]=aladin.world2pix(this.ra_xy,this.dec_xy);
            [this.xw,this.yh]=aladin.world2pix(this.ra_wh,this.dec_wh);
            [this.w,this.h]=[this.xw-this.x,this.yh-this.y];
        }
        this.changePos(false);
        this.redraw()
    }
    
    /**
     * Updates the shape's world-based positional attributes from the pixel-based positional attributes
     * 
     * @returns {undefined}
     */
    function pixToWorld(){
        if (this.shape=="Line"){
            [this.ra_xy,this.dec_xy]=aladin.pix2world(this.x,this.y);
            [this.ra1,this.dec1]=aladin.pix2world(this.x1,this.y1);
            [this.ra2,this.dec2]=aladin.pix2world(this.x2,this.y2);
            [this.ra3,this.dec3]=aladin.pix2world(this.x3,this.y3);
        } else if (this.shape=="Snake"){
            for (var i=0; i<this.points.length; i++){
                [this.points[i].ra_xy,this.points[i].dec_xy]=aladin.pix2world(this.points[i].x,this.points[i].y);
                [this.points[i].ra_xy_t,this.points[i].dec_xy_t]=aladin.pix2world(this.points[i].x_t,this.points[i].y_t);
                [this.points[i].ra_xy_b,this.points[i].dec_xy_b]=aladin.pix2world(this.points[i].x_b,this.points[i].y_b);
            }
        } else if (this.shape=="Region"){
            for (var i=0; i<this.points.length; i++){
                [this.points[i].ra_xy,this.points[i].dec_xy]=aladin.pix2world(this.points[i].x,this.points[i].y);
            }
        } else if (this.shape=="Freehand"){
            for (var i=0; i<this.points.length; i++){
                [this.points[i].ra_xy,this.points[i].dec_xy]=aladin.pix2world(this.points[i].x,this.points[i].y);
            }
        } else {
            [this.ra_xy,this.dec_xy]=aladin.pix2world(this.x, this.y);
            [this.ra_wh,this.dec_wh]=aladin.pix2world(this.x+this.w, this.y+this.h);
        }
    }
    
    var selfObj={
        shape: shape,
        feature: nextShapeValue,
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
            else if (this.shape=="Snake") drawSnake(this);
            else if (this.shape=="Region") drawRegion(this);
            else if (this.shape=="Freehand") drawFreehand(this);
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
            } else if (this.shape=="Snake"||this.shape=="Region"){
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x=this.points[i].x0+x_shift;
                    this.points[i].y=this.points[i].y0+y_shift;
                    this.points[i].x_t=this.points[i].x0_t+x_shift;
                    this.points[i].y_t=this.points[i].y0_t+y_shift;
                    this.points[i].x_b=this.points[i].x0_b+x_shift;
                    this.points[i].y_b=this.points[i].y0_b+y_shift;
                }
            } else if (this.shape=="Freehand") {
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x=this.points[i].x0+x_shift;
                    this.points[i].y=this.points[i].y0+y_shift;
                }
            }
            this.moveCentre();
        },
        amend: amend,
        changePos: function(update_world_coordinates=true){
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
                this.createBoxes();
                this.createBoundingRect();
            } else if (this.shape=="Snake") {
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x0=this.points[i].x;
                    this.points[i].y0=this.points[i].y;
                    this.points[i].x0_t=this.points[i].x_t;
                    this.points[i].y0_t=this.points[i].y_t;
                    this.points[i].x0_b=this.points[i].x_b;
                    this.points[i].y0_b=this.points[i].y_b;
                    this.points[i].l0=this.points[i].l;
                    this.points[i].d0=this.points[i].d;
                }
            } else if (this.shape=="Region") {
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x0=this.points[i].x;
                    this.points[i].y0=this.points[i].y;
                }
            } else if (this.shape=="Freehand") {
                // CODE HERE FOR CHANGEPOS
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x0=this.points[i].x;
                    this.points[i].y0=this.points[i].y;
                }
            }
            if (update_world_coordinates) this.pixToWorld();
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
            } else if (this.shape=="Snake") {
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x=this.points[i].x0;
                    this.points[i].y=this.points[i].y0;
                    this.points[i].x_t=this.points[i].x0_t;
                    this.points[i].y_t=this.points[i].y0_t;
                    this.points[i].x_b=this.points[i].x0_b;
                    this.points[i].y_b=this.points[i].y0_b;
                    this.points[i].l=this.points[i].l0;
                    this.points[i].d=this.points[i].d0;
                }
            } else if (this.shape=="Region") {
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x=this.points[i].x0;
                    this.points[i].y=this.points[i].y0;
                }
            } else if (this.shape=="Freehand") {
                // CODE HERE FOR RESETPOS
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x=this.points[i].x0;
                    this.points[i].y=this.points[i].y0;
                }
            }
            this.pixToWorld();
            this.boundingRect.selectedIdx=0;
        },
        boundingRect: 0,
        createBoundingRect: function(){
            var i = this.boundingRect.selectedIdx;
            this.boundingRect=BoundingRect(this);
            this.boundingRect.redraw()
            this.boundingRect.selectedIdx=i;
        },
        interact: function(pos, pos_0, modifier=false){
            if (this.boundingRect.selectedIdx==-1) this.move(pos,pos_0);
            else{
                this.amend(pos,pos_0,this.boundingRect.selectedIdx, modifier);
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
        },
        note: "",
        showNote: "collapse",
        showNoteIcon: "fa fa-plus",
        flipNote: function(){
            if (this.showNote=="collapse") {
                this.showNote="expand";
                this.showNoteIcon = "fa fa-minus"
            }
            else {
                this.showNote="collapse";
                this.showNoteIcon = "fa fa-plus"
            }
        },
        pixToWorld: pixToWorld,
        worldToPix: worldToPix
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
    if (shape=="Snake"||shape=="Region"||shape=="Freehand"){
        // Default thickness
        var l = 20;
        var t_0;
        var theta
        
        var segment_length=2500;
        if (shape=="Freehand") {
            segment_length=25;
            l=10;
            selfObj.points=[];
        }
        // Make start and end of line
        var d=Math.sign(x-x0);
        selfObj.points=[{x: x0, y: y0, l: l, d: d}, {x: x, y: y, l: l}];
        

        function calcAngle(i){
            // Calculate angle between i'th and i+1'th line segment
            var x_diff_0=selfObj.points[i].x-selfObj.points[i-1].x;
            var y_diff_0=selfObj.points[i].y-selfObj.points[i-1].y;
            
            // Save old angle to check for cycling
            t_0=theta;
            selfObj.points[i].t_0=selfObj.points[i].theta;
            
            // Calculate new angle
            theta=-Math.atan(y_diff_0/x_diff_0);
            
            // Only use angle if new position isn't close. stops artifacting
            if (Math.pow(x_diff_0,2)+Math.pow(y_diff_0,2)<Math.pow(Math.sqrt(segment_length)/5,2)) theta=selfObj.points[i-1].theta
            selfObj.points[i].theta=theta;
            return theta;
        }
        function calcBuffer(theta,l){
            // Use angle to calculate offset for top and bottom of snake
            var buffer=rotateCoords(0,l,theta);
            return buffer;
        }
        function addToPoint(i,buffer){
            // Add and subtract offset to get top and bottom
            selfObj.points[i].x_t=selfObj.points[i].x+buffer.x;
            selfObj.points[i].y_t=selfObj.points[i].y+buffer.y;
            selfObj.points[i].x_b=selfObj.points[i].x-buffer.x;
            selfObj.points[i].y_b=selfObj.points[i].y-buffer.y;
        }
        
        function normsq(p1,p2){
            return Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2)
        }
        var calcTopBot = function calcTopBot(i,update=false){
            var theta;
            if (i>1) theta=calcAngle(i);
            else theta=calcAngle(1);
            
            if (update){
                t_0=selfObj.points[i].t_0;
                d = selfObj.points[i].d;
            }

            if (i>0) d=Math.sign(selfObj.points[i].x-selfObj.points[i-1].x);
            else d = Math.sign(selfObj.points[1].x-selfObj.points[0].x);
            if (d==0) d=1;

            selfObj.points[i].d=d;

            addToPoint(i,calcBuffer(theta,d*selfObj.points[i].l));
        }
        selfObj.updatePoint = function(i) {
            calcTopBot(i,true);
        }
        
        selfObj.create = function(pos){
            // Change last point to mouse position
            var n = this.points.length-1;
            pos.l = l;
            pos.d = d;
            this.points[n]=pos;
            calcTopBot(n);
            if (n<2) {
                this.points[0].theta=this.points[1].theta;
                this.points[1].t_0=this.points[1].theta;
                addToPoint(0,calcBuffer(this.points[0].theta,d*this.points[0].l));
            }
            
            // If mouse position is more than 30 px from previous point, add a new point
            var dist = normsq(pos,this.points[n-1]);
            if (dist>segment_length) this.points.push(this.points[n]);
            this.redraw();
        }
        selfObj.complete = function(){
            if (selfObj.shape=="Freehand"){
                var N = selfObj.points.length;
                var points=[];
                var new_seg_length=5;
                
                // Check to see if synthetic points need to be added
                for (var i=0; i<N-1; i++){
                    var dist = normsq(selfObj.points[i],selfObj.points[i+1]);
                    if (dist>25) {
                        dist = Math.sqrt(dist);
                        var iter = Math.floor(dist/new_seg_length);
                        var d=Math.sign(selfObj.points[i+1].x-selfObj.points[i].x)
                        var x,y,x_t,y_t,x_b,y_b;
                        var increase;
                        for (var j=0; j<iter; j++){
                            increase = rotateCoords(j*new_seg_length,0,selfObj.points[i].theta);
                            x=selfObj.points[i].x+d*increase.x;
                            y=selfObj.points[i].y+d*increase.y;
                            x_t=selfObj.points[i].x_t+d*increase.x;
                            x_b=selfObj.points[i].x_b+d*increase.x;
                            y_t=selfObj.points[i].y_t+d*increase.y;
                            y_b=selfObj.points[i].y_b+d*increase.y;
                            selfObj.points.push({x: x, y: y, x_t: x_t, y_t: y_t, x_b: x_b, y_b:y_b});
                        }
                    }
                }
                N = selfObj.points.length;
                // Add points to coordindate array
                for (var i=0; i<N; i++){
                    points.push([selfObj.points[i].x,selfObj.points[i].y])
                    points.push([selfObj.points[i].x_t,selfObj.points[i].y_t])
                    points.push([selfObj.points[i].x_b,selfObj.points[i].y_b])
                }
                // Use third party hull.js to generate convex hull
                var newpoints = module(points,50);
                selfObj.oldpoints = selfObj.points.map(a => Object.assign({}, a));
                selfObj.points=[];
                for (var i=0; i<newpoints.length; i++){
                    selfObj.points.push({
                        x: newpoints[i][0],
                        y: newpoints[i][1]
                    });
                }

                // Check if points need to be removed
                var i=0;
                N = selfObj.points.length;
                do {
                    idx=i%N;
                    next=(i+1)%N;
                    var dist = normsq(selfObj.points[idx],selfObj.points[next]);
                    if (dist<500) {
                        dist = Math.sqrt(dist);
                        selfObj.points.splice(next,1);
                        N--;
                    } else {
                        i++;
                    }
                } while (i<N)



                selfObj.completed=true;
            }
            this.changePos();
        }
        selfObj.onSegment = function(p, q, r){
            if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && 
                    q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) 
                return true; 
            return false; 
        }
        selfObj.orientation = function(p, q, r){ 
            val = (q.y-p.y)*(r.x-q.x)-(q.x-p.x)*(r.y-q.y); 
            
            if (val == 0) return 0;     // colinear 
            return (val > 0)? 1: 2;     // clock or counterclock wise 
        }
        selfObj.doIntersect = function(p1, q1, p2, q2){
            // Find the four orientations needed for general and special cases
            //
            var o1 = this.orientation(p1, q1, p2);
            var o2 = this.orientation(p1, q1, q2);
            var o3 = this.orientation(p2, q2, p1);
            var o4 = this.orientation(p2, q2, q1);
        
            // General case
            if (o1 != o2 && o3 != o4) return true;
        
            // Special Cases 
            // p1, q1 and p2 are colinear and p2 lies on segment p1q1
            if (o1 == 0 && this.onSegment(p1, p2, q1)) return true;
        
            // p1, q1 and p2 are colinear and q2 lies on segment p1q1
            if (o2 == 0 && this.onSegment(p1, q2, q1)) return true;
        
            // p2, q2 and p1 are colinear and p1 lies on segment p2q2
            if (o3 == 0 && this.onSegment(p2, p1, q2)) return true;
        
            // p2, q2 and q1 are colinear and q1 lies on segment p2q2
            if (o4 == 0 && this.onSegment(p2, q1, q2)) return true;
        
            return false; // Doesn't fall in any of the above cases
        }
        selfObj.pointInPolygon = function(points, p){
            // There must be at least 3 vertices in points[]
            var n = points.length;
            if (this.shape=="Snake"){
                var new_points=[];
                for (var i=0; i<n; i++)
                    new_points.push({x: points[i].x_t, y: points[i].y_t});
                for (var i=n-1; i>-1; i--)
                    new_points.push({x: points[i].x_b, y: points[i].y_b});
                points=new_points;
                n = points.length;
            }
            
            if (n < 3) return false;
            
            // Create a point for line segment from p to infinite
            var extreme = {x: 0, y: p.y};
        
            // Count intersections of the above line with sides of points
            var count = 0, i = 0;
            do {
                // Loop index back to zero at end
                var next = (i+1)%n;
        
                // Check if the line segment from 'p' to 'extreme' intersects 
                // with the line segment from 'points[i]' to 'points[next]' 
                if (this.doIntersect(points[i], points[next], p, extreme)) 
                { 
                    // If the point 'p' is colinear with line segment 'i-next', 
                    // then check if it lies on segment. If it lies, return true, 
                    // otherwise false 
                    if (this.orientation(points[i], p, points[next]) == 0) 
                    return this.onSegment(points[i], p, points[next]); 
        
                    count++; 
                } 
                i = next; 
            } while (i != 0); 
        
            // Return true if count is odd, false otherwise 
            return count&1;  // Same as (count%2 == 1) 
        }
    }
    selfObj.pixToWorld();
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
    buttonPressed=false;
    shapePressed = false;
    shapeAmended=false
    tablePressed = false;
    disableSelectReset=false;
    cursorLock=true;
    updateRows();
    // $('#target').focus()

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
        if (!selectLock&&!disableSelectReset)
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
        if (state.shape=="Snake"||state.shape=="Region"||state.shape=="Freehand") {
            tempShape=Shape(mP_0.x, mP_0.y, mP_0.x, mP_0.y, state.shape);
        }
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
    
    // If user is clicking a shape
    if (state.focusNo > -1) {
        if (t-t_0>75){
            shapes[state.focusNo].interact(mP, mP_0, checkModifier(e, true));
            resetCanvas();
            shapeAmended = true;
            stopDropDown = true;
        }
        
    // If user is trying to draw
    } else if (flag === 0) {
        if (state.shape!="None"&&t-t_0>150){ 
            resetCanvas();
            if (state.shape=="Snake"||state.shape=="Region"||state.shape=="Freehand") tempShape.create(mP);
            else drawShape(mP_0.x,mP_0.y,mP.x-mP_0.x,mP.y-mP_0.y,state.shape);
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
        if (state.shape=="Snake"||state.shape=="Region"||state.shape=="Freehand") {
            tempShape.complete();
            shapes.push(tempShape);
        }
        else shapes.push(Shape(mP_0.x, mP_0.y, mP.x, mP.y, state.shape));
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
$( "#target" ).keydown(function(e){
    hotkey(e);
});

/**
 * Checks whether a modifier is being pressed (ctrl,shift,alt)
 * @param {boolean} shift whether just shift key is tested 
 * @returns {boolean}
 */
function checkModifier(e, shift){
    if (shift) return e.shiftKey;
    return (e.ctrlKey||e.shiftKey||e.altKey);
}

function hotkey(e){
    if (e.keyCode == 68 || e.keyCode == 78) showAnnotation()       // D, N
    if (!exploringMode) {
        if (e.keyCode == 89 && e.ctrlKey) buttons[button_map['Redo']].click();
        if (e.keyCode == 90 && e.ctrlKey) buttons[button_map['Undo']].click();
        if (e.keyCode == 82 && !checkModifier(e)) buttons[button_map['Rect']].click();       // R
        if (e.keyCode == 67 && !checkModifier(e)) buttons[button_map['Circle']].click();     // C
        if (e.keyCode == 69 && !checkModifier(e)) buttons[button_map['Ellipse']].click();    // E
        if (e.keyCode == 76 && !checkModifier(e)) buttons[button_map['Line']].click();       // L
        if (e.keyCode == 83 && !checkModifier(e)) buttons[button_map['Snake']].click();      // S
        if (e.keyCode == 65 && !checkModifier(e)) buttons[button_map['Region']].click();     // A
        if (e.keyCode == 70 && !checkModifier(e)) buttons[button_map['Freehand']].click();   // F
        if (e.keyCode == 46 && !checkModifier(e)) buttons[button_map['Delete']].click();     // Del
        if (e.keyCode == 84 && !checkModifier(e)) buttons[button_map['Table']].click();      // T
        if (e.keyCode == 73 && !checkModifier(e)) buttons[button_map['Info']].click();       // I
    }
}

/**
 * Returns mouse position relative to (passed) canvas
 * 
 * @param {Element} drawCanvas the canvas to get mouse position from
 * @param {Event} evt Event object
 * @returns {Point}
 */
function getMousePos(drawCanvas, evt) {
    var rect = drawCanvas.getBoundingClientRect();
    return Point(evt.clientX-rect.left, evt.clientY-rect.top)
}

/**
 * Updates the cursor
 * 
 * @param {string} c cursor type to apply
 * @returns {undefined}
 */
function updateCursor(c="auto"){
    document.body.style.cursor=c;
}

/**
 * Retrieves object that the given position is over
 * 
 * @param {Point} pos The pos to check
 * @returns {Object}
 */
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
    return {cursor: "auto", canvas: true}
}

/**
 * Checks if the given pos is inside the given object
 * 
 * @param {Point} pos The position to check
 * @param {Rect} rect The rect to check against
 * @returns {boolean}
 */
function isInside(pos,rect){
    return pos.x >= rect.x && pos.x <= rect.x+rect.w && pos.y <= rect.y+rect.h && pos.y >= rect.y
}

/**
 * Checks if the given pos is inside any buttons
 * 
 * @param {Point} pos The position to check
 * @returns {boolean}
 */
function isInsideButtons(pos){
    for (var i=0;i<buttons.length;i++) if (isInside(pos,buttons[i].rect)) return true;
}

/** 
 *  @typedef State
 *  @type {Object}
 *  @property {number} focusNo The shape index currently being interacted with
 *  @property {number} selectedNo The shape index currently selected
 *  @property {function} addUndo Add a shape to undo stack
 *  @property {function} addRedo Add a shape to redo stack
 *  @property {Array.<Shape>} undoStack The undo stack
 *  @property {Array.<Shape>} redoStack The redo stack
 *  @property {function} undo Performs an undo
 *  @property {function} redo Performs a redo
 *  @property {function} selectShape Selects the shape with the given index
 *  @property {function} resetSelected Resets the selected shape
 */

/** 
 *  Creates a State
 *  @param {boolean} keepDrawingTool Whether to keep/reset the drawing tool
 *  @param {boolean} keepUndoRedoStacks Whether to keep/reset the undoredo stacks
 *  @returns {Rect}
 */
function State(keepDrawingTool=false, keepUndoRedoStacks=false){
    var outObj={
        focusNo: -1,
        selectedNo: -1,
        addUndo: function(idx, action='amend', shape=Object.assign({}, shapes[idx]), clearStack=true){
            // clearStack will be false if called from a redo: 
            //      interacting with the canvas should reset the redoStack
            // Have to copy centre object also since js has no deep copy
            if (action!='clear') {
                shape.centre=Object.assign({},shape.centre);
                if (shape.shape=="Snake"||shape.shape=="Region"||shape.shape=="Freehand")
                    shape.points = shape.points.map(a => Object.assign({}, a));
            }
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
                if (obj.shape.shape=="Snake"||obj.shape.shape=="Region"||obj.shape.shape=="Freehand")
                    obj.shape.points = obj.shape.points.map(a => Object.assign({}, a));
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
                this.selectShape(i, false);
            } else if (undoObj.action=='delete'){
                deleteShape(i,false);
            } else if (undoObj.action=='create'){
                shapes.splice(i,0,Object.assign({}, undoObj.shape));
                this.selectShape(i, false);
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
                this.selectShape(i, false);
            } else if (redoObj.action=='delete'){   // Should recreate the shape if undo deleted
                shapes.splice(i,0,Object.assign({}, redoObj.shape));
                this.selectShape(i, false);
            } else if (redoObj.action=='create'){   // vice versa
                deleteShape(i,false);
            }
            resetCanvas();
        },
        selectShape: function(i, focus=true){
            if (focus) this.focusNo=i;
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
    if (keepDrawingTool) outObj.shape=state.shape;
    if (keepUndoRedoStacks){
        outObj.undoStack=state.undoStack;
        outObj.redoStack=state.redoStack;
    }
    else outObj.shape = "None";
    return outObj;
}

/**
 * Gets shape with given id
 * 
 * @param {number} id The id to check
 * @returns {number}
 */
function getHighlightedShape(id) {
    let indexs = shapes.findIndex(el => el.id === id)
    return indexs
}

/**
 * Chooses the shape to draw
 * 
*  @param {number} x The X-coordinate of top left.
*  @param {number} y The Y-coordinate of top left.
*  @param {number} w The width.
*  @param {number} h The height.
 * @param {string} shape The type of shape to draw
 * @param {number} theta The angle to rotate by
 * @param {Point} [p=Point(x+w/2,y+h/2)] The point to rotate around
 * @returns {undefined}
 */
function drawShape(x,y,w,h,shape,theta=0,p={x:x+w/2,y:y+h/2}){
    var fn=window["draw"+shape];
    if (shape=="Line"){
        drawLine(x,y,x+w,y+h)
    }else if(typeof fn === 'function') {
        fn({x:x,y:y,w:w,h:h,theta:theta,p:p})
    }
}

/**
 * Draws a rectangle with the given parameters
 * Joins up the four corners and then fills: this allows the corners to be rotated
 * Boolean parameters describe the type of box for styling purposes
 * 
 * @param {Rect} shape The object to draw
 * @param {boolean} button Whether it is a button
 * @param {boolean} bounding Whether it is a bounding box
 * @param {boolean} amend Whether it is an amend box
 * @returns {undefined}
 */
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

/**
 * Draws circle with given parameters
 * 
 * @param {Shape} shape The object to draw
 * @returns {undefined}
 */
function drawCircle(shape){
    ctx.beginPath();
    var stroke = true;
    ctx.arc(shape.x+shape.w/2,shape.y+shape.h/2,
        Math.sqrt(Math.pow(shape.w/2,2)+Math.pow(shape.h/2,2)),
        0,2*Math.PI);
    //ctx.arc(x0,y0,Math.sqrt(Math.pow(x,2)+Math.pow(y,2)),0,2*Math.PI);
    
    if (stroke) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.15)";
        ctx.lineWidth = 10;
        ctx.stroke();
    } else {
        ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
        ctx.fill();
    }
    ctx.closePath();
}

/**
 * Draws ellipse with given parameters
 * 
 * @param {Shape} shape The object to draw
 * @returns {undefined}
 */
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

/**
 * Draws a bezier curve with given parameters
 * 
 * @param {number} x X-coordinate of start of line
 * @param {number} y Y-coordinate of start of line
 * @param {number} x3 X-coordinate of end of line
 * @param {number} y3 Y-coordinate of end of line
 * @param {number} [x1=] first parameter of bezier curve
 * @param {number} [y1=] first parameter of bezier curve
 * @param {number} [x2=] second parameter of bezier curve
 * @param {number} [y2=] second parameter of bezier curve
 * @returns {undefined}
 */
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

/**
 * Draws a snake
 * 
 * @param {Shape} shape The object to draw
 * @param {Array.<Points>} shape.points Points to draw from
 * @returns {undefined}
 */
function drawSnake(shape){
    ctx.beginPath();
    var N=shape.points.length;
    
    // Draw top part of snake until end
    ctx.moveTo(shape.points[0].x_t,shape.points[0].y_t);
    for (var i=1; i<N; i++){
        ctx.lineTo(shape.points[i].x_t,shape.points[i].y_t);
    }
    
    // Draw bottom part of snake back to start and fill
    for (var i=N-1; i>-1; i--){
        ctx.lineTo(shape.points[i].x_b,shape.points[i].y_b);
    }
    ctx.lineTo(shape.points[0].x_t,shape.points[0].y_t);
    
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    ctx.fill()
    ctx.closePath();
}

/**
 * Draws a region
 * 
 * @param {Shape} shape The object to draw
 * @param {Array.<Points>} shape.points Points to draw from
 * @returns {undefined}
 */
function drawRegion(shape){
    ctx.beginPath();
    var N=shape.points.length;
    
    // Follow region points
    ctx.moveTo(shape.points[0].x,shape.points[0].y);
    for (var i=1; i<N; i++){
        ctx.lineTo(shape.points[i].x,shape.points[i].y);
    }
    
    // Connect end point to start point
    ctx.lineTo(shape.points[0].x,shape.points[0].y);
    
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    ctx.fill()
    ctx.closePath();
}

/**
 * Draws a freehand region
 * 
 * @param {Shape} shape The object to draw
 * @param {Array.<Points>} shape.points Points to draw from
 * @returns {undefined}
 */
function drawFreehand(shape){
    var N=shape.points.length;
    if (shape.completed) {
        drawRegion(shape);
    } else {
        for (var i=0; i<N-1; i++){
            ctx.beginPath();
            ctx.moveTo(shape.points[i].x_t,shape.points[i].y_t);
            ctx.lineTo(shape.points[i+1].x_t,shape.points[i+1].y_t);
            ctx.lineTo(shape.points[i+1].x_b,shape.points[i+1].y_b);
            ctx.lineTo(shape.points[i].x_b,shape.points[i].y_b);
            ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
            ctx.fill();
            ctx.closePath();
        }
    }
    
}

/**
 * Rotates a given coordinate
 * 
 * @param {number} x X component
 * @param {number} y Y component
 * @param {number} theta Angle to rotate by
 * @param {Point} p Point to rotate about
 * @returns {Point}
 */
function rotateCoords(x,y,theta,p={x:0,y:0}){
    return {
        x:rotateXCoord(x,y,theta,p),
        y:rotateYCoord(x,y,theta,p)
    };
}

/**
 * Calculates Y component of coordinate rotation
 * 
 * @param {number} x X component
 * @param {number} y Y component
 * @param {number} theta Angle to rotate by
 * @param {Point} p Point to rotate about
 * @returns {number}
 */
function rotateXCoord(x,y,theta,p={x:0,y:0}){
    x=x-p.x;
    y=y-p.y;
    return x*Math.cos(theta)+y*Math.sin(theta)+p.x;
}

/**
 * Calculates Y component of coordinate rotation
 * 
 * @param {number} x X component
 * @param {number} y Y component
 * @param {number} theta Angle to rotate by
 * @param {Point} p Point to rotate about
 * @returns {number}
 */
function rotateYCoord(x,y,theta,p={x:0,y:0}){
    x=x-p.x;
    y=y-p.y;
    return -x*Math.sin(theta)+y*Math.cos(theta)+p.y;
}

/**
 * Calculates Y component of coordinate rotation
 * 
 * @param {Shape} rect The object to rotate
 * @param {number} rect.theta Angle to rotate by
 * @param {Point} p Point to rotate about
 * @returns {Shape}
 */
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
    if (shape.feature == "-" && !noAccess)
    {
        document.getElementById("featureLabel").innerHTML = ("What feature is this " + shape.shape + "? " + "&nbsp; <i class='fa fa-caret-down'></i>")
    }
    else if (!noAccess)
    {
        document.getElementById("featureLabel").innerHTML = ("Feature: " + shape.feature + "&nbsp; <i class='fa fa-caret-down'></i>")
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
function addFeature(feat) {
    // If no access is true then an image is not highlighted hence "Next Feature"
    // If !noAccess then a shape is highlighted hence given a feature
    if (!noAccess)
    {
        globalShapes[getHighlightedShape(currentShape.id)].feature = feat;
        updateTable(shapes);
        updateRowsRed(getHighlightedShape(currentShape.id), "Red");
    }
    else {
        document.getElementById("featureLabel").innerHTML = ("Next Feature: " + feat + "&nbsp; <i class='fa fa-caret-down'></i>")
        // If this is true then it prevents asking what feature to draw when clicking the canvas and allows a future shape to be given a feature
        nextShape = true
        nextShapeValue = feat;
    }
     // IF on submit a user clicks a shape then the colour of the dropdown goes from red to grey
    document.getElementById("featureLabel").style.backgroundColor = "rgba(0,0,0,0.1)"
}

// Prevents drawing or clicking shapes when on drop down
// Keeps shape highlighted when clicking drop down feature
var selectLock=false;
function changeTo() {
    preventDrawing = true;
    selectLock = true;
}

// Opposite of above
function changeBack() {
    preventDrawing = false;
    selectLock = false;
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

function allWorldToPix(){
    for (var i=0; i<shapes.length; i++){
        shapes[i].worldToPix();
    }
    resetCanvas();
}