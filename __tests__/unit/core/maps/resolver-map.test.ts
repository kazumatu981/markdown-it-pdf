import { describe, it, expect } from '@jest/globals';
import {
    ResolverMap,
    defaultContentsResolver,
    ContentsResolverFunction,
} from '../../../../src/core/maps/resolver-map';
import { DefaultExtensionMap } from '../../../../src/core/maps/extension-map';

import { mockingTestDir, unmockingTestDir } from '../../../utils/test-dir';

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
});
