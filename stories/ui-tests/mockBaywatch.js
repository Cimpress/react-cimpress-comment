function mockGetSubscriptions(fetchMock, statusCode) {
    return fetchMock.get(
        /.*\/v0\/users\/.*\/subscriptions\/.*?q=.*/,
        {
            status: statusCode,
            body: {},
        }
    );
}

function mockUsers(fetchMock, statusCode) {
    return fetchMock.get(
        /.*\/v0\/users\/.*?q=.*/,
        {
            status: statusCode,
            body: {},
        }
    );
}

function mockBaywatch(fetchMock) {
    let m = fetchMock;
    m = mockGetSubscriptions(m, 200);
    m = mockUsers(m, 200);
    return m;
}

export {
    mockBaywatch,
};
