const mockFs = require('mock-fs');

export function mockingTestDir() {
    mockFs(
        {
            'test.md': '# test\n\nhello world',
            'sample.txt': 'hello world',
            'test.css': 'h1 { color: red; }',
            test: {
                'test.md': '# test\n\nhello world',
                'sample.txt': 'hello world',
                'sample.jpg': 'sample.jpg',
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
                'config.json': JSON.stringify({
                    port: 3001,
                }),
                'test.css': 'h1 { color: red; }',
            },
        },
        { createCwd: true }
    );
}
export function unmockingTestDir() {
    mockFs.restore();
}
