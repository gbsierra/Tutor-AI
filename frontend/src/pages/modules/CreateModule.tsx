// frontend/src/pages/CreateModule.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { TModuleSpec, TLessonSpec, TExerciseSpec, TGenerationContext } from "@shared/module";
import { ImageService } from "../../services/imageService";
import { ModuleService } from "../../services/moduleService";
import type { LocalImage } from "@shared/types";
import { useAuth } from "../../contexts/AuthContext";
import { usePhotoUpload } from "../../hooks/usePhotoUpload";
import PhotoUploadFAQ from "../../components/common/PhotoUploadFAQ";

type Step = 'upload' | 'edit' | 'summary';

// Navigation state interface for passing files from hero section
interface NavigationState {
  initialFiles?: File[];
  source?: string;
}

// Summary Step Component
function SummaryStep({ 
  publishedModule, 
  newlyAddedLessons,
  newlyAddedExercises,
  onReset, 
  onViewModule 
}: { 
  publishedModule: TModuleSpec; 
  newlyAddedLessons: number;
  newlyAddedExercises: number;
  onReset: () => void; 
  onViewModule: () => void; 
}) {

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {/* Success Header */}
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" 
             style={{ backgroundColor: 'var(--ok)', color: 'var(--on-primary)' }}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
          Module Published Successfully
        </h1>
        <p className="text-lg" style={{ color: 'var(--muted-text)' }}>
          Your content has been processed and is now available for learning.
        </p>
      </div>

      {/* Module Summary */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
          {publishedModule.title}
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium" style={{ color: 'var(--muted-text)' }}>Discipline:</span>
            <p style={{ color: 'var(--text)' }}>{publishedModule.discipline}</p>
          </div>
          <div>
            <span className="font-medium" style={{ color: 'var(--muted-text)' }}>Module ID:</span>
            <p className="font-mono" style={{ color: 'var(--text)' }}>{publishedModule.slug}</p>
          </div>
          <div>
            <span className="font-medium" style={{ color: 'var(--muted-text)' }}>New Lessons:</span>
            <p style={{ color: 'var(--text)' }}>{newlyAddedLessons}</p>
          </div>
          <div>
            <span className="font-medium" style={{ color: 'var(--muted-text)' }}>New Exercises:</span>
            <p style={{ color: 'var(--text)' }}>{newlyAddedExercises}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onViewModule}
          className="flex-1 sm:flex-none rounded-lg px-8 py-3 text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--ok)', color: 'var(--on-primary)' }}
        >
          View Module
        </button>
        <button
          onClick={onReset}
          className="flex-1 sm:flex-none rounded-lg border px-8 py-3 text-sm font-medium transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
        >
          Upload More Lecture Photos
        </button>
      </div>
    </div>
  );
}

export default function CreateModulePage() {
  const { disciplineId } = useParams<{ disciplineId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Check for initial files from navigation state
  const navigationState = location.state as NavigationState | null;
  const initialFiles = navigationState?.initialFiles;

  // Upload step state - using the new hook
  const {
    images,
    isDragOver,
    msg: uploadMsg,
    onPickFiles,
    removeImage,
    setImages,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    acceptedTypes
  } = usePhotoUpload();

  // Edit step state
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [moduleDraft, setModuleDraft] = useState<TModuleSpec | null>(null);
  const [generationContext, setGenerationContext] = useState<TGenerationContext | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [existingModule, setExistingModule] = useState<TModuleSpec | null>(null);
  const [, setMergedModule] = useState<TModuleSpec | null>(null);
  const [publishedModule, setPublishedModule] = useState<TModuleSpec | null>(null);
  const [disciplineSelection, setDisciplineSelection] = useState<any>(null);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>('');
  const [showAlternatives, setShowAlternatives] = useState<boolean>(false);

  // Form state - removed optional text inputs, only photos needed

  // UI state
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  
  // Combine upload and general messages
  const displayMsg = uploadMsg || msg;
  
  // Track if initial files have been processed to prevent duplicates
  const initialFilesProcessed = useRef(false);

  // Process initial files from hero section on mount
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0 && !initialFilesProcessed.current) {
      console.log('Processing initial files from hero section:', initialFiles.length, 'files');
      console.log('Source:', navigationState?.source);
      
      // Mark as processed to prevent duplicate processing
      initialFilesProcessed.current = true;
      
      // Create a mock FileList-like object for onPickFiles
      const mockFileList = {
        length: initialFiles.length,
        item: (index: number) => initialFiles[index] || null,
        [Symbol.iterator]: function* () {
          for (const file of initialFiles) {
            yield file;
          }
        }
      } as FileList;
      
      onPickFiles(mockFileList);
    }
  }, [initialFiles]); // Only depend on initialFiles

  // Upload functions are now handled by the usePhotoUpload hook



  // HEIC conversion is now handled by the usePhotoUpload hook





  async function fetchExistingModule(slug: string) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/modules/${slug}`);
      if (response.ok) {
        const existingModule = await response.json();
        setExistingModule(existingModule);
        console.log('Fetched existing module:', existingModule);
      } else {
        console.warn('Failed to fetch existing module:', slug);
        setExistingModule(null);
      }
    } catch (error) {
      console.error('Error fetching existing module:', error);
      setExistingModule(null);
    }
  }

  async function handleBuildDraft() {
    setLoading(true);
    setMsg(null);
    try {
      // Ensure base64 for all images - process in parallel for better performance
      const base64Promises = images.map(async (img) => {
        let base64 = img.base64;

        // If no base64, try to generate from converted file
        if (!base64) {
          try {
            base64 = await ImageService.blobToBase64(img.convertedFile);
            console.log('Generated base64 for', img.file.name, 'length:', base64.length);
          } catch (error) {
            console.warn('Failed to generate base64 for', img.file.name, ':', error);
            // Return null to skip this image if we can't generate base64
            return null;
          }
        }

        return { ...img, base64 };
      });

      const results = await Promise.all(base64Promises);
      const enriched = results.filter((img): img is LocalImage => img !== null);
      setImages(enriched);

      // Use ModuleService for API call
      console.log(`🔍 [CreateModule] Building draft with disciplineId:`, disciplineId);
      console.log(`🔍 [CreateModule] Image count:`, enriched.length);
      console.log(`🔍 [CreateModule] User authenticated:`, isAuthenticated, user?.id);
      const result = await ModuleService.buildDraft(enriched, "", "", "", "", disciplineId, user?.id);

      console.log(`🔍 [CreateModule] LLM response:`, {
        consolidation: result.module.consolidation,
        slug: result.module.slug,
        title: result.module.title,
        disciplineSelection: result.module.disciplineSelection
      });
      
      setModuleDraft(result.module);
      setGenerationContext(result.generationContext);
      
      // Check if LLM suggested a different discipline than the route discipline
      if (result.module.disciplineSelection) {
        const llmDisciplineId = result.module.disciplineSelection.selectedDisciplineId;
        
        // If we came from a discipline route and LLM chose differently, show validation
        if (disciplineId && disciplineId !== llmDisciplineId) {
          console.log(`🔍 [CreateModule] Discipline mismatch: Route=${disciplineId}, LLM=${llmDisciplineId}`);
          setDisciplineSelection(result.module.disciplineSelection);
          setSelectedDisciplineId(llmDisciplineId);
          setShowAlternatives(true);
          setMsg(`AI suggested a different discipline than expected. Please review and choose below.`);
        } else {
          // No mismatch or no route discipline - proceed normally
          setDisciplineSelection(result.module.disciplineSelection);
          setSelectedDisciplineId(llmDisciplineId);
          setShowAlternatives(false);
          setMsg(`AI analyzed your photos and suggested a discipline. You can review and publish below.`);
        }
      } else {
        setDisciplineSelection(null);
        setMsg(`Module generated! You can now review and publish it.`);
      }
      
      // Proceed to edit step
      if (result.module.consolidation?.action === 'append-to' && result.module.consolidation.targetModuleSlug) {
        console.log(`🔍 [CreateModule] LLM chose to append to:`, result.module.consolidation.targetModuleSlug);
        await fetchExistingModule(result.module.consolidation.targetModuleSlug);
        // Clear merged module when starting fresh
        setMergedModule(null);
      } else {
        console.log(`🔍 [CreateModule] LLM chose to create new module`);
        setExistingModule(null);
        setMergedModule(null);
      }
      
      setCurrentStep('edit');
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      setMsg(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    setLoading(true);
    setMsg(null);
    try {
      console.log(`[CreateModule] Publishing module with disciplineId: ${disciplineId}`);
      console.log(`[CreateModule] Selected discipline from UI: ${selectedDisciplineId}`);

      // Use selected discipline from discipline selection if available, otherwise use disciplineId from URL
      const finalDisciplineId = selectedDisciplineId || disciplineId;
      
      // Add discipline to module spec
      const moduleToPublish = finalDisciplineId
        ? { ...moduleDraft!, discipline: finalDisciplineId }
        : moduleDraft!;

      console.log(`[CreateModule] Module to publish:`, {
        title: moduleToPublish.title,
        discipline: moduleToPublish.discipline,
        draft: moduleToPublish.draft
      });

      // Prepare photos for attribution if user is authenticated
      const photosForAttribution = isAuthenticated && user ? images.map(img => ({
        filename: img.file.name,
        mimeType: img.mimeType,
        base64: img.base64
      })) : undefined;

      const publishedModuleResult = await ModuleService.publishModule(
        moduleToPublish, 
        generationContext || undefined,
        user?.id,
        photosForAttribution
      );
      console.log(`[CreateModule] Module published with slug: ${publishedModuleResult.slug}`);
      
      // Store the published module (which includes merged content if appending)
      setMergedModule(publishedModuleResult);
      setPublishedModule(publishedModuleResult);
      
      if (moduleToPublish.consolidation?.action === 'append-to') {
        setMsg(`Content successfully appended to existing module: ${publishedModuleResult.slug}`);
      } else {
        setMsg(`New module published successfully! Slug: ${publishedModuleResult.slug}`);
      }
      setCurrentStep('summary');
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(`[CreateModule] Publish error:`, error);
      setMsg(`Publish error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }


  // These functions are no longer needed since we're only reviewing, not editing
  // function updateModuleDraft(updates: Partial<TModuleSpec>) {
  //   if (!moduleDraft) return;
  //   setModuleDraft({ ...moduleDraft, ...updates });
  // }

  // function updateLesson(index: number, updates: Partial<TLessonSpec>) {
  //   if (!moduleDraft) return;
  //   const newLessons = [...(moduleDraft.lessons || [])];
  //   newLessons[index] = { ...newLessons[index], ...updates };
  //   setModuleDraft({ ...moduleDraft, lessons: newLessons });
  // }

  // function updateExercise(index: number, updates: Partial<TExerciseSpec>) {
  //   if (!moduleDraft) return;
  //   const newExercises = [...moduleDraft.exercises];
  //   newExercises[index] = { ...newExercises[index], ...updates };
  //   setModuleDraft({ ...moduleDraft, exercises: newExercises });
  // }



  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
                     <h1 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
             {currentStep === 'upload' ? 'Add Lecture Photos' : 'Review Module'}
           </h1>
           <p className="mt-2 text-lg text-[var(--muted-text)]">
             {currentStep === 'upload'
               ? 'Upload lecture photos and we\'ll create an interactive tutor.'
               : 'Review your generated material before publishing.'
             }
           </p>
        </div>

                 {/* Progress Indicator */}
         <div className="mb-8 flex items-center justify-center">
           <div className="flex items-center space-x-4">
             <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
               currentStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
             }`}>
               1
             </div>
             <div className={`h-1 w-16 ${currentStep === 'upload' ? 'bg-gray-300' : 'bg-green-600'}`} />
             <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
               currentStep === 'edit' ? 'bg-blue-600 text-white' : 
               currentStep === 'summary' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
             }`}>
               2
             </div>
           </div>
         </div>

        {/* Step Content */}
        {currentStep === 'upload' ? (
          /* Upload Step */
          <div className="space-y-6 rounded-2xl bg-[var(--surface)] p-6 shadow-lg sm:p-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>


            {/* Lecture Photos */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--muted-text)]">Lecture Photos</label>
              <div className="relative">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="relative rounded-xl border-2 border-dashed p-8 text-center transition-colors"
                  style={{
                    borderColor: isDragOver ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: isDragOver ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg)'
                  }}
                >
                  <input
                    type="file"
                    accept={acceptedTypes}
                    multiple
                    onChange={(e) => onPickFiles(e.target.files)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                        {isDragOver ? 'Drop your photos here' : 'Drag & drop photos here'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--muted-text)' }}>or click to browse files</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-text)' }}>Supports JPG, PNG, GIF, WebP, HEIC (automatically converted)</p>
                    </div>
                  </div>
                </div>
                
                {/* Loading Overlay */}
                {loading && (
                  <div 
                    className="absolute inset-0 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-4"
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    <div 
                      className="w-16 h-16 border-4 rounded-full animate-spin"
                      style={{ 
                        borderColor: 'var(--border)', 
                        borderTopColor: 'var(--primary)' 
                      }}
                    ></div>
                    <div className="text-center">
                      <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                        Analyzing Photos...
                      </p>
                      <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                        Please wait while we process your lecture photos
                      </p>
                    </div>
                  </div>
                )}
              </div>

               {/* Photo Count */}
               {images.length > 0 && (
                 <div className="text-center">
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}>
                     {images.length} photo{images.length !== 1 ? 's' : ''} uploaded
                   </span>
                 </div>
               )}

               {/* Image Previews */}
          {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border relative" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                        {failedImages.has(i) ? (
                          <div className="flex flex-col items-center justify-center h-full text-center p-2">
                            <div className="w-8 h-8 mb-2 rounded bg-gray-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-600 mb-1">Image</span>
                            <span className="text-xs text-gray-500 leading-tight">Failed to load</span>
                          </div>
                        ) : (
                          <img
                            src={img.previewUrl}
                            alt={img.file.name}
                            className="h-full w-full object-cover"
                            onError={() => {
                              console.error('Image failed to load:', img.file.name);
                              setFailedImages(prev => new Set([...prev, i]));
                            }}
                          />
                        )}
                      </div>
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: 'var(--danger)' }}
                      >
                        ×
                      </button>
                      <p className="mt-1 truncate text-xs" style={{ color: 'var(--muted-text)' }}>{img.file.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

            {/* Photo Upload FAQ */}
            <PhotoUploadFAQ />

            {/* Generate Button */}
          <button
            onClick={handleBuildDraft}
              disabled={loading || images.length === 0}
              className="w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)'
              }}
            >
              {loading ? "Analyzing Photos..." : "Analyze Lecture Photos"}
            </button>
          </div>
        ) : currentStep === 'edit' ? (
          moduleDraft && (
            <div className="space-y-6">
              {/* Discipline Confirmation (if needed) */}
              {disciplineSelection && (
                <div className="rounded-2xl bg-[var(--surface)] p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                      {showAlternatives ? 'Discipline Mismatch Detected' : 'AI Discipline Analysis'}
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                      {showAlternatives 
                        ? 'AI suggested a different discipline than expected. Please choose which one to use.'
                        : 'Our AI analyzed your photos and suggested the most appropriate discipline.'
                      }
                    </p>
                  </div>

                  {showAlternatives && (
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--warning-text)' }}>
                          ⚠️ Discipline Mismatch
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p style={{ color: 'var(--text)' }}>
                          <strong>Expected:</strong> {disciplineId}
                        </p>
                        <p style={{ color: 'var(--text)' }}>
                          <strong>AI Suggested:</strong> {disciplineSelection.selectedDisciplineId}
                        </p>
                        <p className="text-xs mt-2" style={{ color: 'var(--muted-text)' }}>
                          {disciplineSelection.reasoning}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Primary Selection */}
                    <div 
                      className="rounded-lg p-4 border-2 cursor-pointer transition-colors"
                      style={{ 
                        borderColor: selectedDisciplineId === disciplineSelection.selectedDisciplineId ? 'var(--primary)' : 'var(--border)', 
                        backgroundColor: selectedDisciplineId === disciplineSelection.selectedDisciplineId ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg)'
                      }}
                      onClick={() => setSelectedDisciplineId(disciplineSelection.selectedDisciplineId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                          {disciplineSelection.selectedDisciplineId}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}>
                          {disciplineSelection.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                        {disciplineSelection.reasoning}
                      </p>
                    </div>

                    {/* Route Discipline Option (when there's a mismatch) */}
                    {showAlternatives && disciplineId && (
                      <div 
                        className="rounded-lg p-4 border-2 cursor-pointer transition-colors"
                        style={{ 
                          borderColor: selectedDisciplineId === disciplineId ? 'var(--primary)' : 'var(--border)', 
                          backgroundColor: selectedDisciplineId === disciplineId ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg)'
                        }}
                        onClick={() => setSelectedDisciplineId(disciplineId)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                            {disciplineId}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--secondary)', color: 'var(--on-secondary)' }}>
                            Original Choice
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                          Use the discipline you originally selected from the dashboard.
                        </p>
                      </div>
                    )}

                    {/* Alternative Options Toggle */}
                    {disciplineSelection.alternativeDisciplines && disciplineSelection.alternativeDisciplines.length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowAlternatives(!showAlternatives)}
                          className="text-sm font-medium mb-3 transition-colors"
                          style={{ color: 'var(--primary)' }}
                        >
                          {showAlternatives ? 'Hide' : 'Show'} Alternative Options ({disciplineSelection.alternativeDisciplines.length})
                        </button>
                        
                        {showAlternatives && (
                          <div className="space-y-2">
                            {disciplineSelection.alternativeDisciplines.map((alt: any, index: number) => (
                              <div 
                                key={index} 
                                className="rounded-lg p-3 border-2 cursor-pointer transition-colors"
                                style={{ 
                                  borderColor: selectedDisciplineId === alt.disciplineId ? 'var(--primary)' : 'var(--border)', 
                                  backgroundColor: selectedDisciplineId === alt.disciplineId ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg)'
                                }}
                                onClick={() => setSelectedDisciplineId(alt.disciplineId)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                                    {alt.disciplineId}
                                  </span>
                                  <span className="text-sm" style={{ color: 'var(--muted-text)' }}>
                                    {alt.confidence}% confidence
                                  </span>
                                </div>
                                <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                                  {alt.reasoning}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Module Overview */}
              <div className="rounded-2xl bg-[var(--surface)] p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                  {moduleDraft.consolidation?.action === 'append-to' ? 'Append to Existing Module' : 'Module Overview'}
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--muted-text)]">Title</label>
                    <div className="text-sm p-3 rounded border" style={{ 
                      borderColor: 'var(--border)', 
                      backgroundColor: 'var(--bg)', 
                      color: 'var(--text)' 
                    }}>
                      {moduleDraft.title}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--muted-text)]">Description</label>
                    <div className="text-sm p-3 rounded border" style={{ 
                      borderColor: 'var(--border)', 
                      backgroundColor: 'var(--bg)', 
                      color: 'var(--text)' 
                    }}>
                      {moduleDraft.description || 'No description provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              {(() => {
                // Determine which lessons to show
                let lessonsToShow: TLessonSpec[] = [];
                let existingCount = 0;
                
                if (moduleDraft.consolidation?.action === 'append-to' && existingModule) {
                  // When appending, show existing + new lessons
                  lessonsToShow = [
                    ...(existingModule.lessons || []),
                    ...(moduleDraft.lessons || [])
                  ];
                  existingCount = existingModule.lessons?.length || 0;
                } else {
                  // When creating new, show just the draft lessons
                  lessonsToShow = moduleDraft.lessons || [];
                  existingCount = 0;
                }
                
                if (lessonsToShow.length === 0) return null;
                
                return (
                  <div className="rounded-2xl bg-[var(--surface)] p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                      Lessons {moduleDraft.consolidation?.action === 'append-to' && existingModule && (
                        <span className="text-sm font-normal text-blue-600">
                          ({existingCount} existing + {moduleDraft.lessons?.length || 0} new)
                        </span>
                      )}
                    </h2>
                    <div className="space-y-4">
                      {lessonsToShow.map((lesson: TLessonSpec, index: number) => {
                        const isNew = moduleDraft.consolidation?.action === 'create-new' || 
                                     (moduleDraft.consolidation?.action === 'append-to' && 
                                      existingModule && 
                                      index >= existingCount);
                        
                        return (
                                                     <div key={lesson.slug} className={`border rounded-lg p-4 ${
                             isNew ? 'border-2' : ''
                           }`} style={{ 
                             borderColor: isNew ? 'var(--ok)' : 'var(--border)',
                             backgroundColor: isNew ? 'var(--ok-bg)' : 'transparent'
                           }}>
                             {isNew && (
                               <div className="mb-2 text-xs font-medium px-2 py-1 rounded" style={{
                                 backgroundColor: 'var(--ok)',
                                 color: 'var(--on-primary)'
                               }}>
                                 New Content
                               </div>
                             )}
                            <div className="space-y-3">
                              <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                                {lesson.title}
                                {!isNew && (
                                  <span className="ml-2 text-xs font-normal px-2 py-1 rounded" style={{
                                    backgroundColor: 'var(--muted-bg)',
                                    color: 'var(--muted-text)'
                                  }}>
                                    Existing Content
                                  </span>
                                )}
                              </div>
                              <div className="text-sm p-3 rounded border" style={{
                                borderColor: 'var(--border)',
                                backgroundColor: 'var(--bg)',
                                color: 'var(--text)',
                                whiteSpace: 'pre-wrap'
                              }}>
                                {lesson.structuredContent?.introduction || lesson.contentMd || 'No content provided'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

                            {/* Exercises */}
              {(() => {
                // Determine which exercises to show
                let exercisesToShow: TExerciseSpec[] = [];
                let existingCount = 0;
                
                if (moduleDraft.consolidation?.action === 'append-to' && existingModule) {
                  // When appending, show existing + new exercises
                  exercisesToShow = [
                    ...(existingModule.exercises || []),
                    ...(moduleDraft.exercises || [])
                  ];
                  existingCount = existingModule.exercises?.length || 0;
                } else {
                  // When creating new, show just the draft exercises
                  exercisesToShow = moduleDraft.exercises || [];
                  existingCount = 0;
                }
                
                if (exercisesToShow.length === 0) return null;
                
                return (
                  <div className="rounded-2xl bg-[var(--surface)] p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                      Exercises {moduleDraft.consolidation?.action === 'append-to' && existingModule && (
                        <span className="text-sm font-normal text-blue-600">
                          ({existingCount} existing + {moduleDraft.exercises?.length || 0} new)
                        </span>
                      )}
                    </h2>
                    <div className="space-y-4">
                      {exercisesToShow.map((exercise: TExerciseSpec, index: number) => {
                        const isNew = moduleDraft.consolidation?.action === 'create-new' || 
                                     (moduleDraft.consolidation?.action === 'append-to' && 
                                      existingModule && 
                                      index >= existingCount);
                        
                        return (
                          <div key={exercise.slug} className={`border rounded-lg p-4 ${
                            isNew ? 'border-2' : ''
                          }`} style={{ 
                            borderColor: isNew ? 'var(--ok)' : 'var(--border)',
                            backgroundColor: isNew ? 'var(--ok-bg)' : 'transparent'
                          }}>
                            {isNew && (
                              <div className="mb-2 text-xs font-medium px-2 py-1 rounded" style={{
                                backgroundColor: 'var(--ok)',
                                color: 'var(--on-primary)'
                              }}>
                                New Content
                              </div>
                            )}
                            <div className="space-y-3">
                              <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                                {exercise.title}
                                {!isNew && (
                                  <span className="ml-2 text-xs font-normal px-2 py-1 rounded" style={{
                                    backgroundColor: 'var(--muted-bg)',
                                    color: 'var(--muted-text)'
                                  }}>
                                    Existing Content
                                  </span>
                                )}
                              </div>
                              <div className="text-sm" style={{ color: 'var(--muted-text)' }}>
                                Type: {exercise.kind}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                                 );
               })()}

               {/* Consolidation Information */}
               {moduleDraft.consolidation && (
                 <div className="rounded-2xl bg-[var(--surface)] p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                   <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>Content Analysis Result</h2>
                   <div className="space-y-3">
                     <div className="flex items-center space-x-2">
                       <span className="text-sm font-medium" style={{ color: 'var(--muted-text)' }}>Action:</span>
                       <span className={`px-2 py-1 rounded text-xs font-medium ${
                         moduleDraft.consolidation.action === 'create-new' ? 'bg-green-100 text-green-800' :
                         'bg-blue-100 text-blue-800'
                       }`}>
                         {moduleDraft.consolidation.action === 'create-new' ? 'Create New Module' :
                          'Append to Existing'}
                       </span>
                     </div>
                     {moduleDraft.consolidation.targetModuleSlug && (
                       <div className="flex items-center space-x-2">
                         <span className="text-sm font-medium" style={{ color: 'var(--muted-text)' }}>Target Module:</span>
                         <span className="text-sm font-mono px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
                           {moduleDraft.consolidation.targetModuleSlug}
                         </span>
                       </div>
                     )}
                     {moduleDraft.consolidation.reason && (
                       <div className="flex items-start space-x-2">
                         <span className="text-sm font-medium" style={{ color: 'var(--muted-text)' }}>Reason:</span>
                         <span className="text-sm" style={{ color: 'var(--text)' }}>
                           {moduleDraft.consolidation.reason}
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
               )}

               {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                                 <button
                   onClick={() => {
                     setCurrentStep('upload');
                     // Reset the initial files processed flag when going back
                     initialFilesProcessed.current = false;
                   }}
                   className="rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:opacity-80"
                   style={{
                     borderColor: 'var(--border)',
                     color: 'var(--text)',
                     backgroundColor: 'var(--surface)'
                   }}
                 >
                   ← Back to Photos
                 </button>

                                   <button
                    onClick={handlePublish}
                    disabled={loading}
                    className="flex-1 rounded-lg px-6 py-3 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--ok)',
                      color: 'var(--on-primary)'
                    }}
                  >
                    {loading ? "Publishing..." : "Publish Content"}
                  </button>
        </div>
            </div>
          )
                 ) : (
           // Summary Step
           publishedModule && (
             <SummaryStep
               publishedModule={publishedModule}
               newlyAddedLessons={moduleDraft?.lessons?.length || 0}
               newlyAddedExercises={moduleDraft?.exercises?.length || 0}
               onReset={() => {
                 setCurrentStep('upload');
                 setImages([]);
                 setFailedImages(new Set());
                 setModuleDraft(null);
                 setGenerationContext(null);
                 setExistingModule(null);
                 setMergedModule(null);
                 setPublishedModule(null);
                 setMsg(null);
                 // Reset the initial files processed flag
                 initialFilesProcessed.current = false;
               }}
               onViewModule={() => navigate(`/modules/${publishedModule.slug}`)}
             />
           )
         )}

        {/* Message */}
        {displayMsg && (
          <div
            className="mt-6 rounded-lg p-4 text-sm"
            style={{
              backgroundColor: displayMsg.includes('Error') || displayMsg.includes('error')
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
              color: displayMsg.includes('Error') || displayMsg.includes('error')
                ? 'var(--danger)'
                : 'var(--ok)',
              border: `1px solid ${displayMsg.includes('Error') || displayMsg.includes('error') ? 'var(--danger)' : 'var(--ok)'}`
            }}
          >
            {displayMsg}
          </div>
        )}
        </div>
      </div>
  );
}
