function showHideCheatSheet() {
    if (document.getElementById("myCheatSheet").style.width == "250px") {
        document.getElementById("myCheatSheet").style.width = "0";
    }
    else {
        document.getElementById("myCheatSheet").style.width = "250px";
        document.getElementById("mySidenav").style.width = "0px";
    }
}