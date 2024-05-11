import { describe, it, expect } from '@jest/globals';
import {
    ResolverMap,
    defaultContentsResolver,
    ContentsResolverFunction,
} from '../../../src/core/resolver-map';

import { mockingTestDir, unmockingTestDir } from '../../utils/test-dir';

describe('CoreLibrary Unit Tests - defaultContentsResolver', () => {
    it('should return the default contents resolver', async () => {
        mockingTestDir();
        const result = await defaultContentsResolver('test.md');
        expect(result).toEqual(Buffer.from('# test\n\nhello world'));
        unmockingTestDir();
    });
});

describe('CoreLibrary Unit Tests - ResolverMap', () => {
    let resolverMap: ResolverMap;

    beforeEach(() => {
        resolverMap = new ResolverMap();
    });
    describe('getTypeInfo', () => {
        it('should return correct ExtensionTypeInfo for a valid extension name', () => {
            const extName = '.md';
            const expectedTypeInfo = {
                resolverType: 'markdown',
                contentType: 'text/markdown',
                resolvedContentType: 'text/html',
            };
            const result = resolverMap.getTypeInfo(extName);
            expect(result).toEqual(expectedTypeInfo);
        });

        it('should return default ExtensionTypeInfo for an extension name that does not exist in the extension map', () => {
            const extName = '.unknown';
            const expectedTypeInfo = {
                resolverType: 'binary',
                contentType: 'application/octet-stream',
            };
            const result = resolverMap.getTypeInfo(extName);
            expect(result).toEqual(expectedTypeInfo);
        });
    });
    describe('isSupported', () => {
        it('should return true for a supported file extension', () => {
            expect(resolverMap.isSupported('file.md')).toBeTruthy();
        });

        it('should return false for an unsupported file extension', () => {
            expect(resolverMap.isSupported('file.unknown')).toBeFalsy();
        });
    });

    describe('getResolverType', () => {
        it('should return the resolver function for the given resolver type', () => {
            const resolverFunction = jest.fn();
            resolverMap.set('markdown', resolverFunction);

            const result = resolverMap.getResolver('markdown');

            expect(result).toBe(resolverFunction);
        });

        it('should return the defaultContentsResolver function if the resolver type is not found', () => {
            const result = resolverMap.getResolver('pdf');

            expect(result).toBe(defaultContentsResolver);
        });
    });

    describe('getResolver', () => {
        let resolverMap: ResolverMap;
        let resolverFunction: ContentsResolverFunction;

        beforeEach(() => {
            resolverMap = new ResolverMap();
            resolverFunction = jest.fn();
        });
        it('should return the resolver function corresponding to the resolver type if it exists in the map', () => {
            resolverMap.set('markdown', resolverFunction);

            const result = resolverMap.getResolver('markdown');

            expect(result).toBe(resolverFunction);
        });

        it('should return the defaultContentsResolver function if the resolver type does not exist in the map', () => {
            const result = resolverMap.getResolver('pdf');

            expect(result).toBe(defaultContentsResolver);
        });
    });
    describe('getResolverByExtension', () => {
        it('should return the correct resolver function for a valid extension name', () => {
            const extName = '.md';
            const expectedResolver = jest.fn();
            resolverMap.set('markdown', expectedResolver);

            const result = resolverMap.getResolverByExtension(extName);

            expect(result).toBe(expectedResolver);
        });

        it('should return the default resolver function for an extension name that does not exist in the extension map', () => {
            const extName = '.unknown';
            const expectedResolver = jest.fn();
            resolverMap.set('binary', expectedResolver);

            const result = resolverMap.getResolverByExtension(extName);

            expect(result).toBe(expectedResolver);
        });

        it('should return the default resolver function for an empty extension name', () => {
            const extName = '';
            const expectedResolver = jest.fn();
            resolverMap.set('binary', expectedResolver);

            const result = resolverMap.getResolverByExtension(extName);

            expect(result).toBe(expectedResolver);
        });
    });
});
