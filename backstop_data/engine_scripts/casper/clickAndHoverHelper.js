let WAIT_TIMEOUT = 5000;

module.exports = function(casper, scenario) {
    let waitFor = require('./waitForHelperHelper')(casper, WAIT_TIMEOUT);
    let hoverSelector = scenario.hoverSelector;


    let clickSelector = scenario.clickSelector;


    let postInteractionWait = scenario.postInteractionWait;

    if (hoverSelector) {
        waitFor(hoverSelector);
        casper.then(function() {
            casper.mouse.move(hoverSelector);
        });
    }

    if (clickSelector) {
        waitFor(clickSelector);
        casper.then(function() {
            casper.click(clickSelector);
        });
    }

    // TODO: if postInteractionWait === integer then do ==> wait(postInteractionWait) || elsevvv
    waitFor(postInteractionWait);
};
