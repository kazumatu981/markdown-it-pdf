import { jest, describe, it, expect } from '@jest/globals';
import { ContentsMap } from '../../src/core/contents-map';
import { ResolverMap } from '../../src/core/resolver-map';
import { mockingTestDir, unmockingTestDir } from '../utils/test-dir';
import { type ContentsResolverFunction } from '../../src/core/resolver-map';

describe('CoreLibrary Unit Tests - ContentsMap', () => {
    describe('createInstance', () => {
        it('should create an instance - recursive', async () => {
            const resolverMap = new ResolverMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test',
                { recursive: true }
            );
            expect(contentsMap).toBeTruthy();
            expect(contentsMap.keys()).toContain('/test.md');
            expect(contentsMap.keys()).toContain('/sample.txt');
            expect(contentsMap.keys()).toContain('/sub/test.md');
            unmockingTestDir();
        });
        it('should create an instance - not recursive', async () => {
            const resolverMap = new ResolverMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test',
                { recursive: false }
            );
            expect(contentsMap).toBeTruthy();
            expect(contentsMap.keys()).toContain('/test.md');
            expect(contentsMap.keys()).toContain('/sample.txt');
            expect(contentsMap.keys()).not.toContain('/sub/test.md');
            unmockingTestDir();
        });
        it('should create an instance - recursive on abbreviate recursive', async () => {
            const resolverMap = new ResolverMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test',
                {}
            );
            expect(contentsMap).toBeTruthy();
            expect(contentsMap.keys()).toContain('/test.md');
            expect(contentsMap.keys()).toContain('/sample.txt');
            expect(contentsMap.keys()).toContain('/sub/test.md');
            unmockingTestDir();
        });
        it('should create an instance - recursive on abbreviate options', async () => {
            const resolverMap = new ResolverMap();
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
    describe('get markdownEntryUrls', () => {
        it('should return the markdown entry urls', async () => {
            const resolverMap = new ResolverMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test'
            );
            expect(contentsMap.markdownEntryUrls).toContain('/test.md');
            expect(contentsMap.markdownEntryUrls).toContain('/sub/test.md');
            expect(contentsMap.markdownEntryUrls).not.toContain('/sample.txt');
            expect(contentsMap.markdownEntryUrls).not.toContain('/test.css');
            unmockingTestDir();
        });
    });
    describe('get styleEntryUrls', () => {
        it('should return the style entry urls', async () => {
            const resolverMap = new ResolverMap();
            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test'
            );
            expect(contentsMap.styleEntryUrls).not.toContain('/test.md');
            expect(contentsMap.styleEntryUrls).not.toContain('/sub/test.md');
            expect(contentsMap.styleEntryUrls).not.toContain('/sample.txt');
            expect(contentsMap.styleEntryUrls).toContain('/test.css');
            unmockingTestDir();
        });
    });
    describe('render', () => {
        it('should render markdown', async () => {
            const resolverMap = new ResolverMap();
            const markdownFakeResolver = jest
                .fn()
                .mockResolvedValue('test body' as never);
            resolverMap.set(
                'markdown',
                markdownFakeResolver as ContentsResolverFunction
            );

            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test'
            );

            const result = await contentsMap.render('/test.md');
            expect(result?.resolverType).toEqual('markdown');
            expect(result?.contents).toEqual('test body');

            unmockingTestDir();
        });
        it('should return undefined on unknown url', async () => {
            const resolverMap = new ResolverMap();

            mockingTestDir();
            const contentsMap = await ContentsMap.createInstance(
                resolverMap,
                'test'
            );

            const result = await contentsMap.render('/unknown.md');
            expect(result).toBeUndefined();
            unmockingTestDir();
        });
    });
});
