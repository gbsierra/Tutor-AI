import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { type UserContributions } from '@shared/auth';
import { getApiClient } from '@shared/apiClient';
import PhotoViewer from '../../components/PhotoViewer';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<UserContributions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      setDisplayName(user.displayName || '');
      fetchUserContributions();
    }
  }, [isAuthenticated, user]);

  const fetchUserContributions = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiClient = getApiClient();
      
      // Fetch all user data in parallel
      const [contributionsData, modulesData, photosData] = await Promise.all([
        apiClient.get('/api/users/me/contributions'),
        apiClient.get('/api/users/me/modules'),
        apiClient.get('/api/users/me/photos')
      ]);

      setContributions({
        contributions: (contributionsData as any).contributions,
        modules: (modulesData as any).modules,
        photos: (photosData as any).photos
      });
    } catch (err) {
      console.error('Error fetching user contributions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiBaseUrl}/api/users/me`, {
        method: 'PUT',
        headers: {
          'X-User-ID': user!.id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setEditing(false);
      // Optionally refresh user data or show success message
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleModuleClick = (moduleSlug: string) => {
    navigate(`/modules/${moduleSlug}`);
  };

  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || '');
    setEditing(false);
  };


  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text)" }}>Profile</h1>
          <p style={{ color: "var(--muted-text)" }}>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Header */}
        <div className="rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-start gap-4 sm:gap-6">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-medium flex-shrink-0"
                style={{
                  background: "var(--primary)",
                  color: "var(--on-primary)"
                }}
              >
                {user.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold truncate" style={{ color: "var(--text)" }}>
                    {user.displayName || user.name}
                  </h1>
                  <p className="text-sm sm:text-base truncate" style={{ color: "var(--muted-text)" }}>{user.email}</p>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition self-start sm:self-auto flex-shrink-0"
                  style={{ 
                    color: "var(--primary)", 
                    borderColor: "var(--border)", 
                    border: "1px solid",
                    background: "var(--surface)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--primary)";
                    e.currentTarget.style.color = "var(--on-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface)";
                    e.currentTarget.style.color = "var(--primary)";
                  }}
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 transition text-sm sm:text-base"
                      style={{ 
                        borderColor: "var(--border)", 
                        background: "var(--surface)",
                        color: "var(--text)"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--primary)";
                        e.target.style.boxShadow = "0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border)";
                        e.target.style.boxShadow = "none";
                      }}
                      placeholder="Enter display name for attribution"
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--muted-text)" }}>
                      This name will appear when your photos are attributed in modules
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base"
                      style={{ 
                        background: "var(--primary)", 
                        color: "var(--on-primary)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--primary-600)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--primary)";
                      }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 sm:px-4 py-2 border rounded-lg transition text-sm sm:text-base"
                      style={{ 
                        color: "var(--muted-text)", 
                        borderColor: "var(--border)", 
                        background: "var(--surface)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--surface)";
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs sm:text-sm" style={{ color: "var(--muted-text)" }}>
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border p-3 sm:p-4 mb-4 sm:mb-6" style={{ 
            background: "color-mix(in srgb, var(--danger) 10%, var(--surface))", 
            borderColor: "var(--danger)" 
          }}>
            <p className="text-sm sm:text-base" style={{ color: "var(--danger)" }}>Error: {error}</p>
            <button 
              onClick={fetchUserContributions}
              className="mt-2 px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base"
              style={{ 
                background: "var(--danger)", 
                color: "var(--on-primary)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="rounded-lg shadow-sm border p-4 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="animate-pulse">
              <div className="h-3 sm:h-4 rounded w-3/4 mb-2" style={{ background: "var(--border)" }}></div>
              <div className="h-3 sm:h-4 rounded w-1/2 mb-2" style={{ background: "var(--border)" }}></div>
              <div className="h-3 sm:h-4 rounded w-2/3" style={{ background: "var(--border)" }}></div>
            </div>
          </div>
        )}

        {/* Contributions Overview */}
        {contributions && !loading && (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Stats */}
            <div className="rounded-lg shadow-sm border p-3 sm:p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="text-base sm:text-lg font-semibold mb-3" style={{ color: "var(--text)" }}>Contributions Overview</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-lg p-3 border" style={{ 
                  background: "color-mix(in srgb, var(--primary) 8%, var(--surface))", 
                  borderColor: "var(--primary)" 
                }}>
                  <h3 className="text-xs sm:text-sm font-semibold" style={{ color: "var(--primary)" }}>Modules</h3>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--primary)" }}>{contributions.modules.length}</p>
                  <p className="text-xs" style={{ color: "var(--muted-text)" }}>Contributed to</p>
                </div>
                
                <div className="rounded-lg p-3 border" style={{ 
                  background: "color-mix(in srgb, var(--ok) 8%, var(--surface))", 
                  borderColor: "var(--ok)" 
                }}>
                  <h3 className="text-xs sm:text-sm font-semibold" style={{ color: "var(--ok)" }}>Photos</h3>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--ok)" }}>{contributions.photos.length}</p>
                  <p className="text-xs" style={{ color: "var(--muted-text)" }}>Uploaded</p>
                </div>
              </div>
            </div>

            {/* Recent Modules */}
            {contributions.modules.length > 0 && (
              <div className="rounded-lg shadow-sm border p-4 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: "var(--text)" }}>Recent Modules</h2>
                <div className="space-y-3">
                  {contributions.modules.slice(0, 5).map((module) => (
                    <div 
                      key={module.id} 
                      className="border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-opacity-50 transition-colors" 
                      style={{ 
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)"
                      }}
                      onClick={() => handleModuleClick(module.slug)}
                    >
                      <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--text)" }}>{module.title}</h3>
                      <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--muted-text)" }}>{module.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center mt-2 text-xs gap-1 sm:gap-0" style={{ color: "var(--muted-text)" }}>
                        <span>Discipline: {module.discipline}</span>
                        <span className="hidden sm:inline mx-2">•</span>
                        <span>Updated: {new Date(module.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Photos */}
            {contributions.photos.length > 0 && (
              <div className="rounded-lg shadow-sm border p-4 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: "var(--text)" }}>Recent Photos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <PhotoViewer
                    photos={contributions.photos.slice(0, 6)}
                    renderPhoto={(photo, onClick) => (
                      <div className="border rounded-lg p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }} onClick={onClick}>
                        {photo.url ? (
                          <div className="mb-2 sm:mb-3">
                            <img 
                              src={photo.url} 
                              alt={photo.filename}
                              className="w-full h-24 sm:h-32 object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="mb-2 sm:mb-3 w-full h-24 sm:h-32 bg-gray-100 rounded flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
                            <span className="text-xs sm:text-sm" style={{ color: "var(--muted-text)" }}>No preview available</span>
                          </div>
                        )}
                        <h3 className="font-semibold truncate text-sm sm:text-base" style={{ color: "var(--text)" }}>{photo.filename}</h3>
                        <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--muted-text)" }}>
                          {photo.fileSize ? `${(photo.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--muted-text)" }}>
                          Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {contributions.contributions.length > 0 && (
              <div className="rounded-lg shadow-sm border p-4 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: "var(--text)" }}>Recent Activity</h2>
                <div className="space-y-2">
                  {contributions.contributions.slice(0, 10).map((contribution) => (
                    <div key={contribution.id} className="border rounded-lg p-3" style={{ 
                      background: "var(--bg)", 
                      borderColor: "var(--border)" 
                    }}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium capitalize text-sm sm:text-base" style={{ color: "var(--text)" }}>
                            {contribution.contributionType}
                          </span>
                          {contribution.contributionData?.type && typeof contribution.contributionData.type === 'string' && (
                            <span className="text-xs sm:text-sm ml-2" style={{ color: "var(--muted-text)" }}>
                              - {contribution.contributionData.type}
                            </span>
                          )}
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-text)" }}>
                          {new Date(contribution.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {contribution.contributionData?.filename && typeof contribution.contributionData.filename === 'string' && (
                        <p className="text-xs sm:text-sm mt-1 truncate" style={{ color: "var(--muted-text)" }}>
                          {contribution.contributionData.filename}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contributions.contributions.length === 0 && contributions.modules.length === 0 && contributions.photos.length === 0 && (
              <div className="rounded-lg shadow-sm border p-4 sm:p-6 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: "var(--text)" }}>No Contributions Yet</h2>
                <p className="mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: "var(--muted-text)" }}>You haven't made any contributions yet.</p>
                <p className="text-xs sm:text-sm" style={{ color: "var(--muted-text)" }}>
                  Start by uploading photos to create learning modules!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
