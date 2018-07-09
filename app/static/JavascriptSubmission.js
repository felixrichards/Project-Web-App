$(function () {
    $('a#submit').bind('click', function () {
        $.ajax({
            data: JSON.stringify(shapes),
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            success: function (response) {
                //console.log(response);
            },
            error: function (error) {
                console.log(error);
            }
        })
    });
});