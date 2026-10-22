import { useState } from "react"
import { CornerDownRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card"
import { Button } from "../../ui/Button"

interface AuditEntry {
  time: string
  who: string
  action: string
  codes?: string
  detail?: string
}

interface PrivateNote {
  id: string
  who: string
  time: string
  text: string
  code?: string
  source?: string
  parentId?: string
}

interface RecordSource {
  key: string
  label: string
}

function SubTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  )
}

function SystemNotesTable({ auditLog }: { auditLog: AuditEntry[] }) {
  return (
    <>
      <div className="border border-gray-200 rounded-md divide-y divide-gray-100">
        <div className="flex items-start gap-4 px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
          <span className="flex-none w-32">Time</span>
          <span className="flex-none w-24">Curator</span>
          <span className="flex-none w-56">Action</span>
          <span className="flex-none w-40">Code(s)</span>
          <span>Detail</span>
        </div>
        {auditLog.slice().reverse().map((entry, i) => (
          <div key={i} className="flex items-start gap-4 px-3 py-2.5 text-xs">
            <span className="font-mono text-xs text-gray-400 flex-none w-32">{entry.time}</span>
            <span className="text-gray-600 flex-none w-24">{entry.who}</span>
            <span className="text-gray-800 font-medium flex-none w-56">{entry.action}</span>
            <span className="flex-none w-40">
              {entry.codes ? <span className="font-mono text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{entry.codes}</span> : null}
            </span>
            <span className="text-gray-600">{entry.detail}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 italic mt-3">
        System-generated log — an entry is added automatically every time a curator saves, scores, or reopens a
        section (Mode of Inheritance, Start Scoring, proband saves, variant-type switches, Mark Complete),
        with the evidence code(s) affected where applicable. Not persisted across sessions in this mockup.
      </p>
    </>
  )
}

function NoteComposer({ recordCodes, recordSources, onSubmit, onCancel, autoFocus, placeholder = "Write a note for other curators working on this record..." }: {
  recordCodes: string[]
  recordSources: RecordSource[]
  onSubmit: (text: string, tags: { code: string; source: string }) => void
  onCancel?: () => void
  autoFocus?: boolean
  placeholder?: string
}) {
  const [text, setText] = useState("")
  const [code, setCode] = useState("")
  const [source, setSource] = useState("")

  const submit = () => {
    if (!text.trim()) return
    onSubmit(text, { code, source })
    setText("")
    setCode("")
    setSource("")
  }

  return (
    <div className="border border-gray-200 rounded-md p-3 bg-gray-50 space-y-2">
      <textarea
        autoFocus={autoFocus}
        className="w-full border border-gray-300 rounded-md p-2 text-xs bg-white"
        rows={2}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select className="border rounded-md p-1.5 text-xs bg-white" value={code} onChange={(e) => setCode(e.target.value)}>
          <option value="">Tag a code (optional)</option>
          {recordCodes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="border rounded-md p-1.5 text-xs bg-white max-w-xs" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">Tag a source (optional)</option>
          {recordSources.map((s) => (
            <option key={s.key} value={s.label}>{s.label}</option>
          ))}
        </select>
        <div className="flex-1" />
        {onCancel && <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" disabled={!text.trim()} onClick={submit}>Post</Button>
      </div>
      {recordSources.length === 0 && (
        <p className="text-xs text-gray-400">No manually-entered sources (PMIDs, variant IDs, etc.) in the record yet to tag.</p>
      )}
    </div>
  )
}

function NoteRow({ note, depth, replies, replyingTo, setReplyingTo, recordCodes, recordSources, onReply }: {
  note: PrivateNote
  depth: number
  replies: PrivateNote[]
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  recordCodes: string[]
  recordSources: RecordSource[]
  onReply: (text: string, tags: { code: string; source: string; parentId?: string }) => void
}) {
  const childReplies = replies.filter((r) => r.parentId === note.id)
  return (
    <div className={depth > 0 ? "pl-6 border-l border-gray-200 ml-3" : ""}>
      <div className="py-2.5">
        <div className="flex items-baseline gap-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-700">{note.who}</span>
          <span className="font-mono">{note.time}</span>
        </div>
        <p className="text-xs text-gray-800 mt-0.5">{note.text}</p>
        {(note.code || note.source) && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {note.code && <span className="font-mono text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">{note.code}</span>}
            {note.source && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{note.source}</span>}
          </div>
        )}
        <button
          onClick={() => setReplyingTo(replyingTo === note.id ? null : note.id)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1.5"
        >
          <CornerDownRight className="h-3 w-3" /> Reply
        </button>
        {replyingTo === note.id && (
          <div className="mt-2">
            <NoteComposer
              autoFocus
              recordCodes={recordCodes}
              recordSources={recordSources}
              placeholder="Write a reply..."
              onCancel={() => setReplyingTo(null)}
              onSubmit={(text, tags) => {
                onReply(text, { ...tags, parentId: note.id })
                setReplyingTo(null)
              }}
            />
          </div>
        )}
      </div>
      {childReplies.map((reply) => (
        <NoteRow
          key={reply.id} note={reply} depth={depth + 1} replies={replies} replyingTo={replyingTo}
          setReplyingTo={setReplyingTo} recordCodes={recordCodes} recordSources={recordSources} onReply={onReply}
        />
      ))}
    </div>
  )
}

function PrivateNotesPanel({ privateNotes, recordCodes, recordSources, onAddNote }: {
  privateNotes: PrivateNote[]
  recordCodes: string[]
  recordSources: RecordSource[]
  onAddNote: (text: string, tags: { code: string; source: string; parentId?: string }) => void
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const topLevel = privateNotes.filter((n) => !n.parentId)

  return (
    <div className="space-y-4">
      <NoteComposer
        recordCodes={recordCodes}
        recordSources={recordSources}
        onSubmit={(text, tags) => onAddNote(text, tags)}
      />
      {topLevel.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No internal notes yet. Notes here are visible to every curator working on this record.</p>
      ) : (
        <div className="border border-gray-200 rounded-md divide-y divide-gray-100 px-3">
          {topLevel.map((note) => (
            <NoteRow
              key={note.id} note={note} depth={0} replies={privateNotes} replyingTo={replyingTo}
              setReplyingTo={setReplyingTo} recordCodes={recordCodes} recordSources={recordSources}
              onReply={(text, tags) => onAddNote(text, tags)}
            />
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 italic">
        Internal Notes are specific to the affiliation/curator who owns this variant record. Once posted, a note
        can't be edited or deleted — reply instead to add context or a correction.
      </p>
    </div>
  )
}

const ALL_CODES = [
  "POP_FRQ", "POP_HMZ", "CLN_UAF", "CLN_ALT", "CLN_AFF", "CLN_DNV", "CLN_CCS",
  "LOC_PHE", "LOC_SEG", "MIS_PRD", "MIS_FXN", "MIS_INF", "CDS_PRD", "CDS_FXN",
  "CDS_INF", "NUL_PRD", "NUL_FXN", "NUL_INF", "SPL_PRD", "SPL_SPA", "SPL_FXN",
  "SPL_INF", "NCG_PRD", "NCG_FXN", "NCG_INF", "REG_PRD", "REG_FXN", "REG_INF",
]

export default function AuditTrail() {
  const [subTab, setSubTab] = useState<"system" | "private">("system")
  const [auditLog] = useState<AuditEntry[]>([])
  const [privateNotes, setPrivateNotes] = useState<PrivateNote[]>([])

  const addNote = (text: string, tags: { code: string; source: string; parentId?: string }) => {
    const note: PrivateNote = {
      id: crypto.randomUUID(),
      who: "Current Curator",
      time: new Date().toLocaleTimeString(),
      text,
      code: tags.code || undefined,
      source: tags.source || undefined,
      parentId: tags.parentId,
    }
    setPrivateNotes((prev) => [...prev, note])
  }

  return (
    <Card tone="reference">
      <CardHeader><CardTitle>Audit Trail</CardTitle><CardDescription>History of changes to this variant classification</CardDescription></CardHeader>
      <CardContent>
        <div className="flex gap-4 border-b border-gray-200 mb-4">
          <SubTabButton active={subTab === "system"} onClick={() => setSubTab("system")}>System Notes</SubTabButton>
          <SubTabButton active={subTab === "private"} onClick={() => setSubTab("private")}>Internal Notes</SubTabButton>
        </div>
        {subTab === "system" ? (
          <SystemNotesTable auditLog={auditLog} />
        ) : (
          <PrivateNotesPanel privateNotes={privateNotes} recordCodes={ALL_CODES} recordSources={[]} onAddNote={addNote} />
        )}
      </CardContent>
    </Card>
  )
}
