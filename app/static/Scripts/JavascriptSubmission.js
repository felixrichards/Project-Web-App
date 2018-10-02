$(function () {
    $('a#submit').bind('click', function () {

        resetButtons();
        state.resetSelected();
        state = defaultState();
        
        var csrftoken = $('meta[name=csrf-token]').attr('content')

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken)
                }
            }
        })

        if (checkFeatures()){
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
        }
    });
});

var showFeatureless = false;
function checkFeatures()
{
    globalShapes = [];
    features=['Shells','Plumes','Tital Tails','Streams',
            'Ghosted Halo','Cirrus',
            'Bar','Ring','Spiral Arm','Dust Lane',
            'Halo','Not Sure']

    for (var i = 0; i < shapes.length; i++) {
        if (!features.includes(shapes[i].noFeature)) {
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
        return true;
    } else {
        document.getElementById("featureLabel").innerHTML = ("These Shapes Require Features &nbsp; <i class='fa fa-caret-down'></i>")
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("featureLabel").style.backgroundColor = "#ff0000"
        allShapes();
        showFeatureless = true;
        updateRowsRed();
        return false;
    }
}