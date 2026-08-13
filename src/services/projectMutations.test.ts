import { describe, expect, it } from 'vitest';
import { demoProject } from '../data/demoProject';
import { bindAsset, createShot, removeAsset } from './projectMutations';

describe('project mutations', () => {
  it('creates a new shot for the selected clip', () => {
    const next = createShot(demoProject, 'c1');
    expect(next.shots.filter((shot) => shot.clipId === 'c1')).toHaveLength(4);
  });
  it('keeps a missing reference when an asset is removed', () => {
    const next = removeAsset(demoProject, 'a1');
    expect(next.assets.some((asset) => asset.id === 'a1')).toBe(false);
    expect(next.shots.find((shot) => shot.id === 's2')?.assetIds).toContain('a1');
  });
  it('binds an asset to a shot once', () => {
    const next = bindAsset(demoProject, 's1', 'a1');
    expect(next.shots.find((shot) => shot.id === 's1')?.assetIds).toContain('a1');
  });
});
