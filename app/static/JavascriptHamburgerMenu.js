function myFunction(x) {
    x.classList.toggle("change");

    if (document.getElementById("myNav").style.width === "100%")
    {
        document.getElementById("myNav").style.width = "0%"
        document.getElementById("drawCanvas").style.display = "block";
        document.getElementById("UICanvas").style.display = "block";
        document.getElementById("bin").style.display = "block";
        document.getElementById("undo").style.display = "block";
        document.getElementById("restart").style.display = "block";
        document.getElementById("table").style.display = "block";
    }
    else {
        document.getElementById("myNav").style.width = "100%";
        document.getElementById("drawCanvas").style.display = "none";
        document.getElementById("UICanvas").style.display = "none";
        document.getElementById("bin").style.display = "none";
        document.getElementById("undo").style.display = "none";
        document.getElementById("restart").style.display = "none";
        document.getElementById("table").style.display = "none";
        document.getElementById("x").style.position = "relative";
    }
}