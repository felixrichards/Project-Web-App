function showHideCheatSheet() {
    if (document.getElementById("myCheatSheet").style.width == "250px") {
        document.getElementById("myCheatSheet").style.width = "0";
        document.getElementById("hideTableCheatSheet").style.width = "0";
    }
    else {
        document.getElementById("myCheatSheet").style.width = "250px";
        document.getElementById("hideTableCheatSheet").style.width = "280px";
        document.getElementById("hideTableSideNav").style.width = "0";
        document.getElementById("hideTableFeatures").style.width = "0";
        document.getElementById("mySidenav").style.width = "0px";
        document.getElementById("featureTable").style.width = "0";
        document.getElementById("moreInfo").style.color = "white";
    }
}