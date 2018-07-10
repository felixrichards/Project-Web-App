var z_order = [];
var globalShapes = []

function updateZOrder(){
    z_order=getZOrder();
    
    var copy=[];
    for (var i=0;i<shapes.length;i++){
        copy.push(shapes[getShapeByID(z_order[i])]);
    }
    shapes=copy;
}

function getZOrder(){
    return $('#obj_table td:nth-child(2)').map(function(){
        return parseInt($(this).text());
    }).get();
}

function updateTable(shapes){
    $("#obj_table tbody").remove();
    $("#obj_table").append("<tbody>");

    whichShape();

    var svg;
    for (var i = 0; i < globalShapes.length;i++){
        var class_str="";
        if (globalShapes[i].shape == "Rect") svg = document.getElementById("rect").innerHTML;
        if (globalShapes[i].shape == "Circle") svg = document.getElementById("circle").innerHTML;
        if (globalShapes[i].shape == "Ellipse") svg = document.getElementById("ellipse").innerHTML;
        if (globalShapes[i].shape == "Line") svg = document.getElementById("line").innerHTML;
        $("#obj_table").find('tbody')
            .append($('<tr>')
                .addClass(class_str)
                .append($('<td>' + svg + '</td>')
                )
                .append($('<td>')
                    .text(globalShapes[i].id)
                )
        );
    }
    submitAppear(shapes);
}

// Stores all of one shape depending on the filter in an arrray.
function whichShape() {
    globalShapes = [];
    if ($("#rect").css('background-color') === "rgb(129, 129, 129)") {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Rect") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if ($("#circle").css('background-color') === "rgb(129, 129, 129)") {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Circle") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if ($("#ellipse").css('background-color') === "rgb(129, 129, 129)") {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Ellipse") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if ($("#line").css('background-color') === "rgb(129, 129, 129)") {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Line") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else {
        for (var i = 0; i < shapes.length; i++) {
            globalShapes.push(shapes[i]);
        }
    }
}

// Show or hide submit button based on number of shapes
function submitAppear(shapes) {
    var element = document.getElementById("submitButton");
    if (shapes.length < 1)
    {
        element.style.opacity = "0"
        document.getElementById('submitButton').style.WebkitTransition = 'opacity 1s';
        document.getElementById('submitButton').style.MozTransition = 'opacity 1s';
        document.getElementById("mySidenav").style.width = "0";
    }
    else 
    {
        element.style.opacity = "1"
        document.getElementById('submitButton').style.WebkitTransition = 'opacity 1s';
        document.getElementById('submitButton').style.MozTransition = 'opacity 1s';
    }
}

function updateRows(selected_idx=-1){
    if (selected_idx==-1) {
        $('#obj_table tbody tr').removeClass("selected");
    }

    if (selected_idx > -1) {

        $('#obj_table tbody tr').not(':eq(2)').removeClass("selected");
        $('#obj_table tbody tr:eq(' + selected_idx + ')').addClass("selected");
    }
}

$(document).on("click", "#obj_table tbody tr", function(e) {
    var index = $(this).index();
    z_order=getZOrder();
    index = z_order[index];
    let indexs = globalShapes.findIndex(el => el.id === index);
    state.selectShape(indexs);
    shapes[indexs].selectedIdx = 0;
    resetCanvas();
    cursorLock = false;
});

//Keep table open when clicking a filter
$(document).on("click", ".square", function (e) {
    updateTable(shapes)
    document.getElementById("mySidenav").style.width = "250px";
});

// Change filter button colour once clicked on
$('.square').on('click', function () {
    $('.square').css('background-color', '#404040');
    $(this).css('background-color', '#818181');
});

// Prevent clicking shapes when under the table
var preventDrawing = false;
$(".sidenav").hover(function () {
   preventDrawing = true
}, function () {
   preventDrawing = false;
    });

function showHideTable() {
    if (document.getElementById("mySidenav").style.width == "250px") {
        document.getElementById("mySidenav").style.width = "0";
    }
    else {
        document.getElementById("mySidenav").style.width = "250px";
    }
}

// Highlight all shapes filter when page is loaded.
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("all").style.backgroundColor = '#818181';
}, false);