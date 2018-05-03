
var focusObject=null;
element.addEventListener("mousedown", function(e){
    
}, false);
element.addEventListener("mousemove", function(e){
    focusObject=getFocusObject(getMousePos(drawCanvas,e));
    updateCursor(focusObject.cursor);
}, false);
element.addEventListener("mouseup", function(e){
    
}, false);

function updateCursor(c="pointer"){
    document.body.style.cursor=c;
}

function getFocusObject(pos){
    for (var i=0;i<buttons.length;i++){
        if (isInside(mP_0,buttons[i].rect)){
            return buttons[i];
        }
    }
    
    var boundingIdx;
    if (state.selectedNo>-1&&(boundingIdx=shapes[state.selectedNo].boundingRect.isInside(mP_0))){
        return shapes[state.selectedNo].boundingRect.getObj(boundingIdx);
    } else {
        for (var i=shapes.length-1;i>=0;i--){
            if (shapes[i].isInside(mP_0)){
                return shapes[i];
            }
        }
    }
    
    if (isInside(mP_0,drawerRect)&&!buttonPressed&&!shapePressed&&shapes!=[]){
        return {cursor: "auto"};
    }
}