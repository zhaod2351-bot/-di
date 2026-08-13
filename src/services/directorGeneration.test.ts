import { describe, expect, it } from 'vitest';
import type { ScriptAnalysis, ScriptVersion } from '../types';
import { generateDirectorData } from './directorGeneration';

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
});
