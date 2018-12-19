$(function () {
    $('a#loginbtn').bind('click', function () {
        // var csrftoken = $('meta[name=csrf-token]').attr('content')
        
        $('#logindiv').css('display','block');

        // console.log("hello")
        // $.ajaxSetup({
        //     beforeSend: function(xhr, settings) {
        //         if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
        //             xhr.setRequestHeader("X-CSRFToken", csrftoken)
        //         }
        //     }
        // })

        // if (checkFeatures()){
        //     $.ajax({
        //         data: "hello",
        //         contentType: "application/json; charset=utf-8",
        //         type: 'POST',
        //         success: function (response) {
        //             response = JSON.parse(response)
        //             console.log(response);
        //         },
        //         error: function (error) {
        //             console.log(error);
        //         }
        //     })
        // }
    });
});

// $(document).ready(function(){
//     var urlpath = $(location).attr("pathname");
//     console.log(urlpath)
//     if (urlpath != "/"){
//         console.log("hello");
//         $("#login").attr("href", urlpath + "/login");
//     }
// })

window.onclick = function(event) {
    if (event.target == $('#logindiv')[0]) {
        $('#logindiv').css("display","none");
        window.history.replaceState('Object', 'Title', $(location).attr("pathname"));
    }
}