import { useState, useEffect, useRef, useCallback } from "react";

const BASE         = import.meta.env.VITE_API_BASE;
const SEEN_KEY     = "runit_stories_seen";
const TUTORIAL_KEY = "runit_stories_tutdone";

function TutorialScreen({ onDone }) {
  var steps = [
    { icon: "👆", title: "Go forward",           desc: "Tap the right side" },
    { icon: "✋", title: "Pause",                 desc: "Press and hold" },
    { icon: "👈", title: "Go back",              desc: "Tap the left side" },
    { icon: "↔️", title: "Move between stories", desc: "Swipe left or right" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 10001, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 8 }}>Navigating Stories</div>
      <div style={{ fontSize: 14, color: "#888", marginBottom: 44, textAlign: "center" }}>Browse story content using these gestures</div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 30, marginBottom: 56 }}>
        {steps.map(function(s) {
          return (
            <div key={s.title} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={onDone} style={{ width: "100%", padding: "16px", borderRadius: 14, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
        Tap to start
      </button>
    </div>
  );
}

function StoryViewer({ groups, startGroupIdx, onClose }) {
  var [groupIdx, setGroupIdx]   = useState(startGroupIdx || 0);
  var [slideIdx, setSlideIdx]   = useState(0);
  var [progress, setProgress]   = useState(0);
  var [paused, setPaused]       = useState(false);
  var timerRef                  = useRef(null);
  var videoRef                  = useRef(null);

  var group  = groups[groupIdx];
  var slide  = group && group.slides[slideIdx];
  var DURATION = slide && slide.type === "video" ? 20000 : 5000;
  var TICK     = 50;

  var goNextSlide = useCallback(function() {
    if (!group) return;
    if (slideIdx < group.slides.length - 1) {
      setSlideIdx(function(i) { return i + 1; });
      setProgress(0);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(function(g) { return g + 1; });
      setSlideIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [group, groupIdx, groups.length, slideIdx, onClose]);

  var goPrevSlide = useCallback(function() {
    if (slideIdx > 0) {
      setSlideIdx(function(i) { return i - 1; });
      setProgress(0);
    } else if (groupIdx > 0) {
      setGroupIdx(function(g) { return g - 1; });
      var prevGroup = groups[groupIdx - 1];
      setSlideIdx(prevGroup ? prevGroup.slides.length - 1 : 0);
      setProgress(0);
    }
  }, [groupIdx, groups, slideIdx]);

  useEffect(function() {
    setProgress(0);
    if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play().catch(function(){}); }
  }, [groupIdx, slideIdx]);

  useEffect(function() {
    if (paused) { clearInterval(timerRef.current); if (videoRef.current) videoRef.current.pause(); return; }
    if (videoRef.current) videoRef.current.play().catch(function(){});
    clearInterval(timerRef.current);
    timerRef.current = setInterval(function() {
      setProgress(function(p) {
        var next = p + (TICK / DURATION) * 100;
        if (next >= 100) { clearInterval(timerRef.current); goNextSlide(); return 100; }
        return next;
      });
    }, TICK);
    return function() { clearInterval(timerRef.current); };
  }, [groupIdx, slideIdx, paused, goNextSlide, DURATION]);

  // Mark group seen
  useEffect(function() {
    if (!group) return;
    var seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
    if (!seen.includes(group.group_id)) {
      seen.push(group.group_id);
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    }
  }, [groupIdx, group]);

  if (!group || !slide) return null;

  var bg = slide.type === "text" ? (slide.bg_color || "#0a1f1c") : "#000";

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: bg, display: "flex", flexDirection: "column", userSelect: "none" }}
      onPointerDown={function() { setPaused(true);  }}
      onPointerUp={function()   { setPaused(false); }}
      onPointerLeave={function(){ setPaused(false); }}
    >
      {/* Progress bars — one per slide in current group */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, display: "flex", gap: 3, padding: "10px 10px 0" }}>
        {group.slides.map(function(s, i) {
          var fill = i < slideIdx ? 100 : i === slideIdx ? progress : 0;
          return (
            <div key={s.id} style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: fill + "%", background: "#fff", borderRadius: 2, transition: "width 0.05s linear" }} />
            </div>
          );
        })}
      </div>

      {/* Group title + close */}
      <div style={{ position: "absolute", top: 22, left: 14, right: 14, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
          {group.group_title || ""}
        </div>
        <button onClick={onClose}
          style={{ background: "rgba(0,0,0,0.35)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
          ×
        </button>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {slide.type === "image" && (
          <img src={slide.url} alt={slide.caption || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        {slide.type === "video" && (
          <video
            ref={videoRef}
            src={slide.url}
            autoPlay muted playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {slide.type === "text" && (
          <div style={{ padding: "40px 28px", textAlign: "center", color: slide.text_color || "#fff", zIndex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}>{slide.content}</div>
          </div>
        )}

        {/* Caption overlay */}
        {slide.caption && slide.type !== "text" && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "60px 20px 24px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))", color: "#fff", fontSize: 14, lineHeight: 1.5, zIndex: 1 }}>
            {slide.caption}
          </div>
        )}
      </div>

      {/* Tap zones */}
      <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 1 }}>
        <div style={{ width: "30%", height: "100%", cursor: "pointer" }} onClick={function(e) { e.stopPropagation(); goPrevSlide(); }} />
        <div style={{ flex: 1, height: "100%",      cursor: "pointer" }} onClick={function(e) { e.stopPropagation(); goNextSlide(); }} />
      </div>

      {/* Group dots (if multiple groups) */}
      {groups.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6, zIndex: 2 }}>
          {groups.map(function(g, i) {
            return (
              <div key={g.group_id} style={{ width: i === groupIdx ? 18 : 6, height: 6, borderRadius: 3, background: i === groupIdx ? "#fff" : "rgba(255,255,255,0.4)", transition: "width 0.2s" }} />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Video thumbnail bubble — renders a video frame using canvas
function VideoBubble({ src, style }) {
  var canvasRef = useRef(null);
  var [ready, setReady] = useState(false);

  useEffect(function() {
    if (!src) return;
    var video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 1;
    video.addEventListener("seeked", function() {
      var canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = 80;
      canvas.height = 80;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 80, 80);
      setReady(true);
    });
    video.addEventListener("error", function() { setReady(false); });
    video.load();
  }, [src]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: ready ? "block" : "none" }} />
      {!ready && (
        <div style={{ width: "100%", height: "100%", background: "#1a1a2e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22 }}>🎬</span>
        </div>
      )}
      {/* Play overlay */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, color: "#fff", marginLeft: 2 }}>▶</span>
        </div>
      </div>
    </div>
  );
}

export default function Stories() {
  var [groups, setGroups]       = useState([]);
  var [viewing, setViewing]     = useState(false);
  var [startIdx, setStartIdx]   = useState(0);
  var [showTutorial, setTutorial] = useState(false);

  useEffect(function() {
    fetch(BASE + '/api/stories/list.php')
      .then(function(r) { return r.json(); })
      .then(function(d) { setGroups(d.groups || []); })
      .catch(function() {});
  }, []);

  var openGroup = function(idx) {
    setStartIdx(idx);
    var tutDone = localStorage.getItem(TUTORIAL_KEY);
    if (!tutDone) { setTutorial(true); } else { setViewing(true); }
  };

  var startFromTutorial = function() {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setTutorial(false);
    setViewing(true);
  };

  if (groups.length === 0) return null;

  var seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");

  return (
    <>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "6px 16px 10px", scrollbarWidth: "none" }}>
        {groups.map(function(group, i) {
          var isSeen = seen.includes(group.group_id);
          var cover  = group.cover;

          // What to show in the bubble
          var bubbleContent = null;
          if (cover.type === "image" && cover.url) {
            bubbleContent = <img src={cover.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />;
          } else if (cover.type === "video") {
            var thumbSrc = cover.thumbnail_url || cover.url;
            bubbleContent = <VideoBubble src={thumbSrc} />;
          } else {
            // text slide
            bubbleContent = (
              <div style={{ width: "100%", height: "100%", background: cover.bg_color || "#0a1f1c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: cover.text_color || "#fff", fontSize: 18, fontWeight: 700 }}>T</span>
              </div>
            );
          }

          var slideCount = group.slides.length;

          return (
            <div key={group.group_id} onClick={function() { openGroup(i); }}
              style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <div style={{ position: "relative" }}>
                {/* Ring */}
                <div style={{ width: 66, height: 66, borderRadius: "50%", padding: 3, background: isSeen ? "#444" : "linear-gradient(135deg, #00c9a7, #0af)", boxSizing: "border-box" }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--runit-bg, #0a1f1c)" }}>
                    {bubbleContent}
                  </div>
                </div>
                {/* Slide count badge */}
                {slideCount > 1 && (
                  <div style={{ position: "absolute", bottom: 0, right: 0, background: "var(--runit-accent, #00c9a7)", color: "#0a1f1c", fontSize: 9, fontWeight: 800, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--runit-bg, #0a1f1c)" }}>
                    {slideCount}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 10, color: isSeen ? "#666" : "var(--runit-muted, #aaa)", maxWidth: 66, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {(group.group_title || "Story").slice(0, 10)}
              </span>
            </div>
          );
        })}
      </div>

      {showTutorial && <TutorialScreen onDone={startFromTutorial} />}
      {viewing && <StoryViewer groups={groups} startGroupIdx={startIdx} onClose={function() { setViewing(false); }} />}
    </>
  );
}