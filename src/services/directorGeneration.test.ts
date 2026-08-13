import { describe, expect, it } from 'vitest';
import type { ScriptAnalysis, ScriptVersion } from '../types';
import { applyDirectorGeneration, createDirectorPlan, generateDirectorData } from './directorGeneration';

describe('director generation', () => {
  it('creates manual-completion assets and asset-linked shots for a locked version', () => {
    const analysis: ScriptAnalysis = {
      summary: '林澈在废城街道发现旧相机。',
      characters: ['林澈：幸存者'],
      scenes: ['废城街道：雨夜'],
      props: ['旧相机'],
      warnings: [],
    };
    const version = { id: 'sv-9', label: '1-1 v9', status: 'locked', source: '剧本' } as ScriptVersion;

    const generated = generateDirectorData(analysis, version);

    expect(generated.assets.map((asset) => asset.name)).toEqual(['林澈', '废城街道', '旧相机']);
    expect(generated.assets.every((asset) => asset.status === '待完善' && asset.description === '')).toBe(true);
    expect(generated.shots.length).toBeGreaterThanOrEqual(2);
    expect(generated.shots.every((shot) => shot.scriptVersionId === 'sv-9' && shot.assetIds.length > 0)).toBe(true);
  });

  it('replaces only downstream data and preserves the locked script source', () => {
    const version = { id: 'sv-10', label: '1-1 v10', status: 'locked', source: '不可改写的锁定剧本' } as ScriptVersion;
    const generated = generateDirectorData({ summary: '新分镜', characters: ['林澈'], scenes: ['街道'], props: [], warnings: [] }, version);
    const project = { title: '项目', script: '当前剧本', scriptVersion: version, assets: [], clips: [], shots: [] };

    const replaced = applyDirectorGeneration(project, generated);

    expect(replaced.scriptVersion?.source).toBe('不可改写的锁定剧本');
    expect(replaced.shots.every((shot) => shot.scriptVersionId === 'sv-10')).toBe(true);
  });

  it('creates a polished multi-clip director plan with action, camera and audio', () => {
    const version = { id: 'sv-plan', label: '1-1 v3', status: 'locked', source: '林澈在废城发现小狐，敌人逼近。' } as ScriptVersion;
    const plan = createDirectorPlan({ summary:'林澈在废城遇见小狐，敌人逼近。', characters:['林澈','小狐'], scenes:['废弃城市街道'], props:['混合型浓缩炸弹'], warnings:[] }, version);

    expect(plan.polishedScript.length).toBeGreaterThan(version.source.length);
    expect(plan.clips.length).toBeGreaterThanOrEqual(3);
    expect(plan.clips.every((clip) => plan.shots.filter((shot) => shot.clipId === clip.id).length >= 3)).toBe(true);
    expect(plan.shots.every((shot) => shot.cameraMove && shot.action && (shot.audioItems?.length || 0) > 0)).toBe(true);
  });
});
