export function assertDefined<T>(value: T): asserts value is NonNullable<T> {
    if (value === undefined || value === null) {
        throw Error('Expected value to be defined, but got: ' + value);
    }
}

function assertString(str: any): asserts str is NonNullable<string> {
    assertDefined(str)
    if (typeof str !== 'string') {
        throw Error('Expected string, got ' + str);
    }
}