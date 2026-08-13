import { describe, expect, it } from 'vitest';
import { addReferenceMetadata, buildReferencePath, removeReferenceMetadata, sanitizeFolderName, validateReferenceFile } from './referenceLibrary';

describe('reference library', () => {
  it('creates Chinese nested reference paths with safe asset names', () => {
    expect(sanitizeFolderName('废弃/城市:街道')).toBe('废弃_城市_街道');
    expect(buildReferencePath({ project: '余烬回声', clip: 'Clip 01', type: '场景', asset: '废弃/城市:街道', fileName: '原图.png', stamp: '20260813_153015' }))
      .toBe('余烬回声/Clip 01/场景/废弃_城市_街道/参考图/20260813_153015_原图.png');
  });

  it('adds a new primary reference without overwriting prior images', () => {
    const next = addReferenceMetadata([], { id: 'r2', name: '新图.png', source: 'local-folder', previewUrl: 'blob:new', createdAt: '2026-08-13T15:30:15Z' });
    expect(next).toEqual([{ id: 'r2', name: '新图.png', source: 'local-folder', previewUrl: 'blob:new', createdAt: '2026-08-13T15:30:15Z', isPrimary: true }]);
  });

  it('rejects non-images and files larger than 50MB', () => {
    expect(validateReferenceFile({ type:'application/pdf', size:100 } as File)).toBe('仅支持 PNG、JPG、JPEG 或 WEBP 图片');
    expect(validateReferenceFile({ type:'image/png', size:51 * 1024 * 1024 } as File)).toBe('单张参考图不能超过 50MB');
    expect(validateReferenceFile({ type:'image/webp', size:1024 } as File)).toBeNull();
  });

  it('removes only the in-app reference metadata without deleting a local source file', () => {
    const next = removeReferenceMetadata([{ id:'r1', name:'D盘原始图.png', source:'local-folder', previewUrl:'blob:one', createdAt:'now', isPrimary:true }], 'r1');
    expect(next).toEqual([]);
  });
});
