import type { ReferenceImage } from '../types';

export type ReferencePathInput = { project:string; clip?:string; type:string; asset:string; fileName:string; stamp:string };
export type NewReference = Omit<ReferenceImage, 'isPrimary'>;

export function sanitizeFolderName(value:string):string { return value.trim().replace(/[<>:"/\\|?*]/g, '_').replace(/\.+$/g, '_') || '未命名资产'; }

export function buildReferencePath(input:ReferencePathInput):string {
  const file = sanitizeFolderName(input.fileName.replace(/\.[^.]+$/, ''));
  const extension = input.fileName.match(/(\.[^.]+)$/)?.[1] || '';
  return [sanitizeFolderName(input.project), input.clip ? sanitizeFolderName(input.clip) : '全局资产', sanitizeFolderName(input.type), sanitizeFolderName(input.asset), '参考图', `${input.stamp}_${file}${extension}`].join('/');
}

export function addReferenceMetadata(existing:ReferenceImage[], image:NewReference):ReferenceImage[] {
  return [...existing.map(item => ({ ...item, isPrimary:false })), { ...image, isPrimary:true }];
}

export function setPrimaryReference(existing:ReferenceImage[], id:string):ReferenceImage[] { return existing.map(item => ({ ...item, isPrimary:item.id===id })); }

export function removeReferenceMetadata(existing:ReferenceImage[], id:string):ReferenceImage[] {
  const next=existing.filter(item=>item.id!==id); if(next.length && !next.some(item=>item.isPrimary)) next[0]={...next[0],isPrimary:true}; return next;
}
