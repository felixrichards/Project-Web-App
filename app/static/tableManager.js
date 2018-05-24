var z_order=[];

function updateZOrder(){
    z_order=getZOrder();
    
    var copy=[];
    for (var i=0;i<shapes.length;i++){
        copy.push(shapes[getShapeByID(z_order[i])]);
    }
    shapes=copy;
}

function getZOrder(){
    return $('#obj_table td:nth-child(2)').map(function(){
        return parseInt($(this).text());
    }).get();
}

function updateTable(shapes){
    $("#obj_table tbody").remove();
    
    $("#obj_table").append("<tbody>");
    for (var i=0;i<shapes.length;i++){
        var class_str="";
        if (shapes[i].selected) class_str="selected";
        $("#obj_table").find('tbody')
            .append($('<tr>')
                .addClass(class_str)
                .append($('<td>')
                    .text(shapes[i].shape)
                )
                .append($('<td>')
                    .text(shapes[i].id)
                )
            );
    }
    updateZOrder();
    
    $("#obj_table tbody").sortable({
        containment: $("#obj_table").parent(),
        delay:200,
        stop: function(event, ui){
            updateZOrder();
        }
    });
}

function updateRows(selected_idx=-1){
    if (selected_idx==-1) {
        $('#obj_table tbody tr').removeClass("selected");
    }
    if (selected_idx>-1){
        $('#obj_table tbody tr').not(':eq(2)').removeClass("selected");
        $('#obj_table tbody tr:eq('+selected_idx+')').addClass("selected");
    }
}

$(document).on("click", "#obj_table tbody tr", function(e) {
    var index = $(this).index();
    z_order=getZOrder();
    index=z_order[index];
    s_index=getShapeByID(index);
    state.selectShape(s_index);
    shapes[s_index].selectedIdx=0;
    resetCanvas();
});