import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import UploadAccessModal from "../auth/UploadAccessModal";
import { PHOTO_UPLOAD_CONFIG } from "@local/shared";

export default function HeroSection() {
  const navigate = useNavigate();
  const { hasBetaAccess, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleUploadClick = () => {
    // Check if user needs authentication (either beta access or Google OAuth)
    if (!hasBetaAccess || !isAuthenticated) {
      setShowUploadModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Validate file count
    if (files.length > PHOTO_UPLOAD_CONFIG.MAX_PHOTOS) {
      alert(`Maximum ${PHOTO_UPLOAD_CONFIG.MAX_PHOTOS} photos allowed. Please select fewer photos.`);
      return;
    }
    
    // Convert FileList to Array for navigation state
    const filesArray = Array.from(files);
    navigate("/create", { 
      state: { 
        initialFiles: filesArray,
        source: 'hero-section'
      } 
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!isAuthenticated) {
      setShowUploadModal(true);
      return;
    }

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Validate file count
    if (files.length > PHOTO_UPLOAD_CONFIG.MAX_PHOTOS) {
      alert(`Maximum ${PHOTO_UPLOAD_CONFIG.MAX_PHOTOS} photos allowed. Please select fewer photos.`);
      return;
    }
    
    // Convert FileList to Array for navigation state
    const filesArray = Array.from(files);
    navigate("/create", { 
      state: { 
        initialFiles: filesArray,
        source: 'hero-section-drag'
      } 
    });
  };



  const handleStartLearning = () => {
    // Navigate to dashboard - AccessGuard will handle beta key validation
    navigate('/dashboard');
  };

  const handleExploreDisciplines = () => {
    document.getElementById("disciplines-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: "var(--bg)" }}
      aria-label="Tutor hero section"
    >
      {/* Background: subtle gradient with academic feel */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full" 
          style={{ 
            background: "linear-gradient(135deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 95%, var(--primary)) 100%)"
          }} 
        />
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, var(--primary) 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, var(--warn) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px, 80px 80px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center py-12 sm:py-20">
        <div className="text-center max-w-6xl px-4 sm:px-6">
          {/* Headline with modern sans-serif typography */}
          <h1
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 sm:mb-8"
            style={{
              color: "var(--text)",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Interactive Learning
            <br />
            <span style={{ color: "var(--primary)" }}>Reimagined</span>
          </h1>

          {/* Subhead with modern styling */}
          <p
            className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-12 max-w-4xl mx-auto"
            style={{ 
              color: "var(--muted-text)",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400
            }}
          >
            University-level modules with visual explanations, practice problems, and thoughtful feedback.
            <br />
            <span style={{ color: "var(--warn)", fontWeight: 500 }}>50+ disciplines</span> • 
            <span style={{ color: "var(--primary)", fontWeight: 500 }}> Interactive simulations</span> • 
            <span style={{ color: "var(--ok)", fontWeight: 500 }}> Real-time feedback</span>
          </p>

          {/* Upload panel - redesigned for better visual appeal */}
          <div
            className="mx-auto max-w-3xl rounded-2xl border-2 overflow-hidden text-left mb-8 sm:mb-12 shadow-lg"
            style={{ 
              borderColor: "var(--border)", 
              background: "var(--surface)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            {/* Header with better styling */}
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b"
              style={{ 
                borderColor: "var(--border)",
                background: "linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--surface) 95%, var(--primary)) 100%)"
              }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: "#ff5f57" }} />
                  <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: "#ffbd2e" }} />
                  <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: "#28ca42" }} />
                </div>
                <div className="text-xs sm:text-sm font-semibold ml-2 sm:ml-3" style={{ color: "var(--text)" }}>
                  Add Your Course Materials
                </div>
              </div>
              <div className="text-xs px-2 sm:px-3 py-1 rounded-full" style={{ 
                background: "color-mix(in srgb, var(--warn) 15%, transparent)",
                color: "var(--warn)"
              }}>
                Optional
              </div>
            </div>

            {/* Body with improved design */}
            <div className="p-4 sm:p-8">
              <div
                className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-12 transition-all duration-300 cursor-pointer group"
                style={{ 
                  borderColor: isDragOver ? "var(--primary)" : "var(--border)", 
                  background: isDragOver 
                    ? "color-mix(in srgb, var(--primary) 8%, var(--bg))" 
                    : "linear-gradient(135deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 95%, var(--primary)) 100%)"
                }}
                onClick={handleUploadClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleUploadClick();
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Choose files to add course materials"
              >
                {/* Upload icon */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-full transition-all duration-300 group-hover:scale-110" style={{ 
                  background: "color-mix(in srgb, var(--primary) 10%, transparent)"
                }}>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <div className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3" style={{ color: "var(--text)" }}>
                  {isDragOver ? "Drop files here" : "Drag & drop your files"}
                </div>
                <div className="text-sm sm:text-base mb-4 sm:mb-6" style={{ color: "var(--muted-text)" }}>
                  {isDragOver ? "Release to upload" : "or click to select JPG, PNG, or PDF files"}
                </div>
                
                <button
                  className="px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    background: "var(--primary)", 
                    color: "var(--on-primary)",
                    boxShadow: "0 4px 14px 0 rgba(21, 71, 52, 0.3)"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadClick();
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--primary-600)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px 0 rgba(21, 71, 52, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--primary)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px 0 rgba(21, 71, 52, 0.3)";
                  }}
                >
                  Upload Lecture Photos
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={PHOTO_UPLOAD_CONFIG.ACCEPTED_TYPES}
                  className="hidden"
                  onChange={handleFilesSelected}
                />
                
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm" style={{ color: "var(--muted-text)" }}>
                  You'll review before generating modules
                </div>
              </div>

              {/* Feature highlights with academic design */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[
                  { 
                    title: "Visual Learning", 
                    desc: "Clear diagrams and figures aligned to concepts" 
                  },
                  { 
                    title: "Practice & Feedback", 
                    desc: "Contextual exercises with constructive guidance" 
                  },
                  { 
                    title: "Assessment Ready", 
                    desc: "Rubrics, reporting, and export options" 
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-lg border transition-all duration-300 hover:shadow-sm"
                    style={{ 
                      borderColor: "var(--border)", 
                      background: "var(--surface)",
                      borderWidth: "1px"
                    }}
                  >
                    <div className="text-sm font-semibold mb-2" style={{ 
                      color: "var(--text)",
                      fontFamily: "'Georgia', 'Times New Roman', 'Times', serif"
                    }}>
                      {item.title}
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: "var(--muted-text)" }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Primary actions with improved design */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16">
            <button
              onClick={handleStartLearning}
              className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
              style={{ 
                background: "var(--warn)", 
                color: "var(--on-primary)",
                boxShadow: "0 8px 25px 0 rgba(253, 187, 48, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--primary)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 35px 0 rgba(21, 71, 52, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--warn)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 25px 0 rgba(253, 187, 48, 0.3)";
              }}
            >
              Start Learning Now
            </button>
            
            <button
              onClick={handleExploreDisciplines}
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl border-2 transition-all duration-300 transform hover:scale-105"
              style={{ 
                color: "var(--text)", 
                borderColor: "var(--border)", 
                background: "var(--surface)",
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--primary)";
                e.currentTarget.style.color = "var(--on-primary)";
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px 0 rgba(21, 71, 52, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px 0 rgba(0, 0, 0, 0.1)";
              }}
            >
              Explore Disciplines
            </button>
          </div>

          {/* Enhanced scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center group cursor-pointer" onClick={handleExploreDisciplines}>
              <div className="relative">
                <div
                  className="w-8 h-12 border-2 rounded-full flex justify-center relative overflow-hidden"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="w-1.5 h-4 rounded-full mt-2 animate-bounce"
                    style={{ background: "var(--primary)" }}
                  />
                </div>
                {/* Animated scroll indicator */}
                <div className="absolute inset-0 flex justify-center">
                  <div className="w-0.5 h-6 mt-1 opacity-30" style={{ background: "var(--primary)" }}>
                    <div className="w-full h-2 animate-pulse" style={{ background: "var(--primary)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Access Modal */}
      <UploadAccessModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </section>
  );
}
