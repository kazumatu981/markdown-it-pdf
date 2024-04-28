const mockFs = require('mock-fs');

export function mockingTestDir() {
    mockFs({
        'test.md': '# test\n\nhello world',
        'sample.txt': 'hello world',
        'test.css': 'h1 { color: red; }',
        test: {
            'test.md': '# test\n\nhello world',
            'sample.txt': 'hello world',
            sub: {
                'test.md': '# test\n\nhello world',
                'sample.txt': 'hello world',
            },
            sub2: {
                'test.md': '# test\n\nhello world',
                'sample.txt': 'hello world',
                sub: {
                    'test.md': '# test\n\nhello world',
                    'sample.txt': 'hello world',
                },
            },
        },
    });
}
export function unmockingTestDir() {
    mockFs.restore();
}
