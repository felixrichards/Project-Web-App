window.onclick = function(event) {
    if (event.target == $('#form_container')[0]) {
        $('#form_container').css("display","none");
        window.history.replaceState('Object', 'Title', $(location).attr("pathname"));
    }
}