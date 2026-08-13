import { describe, expect, it } from 'vitest';
import { parseImportedDirectorPlan } from './importedDirectorPlan';

const validPlan = {
  polishedScript: '润色后的剧本。苏林在废弃城市中发现小狐狸。',
  analysis: {
    summary: '苏林救下小狐狸并逃离威胁。',
    characters: ['苏林', '小狐狸'],
    scenes: ['废弃城市街道'],
    props: ['混合型浓缩炸弹'],
    warnings: [],
  },
  clips: [{
    title: 'Clip 01',
    summary: '建立环境和人物关系。',
    shots: [{
      title: '废弃城市建立',
      size: '远景 WS',
      duration: 5,
      visual: '建立废弃城市街道的空间与氛围。',
      cameraMove: '缓慢推进',
      action: '苏林停步观察四周。',
      assets: ['苏林', '废弃城市街道'],
      audioItems: [{ kind: '环境音', content: '风声穿过空街。' }],
    }],
  }],
};

describe('parseImportedDirectorPlan', () => {
  it('parses a complete polished script and director plan', () => {
    expect(parseImportedDirectorPlan(JSON.stringify(validPlan))).toMatchObject({
      polishedScript: '润色后的剧本。苏林在废弃城市中发现小狐狸。',
      clips: [{ title: 'Clip 01', shots: [{ title: '废弃城市建立', duration: 5 }] }],
    });
  });

  it('requires clips in the imported plan', () => {
    const missingClips = { ...validPlan } as { clips?: unknown } & typeof validPlan;
    delete missingClips.clips;
    expect(() => parseImportedDirectorPlan(JSON.stringify(missingClips))).toThrow('clips');
  });

  it('rejects a non-positive shot duration', () => {
    const invalid = structuredClone(validPlan);
    invalid.clips[0].shots[0].duration = 0;
    expect(() => parseImportedDirectorPlan(JSON.stringify(invalid))).toThrow('duration');
  });
});
