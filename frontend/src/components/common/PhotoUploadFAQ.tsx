import { useState } from 'react';
import { PHOTO_UPLOAD_CONFIG } from '@local/shared';

interface PhotoUploadFAQProps {
  className?: string;
}

export default function PhotoUploadFAQ({ className = '' }: PhotoUploadFAQProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* FAQ Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-[var(--muted-text)] hover:text-[var(--text)] transition-colors"
      >
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        Photo Upload FAQ
      </button>

      {/* FAQ Content */}
      {isExpanded && (
        <div className="space-y-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          
          {/* Photo Limit */}
          <div>
            <h4 className="font-medium text-[var(--text)] mb-2">Photo Limit</h4>
            <p className="text-sm text-[var(--muted-text)]">
              You can upload up to <strong>{PHOTO_UPLOAD_CONFIG.MAX_PHOTOS} photos</strong> at once. 
              This is a temporary limit to ensure optimal processing.
            </p>
          </div>

          {/* Privacy & Data Usage */}
          <div>
            <h4 className="font-medium text-[var(--text)] mb-2">Privacy & Data Usage</h4>
            <div className="text-sm text-[var(--muted-text)] space-y-2">
              <p>
                <strong>Storage:</strong> Your photos are stored in our database and may be publicly visible 
                on the generated module's photo page with your attribution.
              </p>
              <p>
                <strong>AI Processing:</strong> Photos are sent to our AI providers for content analysis:
              </p>
              <ul className="ml-4 space-y-1">
                <li>• <a href={PHOTO_UPLOAD_CONFIG.LLM_PROVIDERS.openai.privacyPolicy} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">OpenAI Privacy Policy</a></li>
                <li>• <a href={PHOTO_UPLOAD_CONFIG.LLM_PROVIDERS.gemini.privacyPolicy} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Google Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Content Guidelines */}
          <div>
            <h4 className="font-medium text-[var(--text)] mb-2">Content Guidelines</h4>
            <div className="text-sm text-[var(--muted-text)] space-y-2">
              <p>
                <strong>Merit System:</strong> This platform uses a merit-based system. Uploading inappropriate 
                content (non-lecture photos, personal photos, etc.) may result in:
              </p>
              <ul className="ml-4 space-y-1">
                <li>• Content flagging and removal</li>
                <li>• Account restrictions</li>
                <li>• Loss of platform access</li>
              </ul>
              <p>
                <strong>Please only upload:</strong> Lecture slides, educational diagrams, academic content, 
                and similar educational materials.
              </p>
            </div>
          </div>

          {/* Supported Formats */}
          <div>
            <h4 className="font-medium text-[var(--text)] mb-2">Supported Formats</h4>
            <p className="text-sm text-[var(--muted-text)]">
              We support JPG, PNG, GIF, WebP, and HEIC files. HEIC files from iOS devices 
              are automatically converted to JPEG for compatibility.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
