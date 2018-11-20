var z_order = [];
var globalShapes = [];

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
        if (globalShapes[i].shape == "Snake") svg = document.getElementById("snake").innerHTML;
        if (globalShapes[i].shape == "Region") svg = document.getElementById("region").innerHTML;
        if (globalShapes[i].shape == "Freehand") svg = document.getElementById("freehand").innerHTML;
        $("#obj_table").find('tbody')
            .append($('<tr>')
                .addClass(class_str)
                .append($('<td>' + svg + '</td>')
                )
                .append($('<td>')
                    .text(globalShapes[i].id)
                )
                .append($('<td id=' + globalShapes[i].id + '>' + globalShapes[i].feature + '</td>')
                )
        );
    }
    submitAppear(shapes);
}

// Stores all of one shape depending on the filter in an array.
function whichShape() {
    function isSelected(e){ 
        return e.css('background-color') === "rgb(129, 129, 129)";
    }
    globalShapes = [];
    if (isSelected($("#rect"))) {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Rect") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if (isSelected($("#circle"))) {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Circle") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if (isSelected($("#ellipse"))) {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Ellipse") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if (isSelected($("#line"))) {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Line") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if (isSelected($("#snake"))) {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Snake") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if (isSelected($("#region"))) {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Region") {
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if (isSelected($("#freehand"))) {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Freehand") {
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
function submitAppear(shapes=shapes) {
    var element = document.getElementById("submitButton");
    if (shapes.length < 1)
    {
        element.style.opacity = "0"
        document.getElementById('submitButton').style.WebkitTransition = 'opacity 1s';
        document.getElementById('submitButton').style.MozTransition = 'opacity 1s';
        document.getElementById('submit').style.pointerEvents = 'none';
        hideAll();
        nextShape = false;
        noshapeDrawn();
    }
    else 
    {
        element.style.opacity = "1"
        document.getElementById('submitButton').style.WebkitTransition = 'opacity 1s';
        document.getElementById('submitButton').style.MozTransition = 'opacity 1s';
        document.getElementById('submit').style.pointerEvents = 'all';
    }
}

var shapeHighlighted = false;
function updateRows(selected_idx=-1){
    if (selected_idx==-1) {
        $('#obj_table tbody tr').removeClass("selected");
        $('#obj_table tbody tr').removeClass("selectedFeature");
    }

    if (selected_idx > -1) {
        $('#obj_table tbody tr').not(':eq(2)').removeClass("selected");
        $('#obj_table tbody tr:eq(' + selected_idx + ')').addClass("selected");

        // Remove all highlighted from submit when clicking on a shape
        showFeatureless = false;
        // Allows a prompt for a highlighted shape
        noAccess = false;
        // Break out of given a future shape a feature
        nextShape = false;
        // Ensures drop down menu hove attributes work when selecting a shape from the table
        shapeHighlighted = true;
        // Prompt for shape
        getFeature(shapes[selected_idx])
    }
}

// Red version of updateRows
function updateRowsRed(selected_idx = -1, feature) {
    if (selected_idx == -1) {
        $('#obj_table tbody tr').removeClass("selectedFeature");
        $('#obj_table tbody tr').removeClass("selected");
    }

    if (selected_idx > -1) {
        $('#obj_table tbody tr').not(':eq(2)').removeClass("selectedFeature");
        $('#obj_table tbody tr').removeClass("selected");
        $('#obj_table tbody tr:eq(' + selected_idx + ')').addClass("selectedFeature");

        // Remove all highlighted from submit when clicking on a shape
        showFeatureless = false;
            // Allows a prompt for a highlighted shape
        noAccess = false;
            // Break out of given a future shape a feature
        nextShape = false;
        // Ensures drop down menu hove attributes work when selecting a shape from the table
        shapeHighlighted = true;
        // Prompt for shape
        getFeature(shapes[selected_idx])
    }

    // On submit highlight all none featured shapes
    if (showFeatureless) {
        $('#obj_table tbody tr').not(':eq(2)').removeClass("selected");

        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].feature == "-") {
                globalShapes.push(shapes[i]);
                $('#obj_table tbody tr:eq(' + i + ')').addClass("selectedFeature");
            }
        }
    }
}

$(document).on("click", "#obj_table tbody tr", function(e) {
    var index = $(this).index();
    z_order=getZOrder();
    index = z_order[index];
    state.selectShape(getHighlightedShape(index), false);
    shapes[getHighlightedShape(index)].boundingRect.selectedIdx = 0;
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
        document.getElementById("hideTableSideNav").style.width = "0";
    }
    else {
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("hideTableSideNav").style.width = "280px";
        document.getElementById("hideTableFeatures").style.width = "0";
        document.getElementById("hideTableCheatSheet").style.width = "0";
        document.getElementById("myCheatSheet").style.width = "0";
        document.getElementById("featureTable").style.width = "0";
        document.getElementById("moreInfo").style.color = "white";
    }
}

// Highlight all shapes filter when page is loaded.
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("all").style.backgroundColor = '#818181';
    document.getElementById("featureTable").style.width = "0";
}, false);

// Remove filter when drawing a shape
function allShapes() {
    document.getElementById("all").style.backgroundColor = '#818181';
    document.getElementById("rect").style.backgroundColor = '#404040';
    document.getElementById("circle").style.backgroundColor = '#404040';
    document.getElementById("ellipse").style.backgroundColor = '#404040';
    document.getElementById("line").style.backgroundColor = '#404040';
    updateTable(shapes);
}

function hideAll()
{
    document.getElementById("featureTable").style.width = "0";
    document.getElementById("myCheatSheet").style.width = "0";
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("hideTableSideNav").style.width = "0";
    document.getElementById("hideTableFeatures").style.width = "0";
    document.getElementById("hideTableCheatSheet").style.width = "0";
    document.getElementById("moreInfo").style.color = "white";
}