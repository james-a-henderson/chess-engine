//obtained from https://stackoverflow.com/a/39419171
export function assertUnreachable(x: never): never;
export function assertUnreachable(): never {
    throw new Error('Somehow reached unreachable case');
}
