import { jest, describe, it, expect } from '@jest/globals';
import { ContentsManager } from '../../../../src/core/maps';
import { mockingTestDir, unmockingTestDir } from '../../../utils/test-dir';

// TODO add test get/set renderMap

describe('CoreLibrary Unit Tests - ContentsMap', () => {
    describe('createInstance', () => {
        it('should create an instance - recursive', async () => {
            mockingTestDir();
            const manager = new ContentsManager('test', { recursive: true });
            await manager.refresh();
            expect(manager.contentsMap.keys()).toContain('/test.md');
            expect(manager.contentsMap.keys()).toContain('/sample.txt');
            expect(manager.contentsMap.keys()).toContain('/sub/test.md');
            unmockingTestDir();
        });
        it('should create an instance - not recursive', async () => {
            mockingTestDir();
            const manager = new ContentsManager('test', { recursive: false });
            await manager.refresh();
            expect(manager.contentsMap.keys()).toContain('/test.md');
            expect(manager.contentsMap.keys()).toContain('/sample.txt');
            expect(manager.contentsMap.keys()).not.toContain('/sub/test.md');
            unmockingTestDir();
        });
        it('should create an instance - recursive on abbreviate recursive', async () => {
            mockingTestDir();
            const manager = new ContentsManager('test', {});
            await manager.refresh();
            expect(manager.contentsMap.keys()).toContain('/test.md');
            expect(manager.contentsMap.keys()).toContain('/sample.txt');
            expect(manager.contentsMap.keys()).toContain('/sub/test.md');
            unmockingTestDir();
        });
        it('should create an instance - recursive on abbreviate options', async () => {
            mockingTestDir();
            const manager = new ContentsManager('test');
            await manager.refresh();
            expect(manager.contentsMap.keys()).toContain('/test.md');
            expect(manager.contentsMap.keys()).toContain('/sample.txt');
            expect(manager.contentsMap.keys()).toContain('/sub/test.md');
            unmockingTestDir();
        });
    });
    describe('getEntityPaths() with markdown', () => {
        it('should return the markdown entry urls', async () => {
            mockingTestDir();
            const manager = new ContentsManager('test');
            await manager.refresh();
            expect(manager.getEntityPaths('markdown')).toContain('/test.md');
            expect(manager.getEntityPaths('markdown')).toContain(
                '/sub/test.md'
            );
            expect(manager.getEntityPaths('markdown')).not.toContain(
                '/sample.txt'
            );
            expect(manager.getEntityPaths('markdown')).not.toContain(
                '/test.css'
            );
            unmockingTestDir();
        });
    });
    describe('get styleEntryUrls with style', () => {
        it('should return the style entry urls', async () => {
            mockingTestDir();
            const manager = new ContentsManager('test');
            await manager.refresh();
            expect(manager.getEntityPaths('style')).not.toContain('/test.md');
            expect(manager.getEntityPaths('style')).not.toContain(
                '/sub/test.md'
            );
            expect(manager.getEntityPaths('style')).not.toContain(
                '/sample.txt'
            );
            expect(manager.getEntityPaths('style')).toContain('/test.css');
            unmockingTestDir();
        });
    });

    describe('get all entryUrls ', () => {
        it('should return the style entry urls', async () => {
            mockingTestDir();
            const manager = new ContentsManager('test');
            await manager.refresh();
            expect(manager.getEntityPaths()).toContain('/test.md');
            expect(manager.getEntityPaths()).toContain('/sub/test.md');
            expect(manager.getEntityPaths()).toContain('/sample.txt');
            expect(manager.getEntityPaths()).toContain('/test.css');
            unmockingTestDir();
        });
    });

    describe('render', () => {
        it('should render markdown', async () => {
            const markdownFakeResolver = jest
                .fn()
                .mockResolvedValue('test body' as never);

            mockingTestDir();
            const manager = new ContentsManager('test');
            await manager.refresh();
            manager.setRender('markdown', {
                renderFromFile: markdownFakeResolver as (
                    fileName: string
                ) => Promise<string>,
            });

            const result = await manager.render('/test.md');
            expect(result?.renderType).toEqual('markdown');
            expect(result?.contents).toEqual('test body');

            unmockingTestDir();
        });
        it('should return undefined on unknown url', async () => {
            mockingTestDir();
            const manager = new ContentsManager('test');
            await manager.refresh();

            const result = await manager.render('/unknown.md');
            expect(result).toBeUndefined();
            unmockingTestDir();
        });
    });
});
