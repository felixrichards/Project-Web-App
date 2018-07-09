window.onresize = function (event) {
    state = defaultState(true);
    shapes = [];
    updateTable(shapes);
    resetCanvas();
    id_count = 0;
};