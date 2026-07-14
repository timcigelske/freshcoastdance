import React, { useEffect, useState } from 'react';
import { Folder, FileText, Music, Image, Video, Link, Download, Pin, Search, ChevronRight, ChevronLeft, File, FileSpreadsheet, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileRecord, Folder as FolderType } from '../../lib/types';
import { Header } from '../../components/layout/Header';

function FileIcon({ type, size = 18 }: { type: string; size?: number }) {
  const props = { size, strokeWidth: 1.8 };
  switch (type) {
    case 'audio': return <Music {...props} className="text-violet-500" />;
    case 'image': return <Image {...props} className="text-blue-500" />;
    case 'video': return <Video {...props} className="text-pink-500" />;
    case 'link': return <Link {...props} className="text-teal-500" />;
    case 'spreadsheet': return <FileSpreadsheet {...props} className="text-emerald-500" />;
    case 'pdf': return <FileText {...props} className="text-red-500" />;
    default: return <File {...props} className="text-slate-400" />;
  }
}

function formatSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function FilesPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isStaff = profile?.role && ['owner', 'admin', 'teacher'].includes(profile.role);

  useEffect(() => { loadContent(currentFolderId); }, [currentFolderId]);

  async function loadContent(folderId: string | null) {
    setLoading(true);
    const [foldersRes, filesRes] = await Promise.all([
      supabase.from('folders').select('*').eq('parent_id', folderId ?? null).order('sort_order'),
      supabase.from('files')
        .select('*, uploader:uploaded_by(full_name)')
        .eq('folder_id', folderId ?? null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
    ]);

    if (folderId) {
      const { data: folder } = await supabase.from('folders').select('*').eq('id', folderId).maybeSingle();
      setCurrentFolder(folder);
    } else {
      setCurrentFolder(null);
    }

    setFolders(foldersRes.data ?? []);
    setFiles(filesRes.data ?? []);
    setLoading(false);
  }

  const filtered = search
    ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase()))
    : files;

  const pinnedFiles = filtered.filter(f => f.is_pinned);
  const regularFiles = filtered.filter(f => !f.is_pinned);

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title={currentFolder?.name ?? 'Files'}
        subtitle={!currentFolder ? 'Studio file library' : undefined}
        onBack={currentFolder ? () => setCurrentFolderId(null) : undefined}
        action={isStaff ? (
          <button className="btn-primary flex items-center gap-1.5">
            <Plus size={15} />Upload
          </button>
        ) : undefined}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20 focus:border-navy-800/40"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Folders */}
            {!search && folders.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Folders</h2>
                <div className="grid grid-cols-2 gap-2">
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="card-hover p-4 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
                        <Folder size={20} className="text-navy-800" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy-800 truncate">{folder.name}</p>
                        {folder.description && (
                          <p className="text-xs text-slate-500 truncate">{folder.description}</p>
                        )}
                      </div>
                      <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Pinned Files */}
            {pinnedFiles.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Pin size={12} />Pinned
                </h2>
                <div className="space-y-2">
                  {pinnedFiles.map(file => <FileRow key={file.id} file={file} />)}
                </div>
              </section>
            )}

            {/* All Files */}
            {regularFiles.length > 0 && (
              <section>
                {(pinnedFiles.length > 0 || folders.length > 0) && (
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {search ? 'Results' : 'Files'}
                  </h2>
                )}
                <div className="space-y-2">
                  {regularFiles.map(file => <FileRow key={file.id} file={file} />)}
                </div>
              </section>
            )}

            {folders.length === 0 && files.length === 0 && (
              <div className="card p-10 text-center">
                <Folder size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">No files here yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FileRow({ file }: { file: FileRecord & { uploader?: any } }) {
  return (
    <div className="card-hover p-3.5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
        <FileIcon type={file.file_type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-navy-800 truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {file.description && (
            <p className="text-xs text-slate-500 truncate">{file.description}</p>
          )}
          <span className="text-xs text-slate-400">{timeAgo(file.created_at)}</span>
          {file.uploader?.full_name && (
            <span className="text-xs text-slate-400">· {file.uploader.full_name}</span>
          )}
        </div>
        {file.tags?.length ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {file.tags.map(tag => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        ) : null}
      </div>
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-navy-800 transition-colors flex-shrink-0"
        title="Download"
        onClick={e => e.stopPropagation()}
      >
        <Download size={16} />
      </a>
    </div>
  );
}
