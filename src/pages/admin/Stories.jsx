import { useState, useEffect } from "react";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import Spinner from "../../components/Spinner";

const BASE   = import.meta.env.VITE_API_BASE;
const COLORS = ["#0a1f1c","#1a1a2e","#16213e","#0f3460","#533483","#e94560","#f5a623","#2ecc71","#1abc9c","#3498db"];

export default function AdminStories() {
  var [stories, setStories]         = useState([]);
  var [loading, setLoading]         = useState(true);
  var [tab, setTab]                 = useState("list");

  // New slide form
  var [slideType, setSlideType]     = useState("image");
  var [caption, setCaption]         = useState("");
  var [textContent, setTextContent] = useState("");
  var [bgColor, setBgColor]         = useState("#0a1f1c");
  var [textColor, setTextColor]     = useState("#ffffff");
  var [duration, setDuration]       = useState(1);
  var [file, setFile]               = useState(null);
  var [thumbFile, setThumbFile]     = useState(null);
  var [preview, setPreview]         = useState(null);
  var [thumbPreview, setThumbPreview] = useState(null);
  var [posting, setPosting]         = useState(false);
  var [msg, setMsg]                 = useState("");
  var [msgType, setMsgType]         = useState("success");

  // Group management
  var [groupMode, setGroupMode]     = useState("new");   // "new" | "existing"
  var [groupTitle, setGroupTitle]   = useState("");
  var [selectedGroup, setSelectedGroup] = useState("");
  var [sortOrder, setSortOrder]     = useState(0);

  useEffect(function() { fetchStories(); }, []);

  var fetchStories = async function() {
    setLoading(true);
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(BASE + '/api/admin/stories.php', { headers: { Authorization: "Bearer " + token } });
      var data  = await res.json();
      if (res.ok) setStories(data.stories || []);
    } catch {}
    setLoading(false);
  };

  var showMsg = function(text, t) {
    setMsg(text); setMsgType(t || "success");
    setTimeout(function() { setMsg(""); }, 4000);
  };

  var handleFile = function(e) {
    var f = e.target.files[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  var handleThumb = function(e) {
    var f = e.target.files[0]; if (!f) return;
    setThumbFile(f); setThumbPreview(URL.createObjectURL(f));
  };

  var postSlide = async function() {
    if (slideType !== "text" && !file)       { showMsg("Please select a file", "error"); return; }
    if (slideType === "text" && !textContent){ showMsg("Enter text content", "error"); return; }
    if (groupMode === "new" && !groupTitle)  { showMsg("Enter a story group title", "error"); return; }
    setPosting(true);
    try {
      var token = localStorage.getItem("runit_token");
      var fd    = new FormData();
      fd.append("type",          slideType);
      fd.append("caption",       caption);
      fd.append("bg_color",      bgColor);
      fd.append("text_color",    textColor);
      fd.append("duration_days", String(duration));
      fd.append("text_content",  textContent);
      fd.append("group_id",      groupMode === "existing" ? selectedGroup : "");
      fd.append("group_title",   groupMode === "new" ? groupTitle : "");
      fd.append("sort_order",    String(sortOrder));
      if (file) fd.append(slideType === "video" ? "video" : "image", file);
      if (thumbFile) fd.append("thumbnail", thumbFile);

      var res  = await fetch(BASE + '/api/admin/stories.php', {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: fd,
      });
      var data = await res.json();
      if (res.ok) {
        showMsg("Slide added!", "success");
        setCaption(""); setTextContent(""); setFile(null); setPreview(null);
        setThumbFile(null); setThumbPreview(null); setSortOrder(0);
        if (groupMode === "new") { setGroupTitle(""); setGroupMode("new"); }
        setTab("list"); fetchStories();
      } else { showMsg(data.error || "Failed", "error"); }
    } catch { showMsg("Connection error", "error"); }
    setPosting(false);
  };

  var deleteStory = async function(id) {
    if (!window.confirm("Delete this slide?")) return;
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(BASE + '/api/admin/stories.php', {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ id: id }),
      });
      var data = await res.json();
      if (res.ok) { showMsg("Deleted", "success"); fetchStories(); }
      else showMsg(data.error || "Failed", "error");
    } catch { showMsg("Connection error", "error"); }
  };

  var deleteGroup = async function(gid) {
    if (!window.confirm("Delete all slides in this story group?")) return;
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(BASE + '/api/admin/stories.php', {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ group_id: gid }),
      });
      var data = await res.json();
      if (res.ok) { showMsg("Group deleted", "success"); fetchStories(); }
      else showMsg(data.error || "Failed", "error");
    } catch { showMsg("Connection error", "error"); }
  };

  // Build groups from flat list
  var groups = {};
  stories.forEach(function(s) {
    var gid = s.group_id || ("solo_" + s.id);
    if (!groups[gid]) groups[gid] = { group_id: gid, group_title: s.group_title, slides: [], is_active: 0 };
    groups[gid].slides.push(s);
    if (parseInt(s.is_active)) groups[gid].is_active = 1;
  });
  var groupList    = Object.values(groups);
  var activeGroups = groupList.filter(function(g) { return g.is_active; });
  var existingGroupOptions = groupList.filter(function(g) { return g.is_active; });

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Stories" subtitle={activeGroups.length + " active groups"} />
      <div className="page-content">

        {msg !== "" && (
          <div style={{ background: msgType === "error" ? "rgba(255,80,80,0.08)" : "rgba(0,201,167,0.1)", border: "1px solid " + (msgType === "error" ? "rgba(255,80,80,0.25)" : "var(--runit-border-strong)"), borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: msgType === "error" ? "#ff8080" : "var(--runit-accent)", fontSize: 13, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ key: "list", label: "📋 Stories" }, { key: "new", label: "＋ Add Slide" }].map(function(t) {
            var active = tab === t.key;
            return (
              <button key={t.key} onClick={function() { setTab(t.key); }}
                style={{ flex: 1, padding: "10px", borderRadius: 50, border: "1px solid", borderColor: active ? "var(--runit-accent)" : "var(--runit-border)", background: active ? "rgba(0,201,167,0.12)" : "transparent", color: active ? "var(--runit-accent)" : "var(--runit-muted)", fontWeight: active ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── LIST ── */}
        {tab === "list" && (
          <div>
            {loading && <Spinner />}
            {!loading && groupList.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--runit-muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📸</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No stories yet</div>
                <div style={{ fontSize: 13 }}>Add slides to create story groups</div>
              </div>
            )}
            {groupList.map(function(g) {
              return (
                <div key={g.group_id} style={{ background: "var(--runit-surface)", border: "1px solid " + (g.is_active ? "rgba(0,201,167,0.2)" : "var(--runit-border)"), borderRadius: 18, marginBottom: 14, overflow: "hidden", opacity: g.is_active ? 1 : 0.6 }}>
                  <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--runit-border)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{g.group_title || "Unnamed group"}</div>
                      <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>{g.slides.length + " slide" + (g.slides.length !== 1 ? "s" : "")}</div>
                    </div>
                    <button onClick={function() { deleteGroup(g.group_id); }}
                      style={{ padding: "6px 12px", borderRadius: 50, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff8080", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                      Delete group
                    </button>
                  </div>
                  {g.slides.map(function(s) {
                    return (
                      <div key={s.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 16px", borderBottom: "1px solid var(--runit-border)" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: s.bg_color || "#0a1f1c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {s.type === "image" && s.url && <img src={s.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          {s.type === "video" && (s.thumbnail_url
                            ? <img src={s.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: 18 }}>🎥</span>)}
                          {s.type === "text" && <span style={{ color: s.text_color || "#fff", fontSize: 14, fontWeight: 700 }}>T</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 1 }}>{s.type.charAt(0).toUpperCase() + s.type.slice(1)}</div>
                          {s.caption && <div style={{ fontSize: 11, color: "var(--runit-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.caption}</div>}
                          <div style={{ fontSize: 10, color: "var(--runit-accent)" }}>{"Expires " + new Date(s.expires_at).toLocaleDateString("en-GH")}</div>
                        </div>
                        <button onClick={function() { deleteStory(s.id); }}
                          style={{ padding: "5px 10px", borderRadius: 50, background: "transparent", border: "1px solid rgba(255,80,80,0.2)", color: "#ff8080", fontSize: 10, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ── ADD SLIDE ── */}
        {tab === "new" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Group */}
            <div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 10, fontWeight: 600 }}>Story group</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {["new","existing"].map(function(m) {
                  var sel = groupMode === m;
                  return (
                    <button key={m} onClick={function() { setGroupMode(m); }}
                      style={{ flex: 1, padding: "10px", borderRadius: 50, border: "1px solid", borderColor: sel ? "var(--runit-accent)" : "var(--runit-border)", background: sel ? "rgba(0,201,167,0.1)" : "transparent", color: sel ? "var(--runit-accent)" : "var(--runit-muted)", fontWeight: sel ? 700 : 400, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      {m === "new" ? "New group" : "Add to existing"}
                    </button>
                  );
                })}
              </div>
              {groupMode === "new" && (
                <input type="text" value={groupTitle} onChange={function(e) { setGroupTitle(e.target.value); }} placeholder="Group title — e.g. Weekend Promo, New Feature"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
              )}
              {groupMode === "existing" && (
                <select value={selectedGroup} onChange={function(e) { setSelectedGroup(e.target.value); }}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                  <option value="">Select a group…</option>
                  {existingGroupOptions.map(function(g) {
                    return <option key={g.group_id} value={g.group_id}>{g.group_title || g.group_id}</option>;
                  })}
                </select>
              )}
            </div>

            {/* Slide type */}
            <div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 10, fontWeight: 600 }}>Slide type</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["image","video","text"].map(function(t) {
                  var icons = { image: "🖼", video: "🎥", text: "✏️" };
                  var sel   = slideType === t;
                  return (
                    <button key={t} onClick={function() { setSlideType(t); setFile(null); setPreview(null); }}
                      style={{ flex: 1, padding: "12px 4px", borderRadius: 14, border: "1px solid", borderColor: sel ? "var(--runit-accent)" : "var(--runit-border)", background: sel ? "rgba(0,201,167,0.1)" : "var(--runit-elevated)", color: sel ? "var(--runit-accent)" : "var(--runit-muted)", fontSize: 12, fontWeight: sel ? 700 : 400, cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 22 }}>{icons[t]}</span>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image upload */}
            {slideType === "image" && (
              <label style={{ display: "block", border: "2px dashed var(--runit-border)", borderRadius: 16, overflow: "hidden", cursor: "pointer", background: "var(--runit-elevated)", minHeight: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {preview ? <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
                  : <div style={{ textAlign: "center", padding: 24 }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🖼</div>
                      <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>Tap to choose image (max 10MB)</div>
                    </div>}
                <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
              </label>
            )}

            {/* Video upload */}
            {slideType === "video" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "block", border: "2px dashed var(--runit-border)", borderRadius: 16, overflow: "hidden", cursor: "pointer", background: "var(--runit-elevated)", minHeight: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {preview ? <video src={preview} controls style={{ width: "100%", maxHeight: 220, display: "block" }} />
                    : <div style={{ textAlign: "center", padding: 24 }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🎥</div>
                        <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>Tap to choose video (max 100MB)</div>
                      </div>}
                  <input type="file" accept="video/*" onChange={handleFile} style={{ display: "none" }} />
                </label>

                {/* Optional manual thumbnail */}
                <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 4 }}>
                  Custom thumbnail (optional — auto-generated if ffmpeg is available on server)
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", cursor: "pointer" }}>
                  {thumbPreview
                    ? <img src={thumbPreview} alt="thumb" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                    : <span style={{ fontSize: 24 }}>🖼</span>}
                  <span style={{ fontSize: 12, color: "var(--runit-muted)" }}>{thumbPreview ? "Thumbnail selected" : "Upload thumbnail image"}</span>
                  <input type="file" accept="image/*" onChange={handleThumb} style={{ display: "none" }} />
                </label>
              </div>
            )}

            {/* Text */}
            {slideType === "text" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <textarea rows={4} value={textContent} onChange={function(e) { setTextContent(e.target.value); }} placeholder="What do you want to say?"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 15, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 6 }}>Background</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {COLORS.map(function(c) {
                        return <div key={c} onClick={function() { setBgColor(c); }} style={{ width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer", border: bgColor === c ? "3px solid var(--runit-accent)" : "3px solid transparent", boxSizing: "border-box" }} />;
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 6 }}>Text color</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {["#ffffff","#000000","#00c9a7","#ffb400","#ff8080"].map(function(c) {
                        return <div key={c} onClick={function() { setTextColor(c); }} style={{ width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer", border: textColor === c ? "3px solid var(--runit-accent)" : "3px solid #444", boxSizing: "border-box" }} />;
                      })}
                    </div>
                  </div>
                </div>
                {textContent && (
                  <div style={{ borderRadius: 14, padding: "20px 16px", background: bgColor, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: textColor, lineHeight: 1.4 }}>{textContent}</div>
                  </div>
                )}
              </div>
            )}

            {/* Caption */}
            <div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 8, fontWeight: 600 }}>Caption (optional)</div>
              <input type="text" value={caption} onChange={function(e) { setCaption(e.target.value); }} maxLength={120} placeholder="Short caption for this slide"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            </div>

            {/* Sort order */}
            <div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 8, fontWeight: 600 }}>Slide order (position in group)</div>
              <input type="number" min="0" value={sortOrder} onChange={function(e) { setSortOrder(parseInt(e.target.value) || 0); }}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
              <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 4 }}>0 = first, 1 = second, etc.</div>
            </div>

            {/* Duration */}
            <div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 10, fontWeight: 600 }}>Visible for</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1,2,3,4,5,6,7].map(function(d) {
                  var sel = duration === d;
                  return (
                    <button key={d} onClick={function() { setDuration(d); }}
                      style={{ padding: "8px 16px", borderRadius: 50, border: "1px solid", borderColor: sel ? "var(--runit-accent)" : "var(--runit-border)", background: sel ? "rgba(0,201,167,0.12)" : "transparent", color: sel ? "var(--runit-accent)" : "var(--runit-muted)", fontWeight: sel ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      {d + "d"}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={postSlide} disabled={posting}
              style={{ width: "100%", padding: "14px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 15, border: "none", cursor: posting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {posting ? "Adding slide..." : "Add Slide to Story"}
            </button>
          </div>
        )}
      </div>
      <BottomPillNav />
    </div>
  );
}