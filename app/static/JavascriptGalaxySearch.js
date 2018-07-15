function search(ele) {
    if (event.key === 'Enter') {
        if (Math.floor(ele.value) == ele.value && $.isNumeric(ele.value)) {
            window.location.href = '/Annotate/id/' + ele.value
        }
        else {
            window.location.href = '/Annotate/name/' + ele.value
        }
    }
}

$(document).on("click", ".navSearch", function (e) {
    x = document.querySelectorAll(".navMain > li > a");
    for (i = 0; i < x.length; i++) {
        x[i].style.opacity = "0";
        x[i].style.WebkitTransition = 'opacity 0.5s';
        x[i].style.MozTransition = 'opacity 0.5s';
        x[i].style.pointerEvents = "none";
    }

    z = document.getElementById("closeSearch");
    z.style.opacity = "1";
    z.style.WebkitTransition = 'opacity 5s';
    z.style.MozTransition = 'opacity 5s';
    z.style.pointerEvents = "auto";
    w = document.getElementById("searchField");
    w.style.opacity = "1";
    w.style.WebkitTransition = 'opacity 5s';
    w.style.MozTransition = 'opacity 5s';
    w.style.pointerEvents = "auto";
    p = document.getElementById("dropdown");
    p.style.pointerEvents = "none";
});

$(document).on("click", ".closeSearch", function (e) {
    x = document.querySelectorAll(".navMain > li > a");
    for (i = 0; i < x.length; i++) {
        x[i].style.opacity = "1";
        x[i].style.WebkitTransition = 'opacity 1s';
        x[i].style.MozTransition = 'opacity 1s';
        x[i].style.pointerEvents = "auto";
    }
    z = document.getElementById("closeSearch");
    z.style.opacity = "0";
    z.style.WebkitTransition = 'opacity 0.5s';
    z.style.MozTransition = 'opacity 0.5s';
    z.style.pointerEvents = "none";
    w = document.getElementById("searchField");
    w.style.opacity = "0";
    w.style.WebkitTransition = 'opacity 0.5s';
    w.style.MozTransition = 'opacity 0.5s';
    w.style.pointerEvents = "none";
    p = document.getElementById("dropdown");
    p.style.pointerEvents = "auto";
});