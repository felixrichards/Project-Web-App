var a_id;
var test_response;
$(function () {
    $('a#submit.button').unbind("click").bind('click', function () {
        console.log("Button pressed");

        resetButtons();
        state.resetSelected();
        state = State();

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRF-Token", csrftoken)
                }
            }
        })

        if (checkFeatures()){
            $.ajax({
                data: JSON.stringify(shapes),
                contentType: "application/json; charset=utf-8",
                type: 'POST',
                success: function(response) {
                    response = JSON.parse(response)
                    a_id = response.a_id
                    if (response.is_authenticated)
                        $("#annotationIDResult").html("The ID for this annotation is "+a_id
                         +"<br>You can access it at <a href='/verify/id/"+a_id+"'>/verify/id/"+a_id+"</a>");
                    else {
                        $("#annotationIDResult").html("You can login/register to access your future annotations.");
                    }
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
            'Main Galaxy','Dwarf Galaxy', 'Companion Galaxy','Background Galaxy of Interest',
            'Halo','Bar','Ring','Spiral Arm','Dust Lane',
            'Instrument','Satellite Trail', 'High Background', 'Ghosted Halo', 'Cirrus', 'Not Sure']

    for (var i = 0; i < shapes.length; i++) {
        if (!features.includes(shapes[i].feature)) {
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