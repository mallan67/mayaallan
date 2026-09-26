export interface CoveragePanelProps {
  graphNodes: number
  graphLinks: number
  evidenceRecords: number
  prompts: number
  promptIntents: number
  visualReady: number
  visualTotal: number
  readiness: Array<{ id: string; label: string; ready: boolean; note: string }>
}

export function CoveragePanel(props: CoveragePanelProps) {
  const metrics = [
    ["Topic graph", props.graphNodes + " nodes / " + props.graphLinks + " links"],
    ["Evidence registry", props.evidenceRecords + " records"],
    ["Prompt matrix", props.prompts + " prompts / " + props.promptIntents + " intents"],
    ["Visual assets", props.visualReady + "/" + props.visualTotal + " ready"],
  ]

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">System coverage</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="border border-slate-200 rounded-xl bg-white p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
            <div className="text-xl font-serif font-semibold mt-1">{value}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {props.readiness.map((item) => (
          <div key={item.id} className="border border-slate-200 rounded-xl bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{item.label}</span>
              <span className={item.ready ? "text-xs text-emerald-700" : "text-xs text-amber-700"}>
                {item.ready ? "ready" : "needs setup"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{item.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
