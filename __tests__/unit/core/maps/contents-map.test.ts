import { jest, describe, it, expect } from '@jest/globals';
import { ContentsMap } from '../../../../src/core/maps/contents-map';
import { RenderMap } from '../../../../src/core/maps/render-map';
import { mockingTestDir, unmockingTestDir } from '../../../utils/test-dir';

// TODO add test get/set renderMap

describe('CoreLibrary Unit Tests - ContentsMap', () => {
    describe('createInstance', () => {
        it('should create an instance - recursive', async () => {
            const resolverMap = new RenderMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test',
                {
                    recursive: true,
                }
            );
            expect(contentsMap).toBeTruthy();
            expect(contentsMap.keys()).toContain('/test.md');
            expect(contentsMap.keys()).toContain('/sample.txt');
            expect(contentsMap.keys()).toContain('/sub/test.md');
            unmockingTestDir();
        });
        it('should create an instance - not recursive', async () => {
            const resolverMap = new RenderMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test',
                {
                    recursive: false,
                }
            );
            expect(contentsMap).toBeTruthy();
            expect(contentsMap.keys()).toContain('/test.md');
            expect(contentsMap.keys()).toContain('/sample.txt');
            expect(contentsMap.keys()).not.toContain('/sub/test.md');
            unmockingTestDir();
        });
        it('should create an instance - recursive on abbreviate recursive', async () => {
            const resolverMap = new RenderMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test'
            );
            expect(contentsMap).toBeTruthy();
            expect(contentsMap.keys()).toContain('/test.md');
            expect(contentsMap.keys()).toContain('/sample.txt');
            expect(contentsMap.keys()).toContain('/sub/test.md');
            unmockingTestDir();
        });
        it('should create an instance - recursive on abbreviate options', async () => {
            const resolverMap = new RenderMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test'
            );
            expect(contentsMap).toBeTruthy();
            expect(contentsMap.keys()).toContain('/test.md');
            expect(contentsMap.keys()).toContain('/sample.txt');
            expect(contentsMap.keys()).toContain('/sub/test.md');
            unmockingTestDir();
        });
    });
    describe('getEntityPaths() with markdown', () => {
        it('should return the markdown entry urls', async () => {
            const resolverMap = new RenderMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test'
            );
            expect(contentsMap.getEntityPaths('markdown')).toContain(
                '/test.md'
            );
            expect(contentsMap.getEntityPaths('markdown')).toContain(
                '/sub/test.md'
            );
            expect(contentsMap.getEntityPaths('markdown')).not.toContain(
                '/sample.txt'
            );
            expect(contentsMap.getEntityPaths('markdown')).not.toContain(
                '/test.css'
            );
            unmockingTestDir();
        });
    });
    describe('get styleEntryUrls with style', () => {
        it('should return the style entry urls', async () => {
            const resolverMap = new RenderMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test',
                {}
            );
            expect(contentsMap.getEntityPaths('style')).not.toContain(
                '/test.md'
            );
            expect(contentsMap.getEntityPaths('style')).not.toContain(
                '/sub/test.md'
            );
            expect(contentsMap.getEntityPaths('style')).not.toContain(
                '/sample.txt'
            );
            expect(contentsMap.getEntityPaths('style')).toContain('/test.css');
            unmockingTestDir();
        });
    });

    describe('get all styleEntryUrls ', () => {
        it('should return the style entry urls', async () => {
            const resolverMap = new RenderMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test',
                {}
            );
            expect(contentsMap.getEntityPaths()).toContain('/test.md');
            expect(contentsMap.getEntityPaths()).toContain('/sub/test.md');
            expect(contentsMap.getEntityPaths()).toContain('/sample.txt');
            expect(contentsMap.getEntityPaths()).toContain('/test.css');
            unmockingTestDir();
        });
    });

    describe('render', () => {
        it('should render markdown', async () => {
            const resolverMap = new RenderMap();
            const markdownFakeResolver = jest
                .fn()
                .mockResolvedValue('test body' as never);
            resolverMap.set('markdown', {
                renderFromFile: markdownFakeResolver as (
                    fileName: string
                ) => Promise<string>,
            });

            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test',
                {}
            );

            const result = await contentsMap.render('/test.md');
            expect(result?.renderType).toEqual('markdown');
            expect(result?.contents).toEqual('test body');

            unmockingTestDir();
        });
        it('should return undefined on unknown url', async () => {
            const resolverMap = new RenderMap();

            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test',
                {}
            );

            const result = await contentsMap.render('/unknown.md');
            expect(result).toBeUndefined();
            unmockingTestDir();
        });
    });
});
