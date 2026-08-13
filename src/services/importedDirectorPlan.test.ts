import { describe, expect, it } from 'vitest';
import { applyImportedDirectorPlan, parseImportedDirectorPlan } from './importedDirectorPlan';
import { createLockedVersion } from './scriptAnalysis';
import type { Project } from '../types';

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
      assets: [{ type: '角色', name: '苏林' }, { type: '场景', name: '废弃城市街道' }],
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
    const { clips: _clips, ...missingClips } = validPlan;
    expect(() => parseImportedDirectorPlan(JSON.stringify(missingClips))).toThrow('clips');
  });

  it('rejects a non-positive shot duration', () => {
    const invalid = structuredClone(validPlan);
    invalid.clips[0].shots[0].duration = 0;
    expect(() => parseImportedDirectorPlan(JSON.stringify(invalid))).toThrow('duration');
  });

  it('keeps same-name assets distinct when their types differ', () => {
    const duplicate = structuredClone(validPlan);
    duplicate.analysis.props = ['苏林'];
    duplicate.clips[0].shots[0].assets = [{ type: '角色', name: '苏林' }, { type: '道具', name: '苏林' }];
    const plan = parseImportedDirectorPlan(JSON.stringify(duplicate));
    const project: Project = { title: '测试', script: '原文', assets: [], clips: [], shots: [] };
    const version = createLockedVersion(project, plan.analysis, 'imported', plan.polishedScript);
    const result = applyImportedDirectorPlan({ ...project, scriptVersion: version }, version, plan);
    expect(result.assets.filter((asset) => asset.name === '苏林')).toHaveLength(2);
    expect(result.shots[0].assetIds).toHaveLength(2);
  });
});

describe('applyImportedDirectorPlan', () => {
  it('uses imported shots verbatim and retains matching local reference images', () => {
    const plan = parseImportedDirectorPlan(JSON.stringify(validPlan));
    const existingImages = [{ id: 'ref-1', name: 'sulin.png', source: 'browser-storage' as const, previewUrl: 'blob:x', createdAt: '2026-08-13', isPrimary: true }];
    const project: Project = {
      title: '余烬回声', script: '原始剧本不被修改。', clips: [], shots: [],
      assets: [{ id: 'old-sulin', type: '角色', name: '苏林', description: '用户填写的角色设定', tags: ['主角'], color: '#a94a12', status: '已完善', referenceImages: existingImages }],
    };
    const version = createLockedVersion(project, plan.analysis, 'imported', plan.polishedScript);
    const result = applyImportedDirectorPlan({ ...project, scriptVersion: version }, version, plan);

    expect(result.script).toBe('原始剧本不被修改。');
    expect(result.scriptVersion?.polishedScript).toBe('润色后的剧本。苏林在废弃城市中发现小狐狸。');
    expect(result.clips).toHaveLength(1);
    expect(result.shots[0]).toMatchObject({ cameraMove: '缓慢推进', action: '苏林停步观察四周。', duration: 5 });
    expect(result.assets.find((asset) => asset.name === '苏林')?.referenceImages).toEqual(existingImages);
  });
});
