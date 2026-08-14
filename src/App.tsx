import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Clapperboard,
  Copy,
  FileInput,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { demoProject } from "./data/demoProject";
import {
  applyImportedDirectorPlan,
  buildImportedDirectorPrompt,
  parseImportedDirectorPlan,
  type ImportedDirectorPlan,
} from "./services/importedDirectorPlan";
import {
  addAssetVariant,
  addAudioItem,
  assetReadiness,
  bindAsset,
  createAsset,
  createClip,
  createShot,
  duplicateShot,
  moveShot,
  patchClip,
  removeAsset,
  removeAssetVariant,
  removeAudioItem,
  removeClip,
  removeShot,
  patchShot,
  selectShotAssetVariant,
  unbindAsset,
} from "./services/projectMutations";
import {
  analyzeScript,
  createLockedVersion,
  lockVersion,
  newScriptVersion,
} from "./services/scriptAnalysis";
import {
  applyDirectorPlan,
  createDirectorPlan,
} from "./services/directorGeneration";
import {
  addReferenceMetadata,
  buildReferencePath,
  chooseReferenceRoot,
  removeReferenceMetadata,
  saveReferenceFile,
  setPrimaryReference,
  supportsLocalDirectory,
  validateReferenceFile,
} from "./services/referenceLibrary";
import type {
  Asset,
  AssetType,
  AssetVariant,
  Project,
  ScriptAnalysis,
  Shot,
} from "./types";

type Page = "original" | "imported" | "assets" | "director";
const key = "sceneweaver-project";

export default function App() {
  const [page, setPage] = useState<Page>("original");
  const [directorTarget, setDirectorTarget] = useState<{
    clipId: string;
    shotId: string;
  } | null>(null);
  const [project, setProject] = useState<Project>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "") || demoProject;
    } catch {
      return demoProject;
    }
  });
  const [toast, setToast] = useState("");
  const commit = (next: Project, message = "已保存") => {
    setProject(next);
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };
  useEffect(
    () => localStorage.setItem(key, JSON.stringify(project)),
    [project],
  );
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="logo">S</div>
          <b>SceneWeaver</b>
        </div>
        <div className="project-type">二维动画</div>
        <h2>{project.title}</h2>
        <small>生产流程</small>
        <Nav
          active={page === "original" || page === "imported"}
          icon={<BookOpen size={19} />}
          onClick={() => setPage("original")}
        >
          故事与剧本
        </Nav>
        <div className="story-children">
          <button
            className={page === "original" ? "child active" : "child"}
            onClick={() => setPage("original")}
          >
            原创剧本
          </button>
          <button
            className={page === "imported" ? "child active" : "child"}
            onClick={() => setPage("imported")}
          >
            导入式剧本
          </button>
        </div>
        <Nav
          active={page === "assets"}
          icon={<UserRound size={19} />}
          onClick={() => setPage("assets")}
        >
          设计与资产
        </Nav>
        <Nav
          active={page === "director"}
          icon={<Clapperboard size={19} />}
          onClick={() => setPage("director")}
        >
          导演工作室
        </Nav>
      </aside>
      <main>
        <header>
          <div className="crumb">
            工作台　›　二维动画　›　<b>{project.title}</b>
          </div>
          <button
            className="ghost"
            onClick={() => commit(demoProject, "已恢复示例")}
          >
            恢复示例
          </button>
        </header>
        {project.scriptVersion?.status === "locked" && (
          <div className="version-bar">
            🔒 当前生产来源：
            {project.scriptVersion.sourceMode === "imported"
              ? "导入式剧本"
              : "原创剧本"}{" "}
            · {project.scriptVersion.label}
          </div>
        )}
        {page === "original" && <Original project={project} commit={commit} />}{" "}
        {page === "imported" && <Imported project={project} commit={commit} />}{" "}
        {page === "assets" && (
          <Assets
            project={project}
            commit={commit}
            goDirector={(clipId, shotId) => {
              setDirectorTarget({ clipId, shotId });
              setPage("director");
            }}
          />
        )}{" "}
        {page === "director" && (
          <Director project={project} commit={commit} target={directorTarget} />
        )}
      </main>
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
function Nav({
  active,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={"nav " + (active ? "active" : "")} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}
function AnalysisModal({
  analysis,
  project,
  commit,
  mode,
  close,
}: {
  analysis: ScriptAnalysis;
  project: Project;
  commit: (p: Project, m?: string) => void;
  mode: "original" | "imported";
  close: () => void;
}) {
  return (
    <div className="analysis-modal">
      <div className="analysis-card">
        <button className="close" onClick={close}>
          <X />
        </button>
        <h2>{mode === "imported" ? "导入结果预览" : "AI 剧本分析预览"}</h2>
        <p>{analysis.summary}</p>
        <div className="analysis-grid">
          <div>
            <b>人物</b>
            {analysis.characters.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          <div>
            <b>场景</b>
            {analysis.scenes.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          <div>
            <b>道具</b>
            {analysis.props.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </div>
        {analysis.warnings.map((x) => (
          <p className="warning" key={x}>
            ⚠ {x}
          </p>
        ))}
        <div className="analysis-actions">
          <button
            className="orange"
            onClick={() => {
              commit(
                lockVersion(project, analysis, mode),
                "剧本已确认并锁定，导演台已生成",
              );
              close();
            }}
          >
            确认并锁定剧本
          </button>
          <button className="ghost" onClick={close}>
            返回修改
          </button>
        </div>
      </div>
    </div>
  );
}
function Original({
  project,
  commit,
}: {
  project: Project;
  commit: (p: Project, m?: string) => void;
}) {
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const locked = project.scriptVersion?.status === "locked";
  return (
    <section>
      <div className="script-card">
        <div className="section-title">
          <div>
            <h2>剧本 1-1</h2>
            <small>
              {locked
                ? "该版本已锁定并驱动资产与导演台。"
                : "写完后分析人物、场景、道具并锁定版本。"}
            </small>
          </div>
          {locked ? (
            <button
              className="orange"
              onClick={() =>
                commit(newScriptVersion(project), "已创建新剧本版本")
              }
            >
              创建新版本
            </button>
          ) : (
            <button
              className="orange"
              onClick={() => setAnalysis(analyzeScript(project.script))}
            >
              <Sparkles size={16} />
              AI 剧本分析
            </button>
          )}
        </div>
        <textarea
          readOnly={locked}
          value={project.script}
          onChange={(e) => commit({ ...project, script: e.target.value })}
        />
      </div>
      {analysis && (
        <AnalysisModal
          analysis={analysis}
          project={project}
          commit={commit}
          mode="original"
          close={() => setAnalysis(null)}
        />
      )}
    </section>
  );
}
function Imported({
  project,
  commit,
}: {
  project: Project;
  commit: (p: Project, m?: string) => void;
}) {
  const [text, setText] = useState("");
  const [plan, setPlan] = useState<ImportedDirectorPlan | null>(null);
  const [error, setError] = useState("");
  return (
    <section className="import-page">
      <div className="import-head">
        <FileInput size={25} />
        <div>
          <h1>导入式剧本</h1>
          <p>
            先在 ChatGPT 完成润色和完整拆镜，再把原始 JSON
            导入；系统不会再次自动拆解。
          </p>
        </div>
      </div>
      <div className="import-steps">
        <div>
          <b>1</b>
          <h3>复制完整导演台提示词</h3>
          <button
            className="orange"
            onClick={() =>
              navigator.clipboard.writeText(
                buildImportedDirectorPrompt(
                  project.script,
                  project.scriptVersion?.label || "1-1 v1",
                ),
              )
            }
          >
            <Copy size={16} />
            复制 ChatGPT 完整导演台提示词
          </button>
        </div>
        <div>
          <b>2</b>
          <h3>粘贴完整 JSON</h3>
          <textarea
            className="json-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'{"polishedScript":"...","analysis":{},"clips":[...]}'}
          />
          {error && <p className="import-error">{error}</p>}
          <button
            className="ghost"
            onClick={() => {
              try {
                setPlan(parseImportedDirectorPlan(text));
                setError("");
              } catch (e) {
                setError(e instanceof Error ? e.message : "导入失败");
              }
            }}
          >
            校验并预览完整导演台
          </button>
        </div>
      </div>
      {plan && (
        <ImportedPlanModal
          plan={plan}
          project={project}
          commit={commit}
          close={() => setPlan(null)}
        />
      )}
    </section>
  );
}
function ImportedPlanModal({
  plan,
  project,
  commit,
  close,
}: {
  plan: ImportedDirectorPlan;
  project: Project;
  commit: (p: Project, m?: string) => void;
  close: () => void;
}) {
  const count = plan.clips.reduce(
    (total, clip) => total + clip.shots.length,
    0,
  );
  return (
    <div className="analysis-modal">
      <div className="analysis-card">
        <button className="close" onClick={close}>
          <X />
        </button>
        <h2>完整导演台导入预览</h2>
        <p>{plan.polishedScript}</p>
        <div className="analysis-grid">
          <div>
            <b>人物 {plan.analysis.characters.length}</b>
            {plan.analysis.characters.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          <div>
            <b>Clip {plan.clips.length}</b>
            {plan.clips.map((x) => (
              <span key={x.title}>{x.title}</span>
            ))}
          </div>
          <div>
            <b>镜头 {count}</b>
            <span>将保留原始运镜、动作、音频和资产绑定</span>
          </div>
        </div>
        <p className="warning">
          原始剧本不会被改写；确认后只把此 JSON
          的导演数据锁定并同步到导演工作室，之后仍可逐镜修改。
        </p>
        <div className="analysis-actions">
          <button
            className="orange"
            onClick={() => {
              const version = createLockedVersion(
                project,
                plan.analysis,
                "imported",
                plan.polishedScript,
              );
              commit(
                applyImportedDirectorPlan(
                  { ...project, scriptVersion: version },
                  version,
                  plan,
                ),
                "完整导演台已导入并锁定，可前往导演工作室继续修改",
              );
              close();
            }}
          >
            确认导入并锁定剧本
          </button>
          <button className="ghost" onClick={close}>
            返回修改
          </button>
        </div>
      </div>
    </div>
  );
}

function Assets({
  project,
  commit,
  goDirector,
}: {
  project: Project;
  commit: (p: Project, m?: string) => void;
  goDirector: (clipId: string, shotId: string) => void;
}) {
  const [type, setType] = useState<AssetType>("角色");
  const [q, setQ] = useState("");
  const [chosen, setChosen] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileError, setFileError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const list = project.assets.filter(
    (x) => x.type === type && x.name.includes(q),
  );
  const asset = project.assets.find((x) => x.id === chosen) || list[0];
  useEffect(() => {
    if (asset) setChosen(asset.id);
  }, [type, q, asset?.id]);
  if (!asset) return <section>暂无资产</section>;
  const update = (patch: Partial<Asset>, message = "已保存") =>
    commit(
      {
        ...project,
        assets: project.assets.map((x) =>
          x.id === asset.id ? { ...x, ...patch } : x,
        ),
      },
      message,
    );
  const primary = asset.referenceImages?.find((x) => x.isPrimary);
  const readiness = assetReadiness(asset);
  const relatedShots = project.shots.filter((s) =>
    s.assetIds.includes(asset.id),
  );
  const [variantName, setVariantName] = useState("");
  const [variantDescription, setVariantDescription] = useState("");
  const variants = asset.variants || [];
  const addVariant = () => {
    const name = variantName.trim();
    if (!name) return;
    commit(
      addAssetVariant(project, asset.id, {
        id: `variant-${Date.now()}`,
        name,
        description: variantDescription.trim(),
      }),
      "已新增资产变体",
    );
    setVariantName("");
    setVariantDescription("");
  };
  const upload = async (file?: File) => {
    if (!file) return;
    const error = validateReferenceFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    try {
      let source: "local-folder" | "browser-storage" = "browser-storage";
      if (supportsLocalDirectory()) {
        try {
          await chooseReferenceRoot();
          const clip = project.clips.find((c) =>
            project.shots.some(
              (s) => s.clipId === c.id && s.assetIds.includes(asset.id),
            ),
          )?.name;
          const path = buildReferencePath({
            project: project.title,
            clip,
            type: asset.type,
            asset: asset.name,
            fileName: file.name,
            stamp: new Date()
              .toISOString()
              .replace(/[-:TZ.]/g, "")
              .slice(0, 14),
          });
          source = await saveReferenceFile(path, file);
        } catch {
          source = "browser-storage";
        }
      }
      const previewUrl = URL.createObjectURL(file);
      const refs = addReferenceMetadata(asset.referenceImages || [], {
        id: `ref-${Date.now()}`,
        name: file.name,
        source,
        previewUrl,
        createdAt: new Date().toISOString(),
      });
      update(
        { referenceImages: refs, status: "已完善" },
        source === "local-folder"
          ? "参考图已保存到授权文件夹"
          : "参考图已保存到当前浏览器",
      );
      setUploadOpen(false);
      setFileError("");
    } catch {
      setFileError("上传失败，请重试");
    }
  };
  const drop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    upload(e.dataTransfer.files[0]);
  };
  return (
    <section>
      <div className="asset-tabs">
        {(["角色", "场景", "道具"] as AssetType[]).map((x) => (
          <button
            className={x === type ? "tab active" : "tab"}
            onClick={() => setType(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="asset-layout">
        <div className="asset-list">
          <div className="search">
            <Search size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索素材..."
            />
            <button
              className="square"
              onClick={() => {
                const next = createAsset(project, type);
                commit(next, "已创建资产");
              }}
            >
              <Plus />
            </button>
          </div>
          {list.map((x) => (
            <button
              className={"asset-row " + (asset.id === x.id ? "chosen" : "")}
              onClick={() => setChosen(x.id)}
              key={x.id}
            >
              <div className="avatar" style={{ background: x.color }}>
                {x.name[0]}
              </div>
              <span>
                <b>{x.name}</b>
                <em>
                  {x.status || "待完善"} · {x.referenceImages?.length || 0}{" "}
                  张参考图
                </em>
              </span>
            </button>
          ))}
        </div>
        <div className="asset-detail">
          <div className="detail-top">
            <div className="asset-heading">
              <div className="avatar big" style={{ background: asset.color }}>
                {asset.name[0]}
              </div>
              <h1>{asset.name}</h1>
              <mark className="asset-status">{asset.status || "待完善"}</mark>
            </div>
            <button
              className="danger"
              onClick={() =>
                commit(
                  removeAsset(project, asset.id),
                  "已删除资产并解除镜头绑定",
                )
              }
            >
              <Trash2 size={16} />
              删除
            </button>
          </div>
          <div className="asset-metrics">
            <div>
              <small>制作状态</small>
              <select
                value={asset.status || "待完善"}
                onChange={(e) =>
                  update(
                    { status: e.target.value as Asset["status"] },
                    "资产制作状态已更新",
                  )
                }
              >
                <option>待完善</option>
                <option>已完善</option>
                <option>已完成</option>
              </select>
            </div>
            <div>
              <small>准备度</small>
              <b className={`readiness r${readiness.score}`}>
                {readiness.label}
              </b>
            </div>
            <div>
              <small>关联镜头</small>
              <b>{relatedShots.length}</b>
            </div>
            <div>
              <small>主参考图</small>
              <b>{primary ? "已设置" : "未设置"}</b>
            </div>
          </div>
          <button
            className="asset-image-upload"
            onClick={() => setUploadOpen(true)}
            style={
              primary
                ? { backgroundImage: `url(${primary.previewUrl})` }
                : { background: `linear-gradient(135deg,${asset.color},#222)` }
            }
          >
            <span>
              <Upload size={18} />
              {primary ? "替换参考图" : "上传参考图"}
            </span>
          </button>
          <p className="manual-asset-note">
            准备度自动依据描述和主参考图计算；制作状态可手动标记。悬停主图可上传或替换参考图。
          </p>
          <div className="asset-form">
            <label>
              名称
              <input
                value={asset.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </label>
            <label>
              视觉描述
              <textarea
                value={asset.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </label>
            <label>
              标签
              <input
                value={asset.tags.join(" · ")}
                onChange={(e) =>
                  update({
                    tags: e.target.value
                      .split("·")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
          </div>
          <div className="variant-panel">
            <div className="variant-heading">
              <h3>设计变体 <b>{variants.length}</b></h3>
              <small>基础形象使用主参考图；角色可添加服装、战损、情绪，场景与道具可添加设计版本。</small>
            </div>
            <div className="variant-create">
              <input value={variantName} onChange={(e)=>setVariantName(e.target.value)} placeholder={asset.type==='角色'?'如：战斗造型、受伤状态':'如：雨夜版本、破损版本'} />
              <input value={variantDescription} onChange={(e)=>setVariantDescription(e.target.value)} placeholder="该变体的视觉说明（可选）" />
              <button className="orange" onClick={addVariant}><Plus size={15}/>新增变体</button>
            </div>
            {variants.length===0?<p>尚无额外变体，导演台将使用资产基础形象。</p>:<div className="variant-list">{variants.map(variant=><div className="variant-row" key={variant.id}><div className="variant-thumb" style={{background:asset.color}}>{variant.name[0]}</div><span><b>{variant.name}</b><em>{variant.description||'未填写视觉说明'}</em></span><button className="danger" onClick={()=>commit(removeAssetVariant(project,asset.id,variant.id),'已删除变体，关联镜头已回退基础形象')}>删除</button></div>)}</div>}
          </div>
          <div className="reference-history">
            <h3>参考图历史</h3>
            {(asset.referenceImages || []).length === 0 ? (
              <p>尚未上传参考图。</p>
            ) : (
              (asset.referenceImages || []).map((ref) => (
                <div className="reference-row" key={ref.id}>
                  <img src={ref.previewUrl} />
                  <span>
                    <b>{ref.name}</b>
                    <em>
                      {ref.source === "local-folder"
                        ? "本地资产库"
                        : "仅浏览器保存"}{" "}
                      {ref.isPrimary ? "· 当前主图" : ""}
                    </em>
                  </span>
                  <button
                    className="ghost"
                    onClick={() =>
                      update(
                        {
                          referenceImages: setPrimaryReference(
                            asset.referenceImages || [],
                            ref.id,
                          ),
                        },
                        "已切换主参考图",
                      )
                    }
                  >
                    设为主图
                  </button>
                  <button
                    className="danger"
                    onClick={() =>
                      update(
                        {
                          referenceImages: removeReferenceMetadata(
                            asset.referenceImages || [],
                            ref.id,
                          ),
                        },
                        "已移除网页引用（本地文件仍保留）",
                      )
                    }
                  >
                    移除
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="related">
            <h3>
              关联镜头 <b>{relatedShots.length}</b>
            </h3>
            {relatedShots.length === 0 ? (
              <p>尚未绑定镜头。</p>
            ) : (
              relatedShots.map((s) => {
                const clip = project.clips.find((c) => c.id === s.clipId);
                return (
                  <button key={s.id} onClick={() => goDirector(s.clipId, s.id)}>
                    <span>{clip?.name || "未命名 Clip"}</span>
                    <b>{s.title}</b>
                    <em>
                      {s.size} · {s.duration} 秒
                    </em>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          upload(e.target.files?.[0])
        }
      />
      {uploadOpen && (
        <div className="analysis-modal">
          <div className="analysis-card upload-modal">
            <button className="close" onClick={() => setUploadOpen(false)}>
              <X />
            </button>
            <h2>上传参考图</h2>
            <p>
              首次上传会请求选择 D
              盘的本地资产库。建议选择或新建：D:\SceneWeaver资产库
            </p>
            <div
              className="upload-drop"
              onClick={() => input.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={drop}
            >
              <Upload size={44} />
              <b>将文件拖拽至此或点击上传</b>
              <span>支持 PNG、JPG、WEBP，最大 50MB</span>
            </div>
            {fileError && <p className="import-error">{fileError}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
function Director({
  project,
  commit,
  target,
}: {
  project: Project;
  commit: (p: Project, m?: string) => void;
  target: { clipId: string; shotId: string } | null;
}) {
  const version = project.scriptVersion;
  const clips = project.clips.filter(
    (c) => !version || c.scriptVersionId === version.id,
  );
  const [clipId, setClipId] = useState(clips[0]?.id || "");
  const [openShot, setOpenShot] = useState("");
  useEffect(() => {
    if (target) {
      setClipId(target.clipId);
      setOpenShot(target.shotId);
    }
  }, [target?.clipId, target?.shotId]);
  const active = clips.find((c) => c.id === clipId) || clips[0];
  const shots = project.shots.filter((s) => s.clipId === active?.id);
  const assets = project.assets.filter(
    (a) => !version || a.scriptVersionId === version.id,
  );
  const update = (id: string, patch: Partial<Shot>, msg = "镜头已更新") =>
    commit(patchShot(project, id, patch), msg);
  if (!version?.analysis)
    return (
      <section>
        <h1>导演工作室</h1>
        <p>请先锁定剧本。</p>
      </section>
    );
  const plan = createDirectorPlan(version.analysis, version);
  const addClip = () => {
    const next = createClip(project);
    const added = next.clips[next.clips.length - 1];
    commit(
      {
        ...next,
        clips: next.clips.map((c) =>
          c.id === added.id ? { ...c, scriptVersionId: version.id } : c,
        ),
      },
      "已新增 Clip",
    );
    setClipId(added.id);
  };
  return (
    <section className="director">
      <div className="director-title">
        <div>
          <h1>导演工作室</h1>
          <small>{version.label} · 来源于锁定剧本</small>
        </div>
        {version.sourceMode === "imported" ? (
          <span className="locked-import-note">
            已导入完整导演台；可逐镜编辑并实时同步故事板。
          </span>
        ) : (
          <button
            className="orange"
            onClick={() => {
              const next = applyDirectorPlan(project, plan);
              commit(
                {
                  ...next,
                  scriptVersion: {
                    ...version,
                    polishedScript: plan.polishedScript,
                  },
                },
                "AI 已润色剧本并生成完整导演台",
              );
            }}
          >
            AI 润色并生成导演台
          </button>
        )}
      </div>
      <div className="director-grid">
        <div className="clips">
          <div className="studio-panel-head">
            <h3>剪辑列表</h3>
            <button className="square" onClick={addClip} title="新增 Clip">
              <Plus size={18} />
            </button>
          </div>
          {clips.map((c, index) => (
            <div
              className={c.id === active?.id ? "clip active" : "clip"}
              key={c.id}
            >
              <button
                className="clip-select"
                onClick={() => {
                  setClipId(c.id);
                  setOpenShot("");
                }}
              >
                <b>{index + 1}</b>
                <span>
                  {c.name}
                  <em>{c.summary}</em>
                </span>
              </button>
              {c.id === active?.id && (
                <div className="clip-actions">
                  <input
                    value={c.name}
                    onChange={(e) =>
                      commit(
                        patchClip(project, c.id, { name: e.target.value }),
                        "Clip 已重命名",
                      )
                    }
                  />
                  <input
                    value={c.summary}
                    onChange={(e) =>
                      commit(
                        patchClip(project, c.id, { summary: e.target.value }),
                        "Clip 摘要已更新",
                      )
                    }
                  />
                  <button
                    className="danger"
                    disabled={clips.length < 2}
                    onClick={() => {
                      commit(removeClip(project, c.id), "Clip 及其镜头已删除");
                      setClipId(
                        clips.find((item) => item.id !== c.id)?.id || "",
                      );
                    }}
                  >
                    删除
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="shots">
          <div className="studio-panel-head">
            <h3>
              镜头列表 <span>{shots.length}</span>
            </h3>
            <button
              className="orange"
              onClick={() =>
                active && commit(createShot(project, active.id), "已添加镜头")
              }
            >
              <Plus size={16} />
              添加镜头
            </button>
          </div>
          {shots.map((shot, index) => (
            <ShotCard
              key={shot.id}
              shot={shot}
              index={index}
              open={openShot === shot.id}
              onToggle={() => setOpenShot(openShot === shot.id ? "" : shot.id)}
              project={project}
              assets={assets}
              update={update}
              commit={commit}
              onCopy={() =>
                commit(duplicateShot(project, shot.id), "已复制镜头")
              }
              onMove={(direction) =>
                commit(moveShot(project, shot.id, direction), "镜头顺序已更新")
              }
            />
          ))}
        </div>
        <div className="story">
          <h3>
            故事板 <span>实时</span>
          </h3>
          <div className="board">
            {shots.length ? (
              shots.map((shot) => (
                <div className="frame" key={shot.id}>
                  <div className="frame-img">
                    <span>{shot.size}</span>
                  </div>
                  <b>{shot.title}</b>
                  <small>
                    {shot.cameraMove || "定镜"} · {shot.duration} 秒
                  </small>
                  <small>{shot.action || shot.visual}</small>
                </div>
              ))
            ) : (
              <div className="empty-board">
                选择或新增镜头后，故事板会实时显示。
              </div>
            )}
          </div>
          <div className="video">
            <b>视频预览</b>
            <p>视频 API 尚未接入。当前 Clip 的镜头与故事板数据已准备就绪。</p>
            <button
              className="ghost"
              onClick={() => commit(project, "视频生成已加入待接入队列")}
            >
              生成视频（待接入 API）
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
function ShotCard({
  shot,
  index,
  open,
  onToggle,
  project,
  assets,
  update,
  commit,
  onCopy,
  onMove,
}: {
  shot: Shot;
  index: number;
  open: boolean;
  onToggle: () => void;
  project: Project;
  assets: Asset[];
  update: (id: string, patch: Partial<Shot>, msg?: string) => void;
  commit: (p: Project, m?: string) => void;
  onCopy: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const audioItems = shot.audioItems || [];
  return (
    <article className={"shot " + (open ? "expanded" : "")}>
      <div className="shot-top">
        <mark>#{index + 1}</mark>
        <b>{shot.title}</b>
        <span>
          {shot.size} · {shot.duration} 秒
        </span>
        <button
          className="icon-button"
          onClick={onMove.bind(null, -1)}
          title="上移镜头"
        >
          ↑
        </button>
        <button
          className="icon-button"
          onClick={onMove.bind(null, 1)}
          title="下移镜头"
        >
          ↓
        </button>
        <button className="icon-button" onClick={onCopy} title="复制镜头">
          <Copy size={16} />
        </button>
        <button className="icon-button" onClick={onToggle} title="编辑镜头">
          <Pencil size={17} />
        </button>
        <button
          className="icon-danger"
          onClick={() => commit(removeShot(project, shot.id), "镜头已删除")}
        >
          <Trash2 size={16} />
        </button>
      </div>
      {!open ? (
        <>
          <p className="shot-summary">{shot.visual}</p>
          <small>
            运镜：{shot.cameraMove || "未设置"}　动作：{shot.action || "未设置"}
          </small>
          <p className="shot-audio-summary">
            {audioItems
              .map(
                (x) =>
                  `${x.kind}${x.speaker ? `（${x.speaker}）` : ""}：${x.content}`,
              )
              .join("　") || shot.audio}
          </p>
        </>
      ) : (
        <div className="shot-editor">
          <div className="shot-fields">
            <label>
              景别
              <select
                value={shot.size}
                onChange={(e) => update(shot.id, { size: e.target.value })}
              >
                {[
                  "远景 WS",
                  "全景 LS",
                  "中景 MS",
                  "近景 MCU",
                  "特写 CU",
                  "俯拍",
                  "仰拍",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              时长
              <input
                type="number"
                min="1"
                value={shot.duration}
                onChange={(e) => update(shot.id, { duration: +e.target.value })}
              />
            </label>
          </div>
          <label>
            镜头标题
            <input
              value={shot.title}
              onChange={(e) => update(shot.id, { title: e.target.value })}
            />
          </label>
          <label>
            画面
            <textarea
              value={shot.visual}
              onChange={(e) => update(shot.id, { visual: e.target.value })}
            />
          </label>
          <label>
            运镜
            <input
              value={shot.cameraMove || ""}
              onChange={(e) => update(shot.id, { cameraMove: e.target.value })}
              placeholder="如：缓慢推镜、肩扛跟拍"
            />
          </label>
          <label>
            角色动作
            <input
              value={shot.action || ""}
              onChange={(e) => update(shot.id, { action: e.target.value })}
              placeholder="人物动作与情绪变化"
            />
          </label>
          <div className="audio-editor">
            <b>音频（对白 / 旁白 / 音效 / 环境音 / 音乐）</b>
            {audioItems.map((item) => (
              <div className="audio-row" key={item.id}>
                <select
                  value={item.kind}
                  onChange={(e) =>
                    update(shot.id, {
                      audioItems: audioItems.map((x) =>
                        x.id === item.id
                          ? { ...x, kind: e.target.value as typeof x.kind }
                          : x,
                      ),
                    })
                  }
                >
                  {["环境音", "对白", "旁白", "音效", "环境音", "音乐"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
                <input
                  value={item.content}
                  onChange={(e) =>
                    update(shot.id, {
                      audioItems: audioItems.map((x) =>
                        x.id === item.id
                          ? { ...x, content: e.target.value }
                          : x,
                      ),
                    })
                  }
                />
                <input
                  value={item.speaker || ""}
                  placeholder="说话人 / 角色（可选）"
                  onChange={(e) =>
                    update(shot.id, {
                      audioItems: audioItems.map((x) =>
                        x.id === item.id
                          ? { ...x, speaker: e.target.value }
                          : x,
                      ),
                    })
                  }
                />
                <button
                  className="icon-danger"
                  onClick={() =>
                    commit(
                      removeAudioItem(project, shot.id, item.id),
                      "已删除音频条目",
                    )
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              className="ghost"
              onClick={() =>
                commit(
                  addAudioItem(project, shot.id, {
                    id: `audio-${Date.now()}`,
                    kind: "环境音",
                    content: "补充音频内容",
                  }),
                  "已添加音频条目",
                )
              }
            >
              <Plus size={15} />
              添加音频
            </button>
          </div>
          <div className="asset-bind">
            <MapPin size={16} />
            {assets.map((asset) => (
              <label
                className={shot.assetIds.includes(asset.id) ? "bound" : ""}
                key={asset.id}
              >
                <input
                  type="checkbox"
                  checked={shot.assetIds.includes(asset.id)}
                  onChange={(e) =>
                    commit(
                      e.target.checked
                        ? bindAsset(project, shot.id, asset.id)
                        : unbindAsset(project, shot.id, asset.id),
                      "资产绑定已更新",
                    )
                  }
                />
                {asset.type} · {asset.name}
              </label>
            ))}
          </div>
          <div className="variant-bindings">
            {assets.filter((asset) => shot.assetIds.includes(asset.id)).map((asset) => (
              <label key={asset.id}>
                资产变体 · {asset.name}
                <select value={shot.assetVariantIds?.[asset.id] || ''} onChange={(event) => commit(selectShotAssetVariant(project, shot.id, asset.id, event.target.value || undefined), '镜头资产变体已更新')}>
                  <option value="">基础形象</option>
                  {(asset.variants || []).map((variant) => <option value={variant.id} key={variant.id}>{variant.name}</option>)}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
