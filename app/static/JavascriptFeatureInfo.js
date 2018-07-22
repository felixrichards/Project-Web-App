function featureTableShow() {
    if (document.getElementById("featureTable").style.width == "0px")
    {
        document.getElementById("featureTable").style.width = "250px";
        document.getElementById("hideTableFeatures").style.width = "280px";
        document.getElementById("hideTableSideNav").style.width = "0";
        document.getElementById("hideTableCheatSheet").style.width = "0";
        document.getElementById("myCheatSheet").style.width = "0";
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("moreInfo").style.color = "forestgreen";
    }
    else
    {
        document.getElementById("featureTable").style.width = "0";
        document.getElementById("hideTableFeatures").style.width = "0";
        document.getElementById("moreInfo").style.color = "white";
    }
}