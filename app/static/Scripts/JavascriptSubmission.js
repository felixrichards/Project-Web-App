$(function () {
    $('a#submit').bind('click', function () {

        resetButtons();
        state.resetSelected();
        state = defaultState();
        checkFeatures();

        $.ajax({
            data: JSON.stringify(shapes),
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            success: function (response) {
                //console.log(response);
            },
            error: function (error) {
                console.log(error);
            }
        })
    });
});

var showFeatureless = false;
function checkFeatures()
{
    globalShapes = [];
    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i].noFeature == "-") {
            globalShapes.push(shapes[i]);
        }
    }

    if (globalShapes.length == 0)
    {
        document.getElementById("TheEnd").style.width = "100%"; 
        document.getElementById("mySidenav").style.width = "0px";
        $('.aladin-zoomControl').css('display', 'none');
        $('.aladin-layersControl-container').css('display', 'none');
        $('.UICanvas').css('display', 'none');
        document.getElementById("iconList").style.display = "none";
        preventDrawing = true;
    }

    else {
        document.getElementById("featureLabel").innerHTML = ("These Shapes Require Features &nbsp; <i class='fa fa-caret-down'></i>")
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("featureLabel").style.backgroundColor = "#ff0000"
        allShapes();
        showFeatureless = true;
        updateRowsRed();
    }
}