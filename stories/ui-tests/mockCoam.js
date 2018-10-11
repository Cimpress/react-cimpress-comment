const COAM_URL = 'https://api.cimpress.io';

const principals = [
    {
        'name': 'John Doe',
        'user_id': '49c087ab-3fee-4994-86e7-c63d2b47ac8b',
        'email': 'john_doe@cimpress.com',
    },
    {
        'name': 'John Does',
        'user_id': '97b54b76-60d0-498f-b123-7cb9e1020eb4',
        'email': 'john_does@cimpress.com',
    },
    {
        'name': 'George Washington',
        'user_id': '20fee9d7-3e84-4fdb-98ee-452099393f19',
        'email': 'george_washington@cimpress.com',
    },
    {
        'name': 'John Adams',
        'user_id': '8b4560c2-3a4f-4c5d-8215-3a8351c76ceb',
        'email': 'john_adams@cimpress.com',
    },
    {
        'name': 'Thomas Jefferson',
        'user_id': '4c2028c2-acec-401d-916e-c5b448b056c6',
        'email': 'thomas_jefferson@cimpress.com',
    },
];

function getPrincipalResponse(name) {
    return {
        'profile': {
            'name': name,
        },
    };
}

function mockCoamGetPrincipal(fetchMock, principalId, name) {
    return fetchMock.get(`${COAM_URL}/auth/access-management/v1/principals/${principalId}`,
        {
            status: 200,
            body: getPrincipalResponse(name),
        }
    );
}

function mockCoamGetPrincipals(fetchMock, principals) {
    return fetchMock.get(`${COAM_URL}/auth/access-management/v1/principals`,
        {
            status: 200,
            body: {
                'principals': principals,
            },
        }
    );
}

function mockCoamPrincipals(fetchMock) {
    let m = fetchMock;
    mockCoamGetPrincipals(fetchMock, principals);
    for (let i = 0; i < principals.length; i++) {
        m = mockCoamGetPrincipal(m, principals[i].user_id, principals[i].name);
    }
    return m;
}

export {
    mockCoamGetPrincipal,
    mockCoamGetPrincipals,
    mockCoamPrincipals,
};
