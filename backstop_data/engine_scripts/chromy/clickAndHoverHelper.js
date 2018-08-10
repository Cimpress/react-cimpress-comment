module.exports = function(chromy, scenario) {
    let hoverSelector = scenario.hoverSelector;
    let clickSelector = scenario.clickSelector;
    let postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

    if (hoverSelector) {
        chromy
            .wait(hoverSelector)
            .rect(hoverSelector)
            .result(function(rect) {
                chromy.mouseMoved(rect.left, rect.top);
            });
    }

    if (clickSelector) {
        chromy
            .wait(clickSelector)
            .click(clickSelector);
    }

    if (postInteractionWait) {
        chromy.wait(postInteractionWait);
    }
};
