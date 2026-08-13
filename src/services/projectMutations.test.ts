import { describe, expect, it } from 'vitest';
import { demoProject } from '../data/demoProject';
import { addAudioItem, bindAsset, createClip, createShot, duplicateShot, moveShot, patchClip, patchShot, removeAsset, removeAudioItem, removeClip } from './projectMutations';

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
  it('creates, edits and removes clips with their shots', () => {
    const created = createClip(demoProject);
    const clip = created.clips.at(-1)!;
    const edited = patchClip(created, clip.id, { name: '追逐段', summary: '快速逃离' });
    const withShot = createShot(edited, clip.id);
    const removed = removeClip(withShot, clip.id);
    expect(edited.clips.at(-1)).toMatchObject({ name: '追逐段', summary: '快速逃离' });
    expect(removed.clips.some((item) => item.id === clip.id)).toBe(false);
    expect(removed.shots.some((shot) => shot.clipId === clip.id)).toBe(false);
  });
  it('duplicates and moves a shot inside its clip', () => {
    const copied = duplicateShot(demoProject, 's1');
    const newShot = copied.shots.find((shot) => shot.id !== 's1' && shot.title.includes('副本'))!;
    const moved = moveShot(copied, newShot.id, -1);
    expect(newShot).toMatchObject({ clipId: 'c1', duration: 5.5, assetIds: ['a3'] });
    expect(moved.shots.filter((shot) => shot.clipId === 'c1')[0].id).toBe(newShot.id);
  });
});
