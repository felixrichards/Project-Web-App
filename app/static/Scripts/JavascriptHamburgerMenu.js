function myFunction(x) {
    x.classList.toggle("change");

    if (document.getElementById("myNav").style.width === "100%")
    {
        document.getElementById("myNav").style.width = "0%"
        preventDrawing = false;
        $('.aladin-zoomControl').css('display', 'block');
        $('.aladin-layersControl-container').css('display', 'block');
        $('.UICanvas').css('display', 'block');
        document.getElementById("iconList").style.display = "block";
    }
    else {
        document.getElementById("myNav").style.width = "100%";
        document.getElementById("x").style.position = "relative";
        $('.aladin-zoomControl').css('display', 'none');
        $('.aladin-layersControl-container').css('display', 'none');
        $('.UICanvas').css('display', 'none');
        document.getElementById("iconList").style.display = "none";
        preventDrawing = true;
    }
}

window.onresize = window.onload = function () {
    if ($(window).width() > 1000) {
        document.getElementById("myNav").style.width = "0%"
        if ($('.UICanvas').length){
            $('.aladin-zoomControl').css('display', 'block');
            $('.aladin-layersControl-container').css('display', 'block');
            $('.UICanvas').css('display', 'block');
            document.getElementById("iconList").style.display = "block";
        }
    }
};