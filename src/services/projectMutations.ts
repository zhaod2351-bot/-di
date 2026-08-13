import type { Asset, AssetType, AudioItem, Project, Shot } from '../types';

const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function createShot(project: Project, clipId: string): Project {
  const number = project.shots.filter((shot) => shot.clipId === clipId).length + 1;
  const shot: Shot = { id: id('s'), clipId, title: `新镜头 ${number}`, size: '中景 MS', duration: 4, visual: '描述此镜头的画面、动作与镜头运动。', audio: '环境音待补充', assetIds: [] };
  return { ...project, shots: [...project.shots, shot] };
}
export function removeAsset(project: Project, assetId: string): Project { return { ...project, assets: project.assets.filter((asset) => asset.id !== assetId) }; }
export function bindAsset(project: Project, shotId: string, assetId: string): Project { return { ...project, shots: project.shots.map((shot) => shot.id === shotId ? { ...shot, assetIds: shot.assetIds.includes(assetId) ? shot.assetIds : [...shot.assetIds, assetId] } : shot) }; }
export function unbindAsset(project: Project, shotId: string, assetId: string): Project { return { ...project, shots: project.shots.map((shot) => shot.id === shotId ? { ...shot, assetIds: shot.assetIds.filter((id) => id !== assetId) } : shot) }; }
export function removeShot(project: Project, shotId: string): Project { return { ...project, shots: project.shots.filter((shot) => shot.id !== shotId) }; }
export function createAsset(project: Project, type: AssetType): Project { const asset: Asset = { id: id('a'), type, name: `新${type}`, description: '补充此资产的视觉特点、材质、色彩与叙事作用。', tags: ['待完善'], color: '#b65d26' }; return { ...project, assets: [...project.assets, asset] }; }
export function createClip(project: Project): Project { const clip = { id: id('c'), name: `Clip ${String(project.clips.length + 1).padStart(2, '0')}`, summary: '新的剧情段落' }; return { ...project, clips: [...project.clips, clip] }; }
export function removeClip(project: Project, clipId: string): Project { if (project.clips.length < 2) return project; return { ...project, clips: project.clips.filter((clip) => clip.id !== clipId), shots: project.shots.filter((shot) => shot.clipId !== clipId) }; }
export function patchShot(project:Project, shotId:string, patch:Partial<Shot>):Project{return {...project,shots:project.shots.map(shot=>shot.id===shotId?{...shot,...patch}:shot)}}
export function addAudioItem(project:Project, shotId:string, item:AudioItem):Project{return patchShot(project,shotId,{audioItems:[...(project.shots.find(x=>x.id===shotId)?.audioItems||[]),item]})}
export function removeAudioItem(project:Project, shotId:string, itemId:string):Project{return patchShot(project,shotId,{audioItems:(project.shots.find(x=>x.id===shotId)?.audioItems||[]).filter(x=>x.id!==itemId)})}
