document.addEventListener('DOMContentLoaded', function () {
    if (news === undefined || news.length == 0) {
        console.log("sdfsdfsdfsd")
            $("#myTable").find('tbody')
                .append($('<tr>')
                    .append($('<td>')
                        .append($('<div>')
                            .attr('class', 'teamMemberContainer')
                            .append($('<h3>')
                                .text("Updates")
                            )
                            .append($('<p>')
                                .text("There are currently no updates, please come back soon.")
                            )
                        )
                    )
        );
    }
    else {
        var j = -1
        for (var i = 0; i < news.length; i += 2) {
            j+=2
            $("#myTable").find('tbody')
                .append($('<tr>')
                    .append($('<td>')
                        .append($('<div>')
                            .attr('class', 'teamMemberContainer')
                            .append($('<h3>')
                                .text(news[i])
                            )
                            .append($('<p>')
                                .text(news[j])
                            )
                        )
                    )
                );
        }
    }

}, false);