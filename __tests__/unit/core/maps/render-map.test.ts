import { describe, it, expect } from '@jest/globals';
import { RenderMap } from '../../../../src/core/maps/render-map';
import { defaultRender } from '../../../../src/core/render/';

describe('CoreLibrary Unit Tests - RenderMap', () => {
    let resolverMap: RenderMap;

    beforeEach(() => {
        resolverMap = new RenderMap();
    });

    describe('getRender', () => {
        it('should return the resolver function for the given resolver type', () => {
            const renderMock = {
                renderFromFile: jest.fn() as (
                    fileName: string
                ) => Promise<string>,
            };
            resolverMap.set('markdown', renderMock);

            const result = resolverMap.safeGet('markdown');

            expect(result).toBe(renderMock);
        });

        it('should return the defaultContentsResolver function if the resolver type is not found', () => {
            const result = resolverMap.safeGet('pdf');

            expect(result).toBe(defaultRender);
        });
    });
});
