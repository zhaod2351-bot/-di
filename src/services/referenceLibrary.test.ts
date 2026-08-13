import { describe, expect, it } from 'vitest';
import { addReferenceMetadata, buildReferencePath, sanitizeFolderName } from './referenceLibrary';

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
});
