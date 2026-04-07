import { useState, useEffect, useCallback } from "react";
import { Loader2, Upload, List, Check, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCustomLists, importCustomWordList } from "@/lib/api";
import type { CustomListSummary, ImportCustomListResponse } from "@/lib/api";

interface CustomListPanelProps {
  selectedList: CustomListSummary | null;
  onSelectList: (list: CustomListSummary | null) => void;
  onStartPractice: () => void;
}

export function CustomListPanel({ selectedList, onSelectList, onStartPractice }: CustomListPanelProps) {
  const [lists, setLists] = useState<CustomListSummary[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);

  // Import form
  const [listName, setListName] = useState("");
  const [importLevel, setImportLevel] = useState("1");
  const [wordsText, setWordsText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportCustomListResponse | null>(null);

  const [showImport, setShowImport] = useState(false);

  const loadLists = useCallback(async () => {
    setListsLoading(true);
    setListsError(null);
    try {
      const data = await fetchCustomLists();
      setLists(data.lists || []);
    } catch {
      setListsError("Could not load custom lists.");
    } finally {
      setListsLoading(false);
    }
  }, []);

  useEffect(() => { loadLists(); }, [loadLists]);

  const handleImport = async () => {
    if (!listName.trim() || !wordsText.trim()) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const words = wordsText
        .split(/[\n,]+/)
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean);
      if (words.length === 0) { setImportError("No valid words found."); setImporting(false); return; }
      const res = await importCustomWordList({
        listName: listName.trim(),
        words,
        level: importLevel,
        overwriteList: true,
      });
      setImportResult(res);
      setListName("");
      setWordsText("");
      loadLists();
    } catch {
      setImportError("Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Available Lists */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <List className="h-4 w-4" /> Your Word Lists
          </h3>
          <button
            onClick={() => { setShowImport((v) => !v); setImportResult(null); }}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            <Upload className="h-3 w-3" /> {showImport ? "Hide Import" : "Import New List"}
          </button>
        </div>

        {listsLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
        {listsError && <p className="text-xs text-destructive">{listsError}</p>}

        {!listsLoading && lists.length === 0 && !listsError && (
          <p className="text-xs text-muted-foreground text-center py-4">No custom lists yet. Import one to get started.</p>
        )}

        {lists.length > 0 && (
          <div className="space-y-1.5">
            {lists.map((list) => {
              const isSelected = selectedList?.id === list.id;
              return (
                <button
                  key={list.id}
                  onClick={() => onSelectList(isSelected ? null : list)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all border",
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <BookOpen className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{list.name}</p>
                    <p className="text-[10px] text-muted-foreground">Level {list.level} · {list.wordCount} words</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {selectedList && (
          <button
            onClick={onStartPractice}
            className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            Practice "{selectedList.name}"
          </button>
        )}
      </div>

      {/* Import Form */}
      {showImport && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Import a Word List</h4>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">List Name</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g. Wind Words"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Level</label>
            <div className="flex gap-1.5">
              {["1", "2", "3"].map((l) => (
                <button
                  key={l}
                  onClick={() => setImportLevel(l)}
                  className={cn(
                    "flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold border transition-all",
                    importLevel === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40"
                  )}
                >
                  Level {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Words (one per line or comma-separated)</label>
            <textarea
              value={wordsText}
              onChange={(e) => setWordsText(e.target.value)}
              rows={4}
              placeholder={"zephyrette\nmoonbow\nwhirlwind"}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono resize-y focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            onClick={handleImport}
            disabled={importing || !listName.trim() || !wordsText.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? "Importing…" : "Import List"}
          </button>

          {importError && <p className="text-xs text-destructive text-center">{importError}</p>}

          {importResult && (
            <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-xs text-center space-y-0.5">
              <p className="font-semibold text-success">✓ List "{importResult.list.name}" imported</p>
              <p className="text-muted-foreground">{importResult.importedCount} imported · {importResult.skippedExistingCount} skipped</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
