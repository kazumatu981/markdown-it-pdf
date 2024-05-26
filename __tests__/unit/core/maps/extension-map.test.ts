import { describe, it, expect } from '@jest/globals';
import { DefaultExtensionMap } from '../../../../src/core/maps/extension-map';

describe('CoreLibrary Unit Tests - ExtensionMap', () => {
    describe('getTypeInfo', () => {
        it('should return correct ExtensionTypeInfo for a valid extension name', () => {
            const extName = '.md';
            const expectedTypeInfo = {
                renderType: 'markdown',
                contentType: 'text/markdown',
                resolvedContentType: 'text/html',
            };
            const result = DefaultExtensionMap.getTypeInfo(extName);
            expect(result).toEqual(expectedTypeInfo);
        });

        it('should return default ExtensionTypeInfo for an extension name that does not exist in the extension map', () => {
            const extName = '.unknown';
            const expectedTypeInfo = {
                renderType: 'binary',
                contentType: 'application/octet-stream',
            };
            const result = DefaultExtensionMap.getTypeInfo(extName);
            expect(result).toEqual(expectedTypeInfo);
        });
    });
    describe('isSupported', () => {
        it('should return true for a supported file extension', () => {
            expect(DefaultExtensionMap.isSupported('file.md')).toBeTruthy();
        });

        it('should return false for an unsupported file extension', () => {
            expect(DefaultExtensionMap.isSupported('file.unknown')).toBeFalsy();
        });
    });
});
