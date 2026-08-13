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

export function validateReferenceFile(file:Pick<File,'type'|'size'>):string|null {
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)) return '仅支持 PNG、JPG、JPEG 或 WEBP 图片';
  if(file.size>50*1024*1024) return '单张参考图不能超过 50MB';
  return null;
}

type DirectoryHandle = { getDirectoryHandle:(name:string, options:{create:boolean})=>Promise<DirectoryHandle>; getFileHandle:(name:string, options:{create:boolean})=>Promise<{createWritable:()=>Promise<{write:(file:File)=>Promise<void>;close:()=>Promise<void>}>}> };

export async function writeReferenceToDirectory(root:DirectoryHandle, path:string, file:File):Promise<void> {
  const parts=path.split('/'); const filename=parts.pop(); if(!filename) throw new Error('参考图文件名无效'); let target=root;
  for(const folder of parts) target=await target.getDirectoryHandle(folder,{create:true});
  const handle=await target.getFileHandle(filename,{create:true}); const stream=await handle.createWritable(); await stream.write(file); await stream.close();
}

export const supportsLocalDirectory=()=>typeof window!=='undefined'&&'showDirectoryPicker' in window;

let referenceRoot:DirectoryHandle|undefined;

const databaseName='sceneweaver-reference-library';

async function storeRoot(root:DirectoryHandle):Promise<void>{
  if(typeof indexedDB==='undefined') return;
  await new Promise<void>((resolve,reject)=>{const request=indexedDB.open(databaseName,1);request.onupgradeneeded=()=>request.result.createObjectStore('handles');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const tx=request.result.transaction('handles','readwrite');tx.objectStore('handles').put(root,'root');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)}});
}
async function restoreRoot():Promise<DirectoryHandle|undefined>{
  if(typeof indexedDB==='undefined') return undefined;
  return new Promise((resolve)=>{const request=indexedDB.open(databaseName,1);request.onupgradeneeded=()=>request.result.createObjectStore('handles');request.onerror=()=>resolve(undefined);request.onsuccess=()=>{const tx=request.result.transaction('handles','readonly');const get=tx.objectStore('handles').get('root');get.onsuccess=()=>resolve(get.result as DirectoryHandle|undefined);get.onerror=()=>resolve(undefined)}});
}

export async function chooseReferenceRoot():Promise<void> {
  if(!supportsLocalDirectory()) throw new Error('当前浏览器不支持本地文件夹授权');
  const picker=(window as unknown as Window & {showDirectoryPicker:()=>Promise<DirectoryHandle>}).showDirectoryPicker;
  referenceRoot=await picker(); await storeRoot(referenceRoot);
}

export async function saveReferenceFile(path:string,file:File):Promise<'local-folder'|'browser-storage'> {
  referenceRoot=referenceRoot||await restoreRoot();
  if(referenceRoot){await writeReferenceToDirectory(referenceRoot,path,file);return 'local-folder';}
  return 'browser-storage';
}
