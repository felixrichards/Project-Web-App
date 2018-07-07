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

    var selectedShapes = [];
    globalShapes = [];
    if ($("#rect").css('background-color') === "rgb(129, 129, 129)") {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Rect") {
                selectedShapes.push(shapes[i]);
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if ($("#circle").css('background-color') === "rgb(129, 129, 129)") {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Circle") {
                selectedShapes.push(shapes[i]);
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if ($("#ellipse").css('background-color') === "rgb(129, 129, 129)") {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Ellipse") {
                selectedShapes.push(shapes[i]);
                globalShapes.push(shapes[i]);
            }
        }
    }
    else if ($("#line").css('background-color') === "rgb(129, 129, 129)") {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].shape == "Line") {
                selectedShapes.push(shapes[i]);
                globalShapes.push(shapes[i]);
            }
        }
    }
    else {
        for (var i = 0; i < shapes.length; i++) {
            selectedShapes.push(shapes[i]);
            globalShapes.push(shapes[i]);
        }
    }


    var svg;
    for (var i = 0; i < selectedShapes.length;i++){
        var class_str="";
        if (selectedShapes[i].shape == "Rect") svg = document.getElementById("rect").innerHTML;
        if (selectedShapes[i].shape == "Circle") svg = document.getElementById("circle").innerHTML;
        if (selectedShapes[i].shape == "Ellipse") svg = document.getElementById("ellipse").innerHTML;
        if (selectedShapes[i].shape == "Line") svg = document.getElementById("line").innerHTML;
        $("#obj_table").find('tbody')
            .append($('<tr>')
                .addClass(class_str)
                .append($('<td>' + svg + '</td>')
                )
                .append($('<td>')
                    .text(selectedShapes[i].id)
                )
        );

    }

    submitAppear(shapes);
}

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

        let index = globalShapes.findIndex(el => el.id === selected_idx);
        $('#obj_table tbody tr').not(':eq(2)').removeClass("selected");
        $('#obj_table tbody tr:eq(' + index + ')').addClass("selected");
    }

}

$(document).on("click", "#obj_table tbody tr", function(e) {
    var index = $(this).index();
    z_order=getZOrder();
    index=z_order[index];
    s_index=getShapeByID(index);
    state.selectShape(s_index);
    shapes[s_index].selectedIdx = 0;
    resetCanvas();
    cursorLock = false;
});

$(document).on("click", ".square", function (e) {
    updateTable(shapes)
    document.getElementById("mySidenav").style.width = "250px";
});

$('.square').on('click', function () {
    $('.square').css('background-color', '#404040');
    $(this).css('background-color', '#818181');
});

var preventDrawing = false;
$(".sidenav").hover(function () {
   preventDrawing = true
}, function () {
   preventDrawing = false;
    });

$("ul").hover(function () {
    preventDrawing = true
}, function () {
    preventDrawing = false;
    });

$(".footer").hover(function () {
    preventDrawing = true
}, function () {
    preventDrawing = false;
});