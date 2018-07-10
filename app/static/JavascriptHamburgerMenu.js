function myFunction(x) {
    x.classList.toggle("change");

    if (document.getElementById("myNav").style.width === "100%")
    {
        document.getElementById("myNav").style.width = "0%"
        preventDrawing = false;
    }
    else {
        document.getElementById("myNav").style.width = "100%";
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("x").style.position = "relative";
        preventDrawing = true;
    }
}

window.onresize = window.onload = function () {
    if ($(window).width() > 1000) {
        document.getElementById("myNav").style.width = "0%"
    }
};