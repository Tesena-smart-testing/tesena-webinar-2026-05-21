export class MissingTestUserKeyError extends Error {

    constructor() {
        super (
            `
            Missing 'testUserKey' definition.
            If you want use 'testUser' fixture, add: 'test.use({ testUserKey: '...' })' before your test
            `
        ),
        this.name = 'MissingTestUserKeyError'
    }
}

