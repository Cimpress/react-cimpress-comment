const COMMENTS_URL = process.env.AUTH_SERVICE_URL;

const comments = [{
    'createdAt': '2018-02-10T14:04:59.595Z',
    'visibility': 'public',
    'comment': 'First comment',
    'id': '908ac1b0-010f-11e8-9aec-197d791cffc8',
    'updatedBy': '49c087ab-3fee-4994-86e7-c63d2b47ac8b',
    'createdBy': '49c087ab-3fee-4994-86e7-c63d2b47ac8b',
    'updatedAt': '2018-02-10T14:04:59.595Z',
}, {
    'createdAt': '2018-02-10T12:15:55.531Z',
    'visibility': 'internal',
    'comment': 'Second comment @[John Doe](b636a568-b51e-4653-903c-01e7bd5a5086) might be longer @[John Does](b636a568-b51e-4653-903c-01e71d5a5a)',
    'id': '7e6395b0-01c9-11e8-952c-85c7cdb92fcc',
    'updatedBy': '49c087ab-3fee-4994-86e7-c63d2b47ac8b',
    'createdBy': '49c087ab-3fee-4994-86e7-c63d2b47ac8b',
    'updatedAt': '2018-02-10T12:55:24.973Z',
}, {
    'createdAt': '2018-02-10T12:16:02.496Z',
    'visibility': 'public',
    'comment': 'Third comment',
    'id': '828a5c00-01c9-11e8-952c-85c7cdb92fcc',
    'updatedBy': '49c087ab-3fee-4994-86e7-c63d2b47ac8b',
    'createdBy': '49c087ab-3fee-4994-86e7-c63d2b47ac8b',
    'updatedAt': '2018-02-10T12:55:24.973Z',
}];

function mockCommentsGetComment(fetchMock, resourceId, commentId) {
    return fetchMock.get(`${COMMENTS_URL}/v0/resources/${resourceId}/comments/${commentId}`, {
        status: 200,
        body: comments.find((x) => x.id === commentId),
    });
}

function mockCommentsGetResourceComments(fetchMock, resourceId) {
    return fetchMock.get(`${COMMENTS_URL}/v0/resources/${resourceId}/comments`, {
        status: 200,
        body: comments,
    });
}

function mockCommentsGetResource(fetchMock, resourceId) {
    return fetchMock.get(`${COMMENTS_URL}/v0/resources/${resourceId}`, {
        status: 200,
        body: {
            URI: resourceId,
            comments: comments,
            eTag: 5,
        },
    });
}

function mockCommentsGetResourceWith404(fetchMock, resourceId) {
    return fetchMock.get(`${COMMENTS_URL}/v0/resources/${resourceId}`, {
        status: 404,
        body: {},
    });
}

function mockCommentsResource(fetchMock, resourceId, unreadCount = 3) {
    let m = fetchMock;
    m = mockCommentsGetResource(m, resourceId);
    m = mockCommentsResourceUserInfo(m, resourceId, unreadCount);
    m = mockCommentsGetResourceComments(m, resourceId);
    for (let i = 0; i < comments.length; i++) {
        m = mockCommentsGetComment(m, resourceId, comments[i].id);
    }
    return m;
}

function mockCommentsResourceUserInfo(fetchMock, resourceId, unreadCount) {
    return fetchMock.get(`${COMMENTS_URL}/v0/resources/${resourceId}/userinfo`, {
        status: 200,
        body: {
            unreadCount: unreadCount
        },
    });
}

function mockComments(fetchMock) {
    let m = fetchMock;
    m = mockCommentsResource(m, 'http%3A%2F%2Feda234a4-485f-4c0c-806d-1c9748994c00.com');
    m = mockCommentsGetResourceWith404(m, 'http%3A%2F%2Feda234a4-485f-4c0c-806d-1c9748994c00.com%2Fnon-existent');
    return m;
}

export {
    mockComments,
};
