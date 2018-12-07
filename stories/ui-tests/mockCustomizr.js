
const mockCustomizer = (m) => {
    m.get('https://customizr.at.cimpress.io/v1/resources/https%3A%2F%2Fcomment.trdlnk.cimpress.io%2F/settings', (req, res) => {
        return res.status(200).body(JSON.stringify({
            mentionsUsageNotification: {
                alertDismissed: true,
            },
        }));
    });
};

export {mockCustomizer};
