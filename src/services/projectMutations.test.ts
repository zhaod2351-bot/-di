import { describe, expect, it } from 'vitest';
import { demoProject } from '../data/demoProject';
import { addAudioItem, bindAsset, createShot, patchShot, removeAsset, removeAudioItem } from './projectMutations';

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
  it('edits action and audio items without changing another shot', () => {
    const edited = patchShot(demoProject, 's1', { action: '林澈回头示意' });
    const withAudio = addAudioItem(edited, 's1', { id: 'audio-new', kind: '对白', content: '跟紧我', speaker: '林澈' });
    const result = removeAudioItem(withAudio, 's1', 'audio-new');
    expect(result.shots.find((shot) => shot.id === 's1')?.action).toBe('林澈回头示意');
    expect(result.shots.find((shot) => shot.id === 's2')).toEqual(demoProject.shots.find((shot) => shot.id === 's2'));
  });
});
