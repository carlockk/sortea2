export default function Filters({ values, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <label className="text-sm">
        <span className="mb-1 block font-medium">Excluir duplicados</span>
        <input
          type="checkbox"
          checked={!!values.dedup}
          onChange={(e)=>onChange({ ...values, dedup: e.target.checked })}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Debe mencionar @</span>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="@usuario (opcional)"
          value={values.mustMention || ""}
          onChange={(e)=>onChange({ ...values, mustMention: e.target.value })}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Hashtag requerido</span>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="#miSorteo (opcional)"
          value={values.mustHashtag || ""}
          onChange={(e)=>onChange({ ...values, mustHashtag: e.target.value })}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Cantidad de ganadores</span>
        <input
          type="number"
          min="1"
          className="w-full rounded-lg border px-3 py-2"
          value={values.winners || 1}
          onChange={(e)=>onChange({ ...values, winners: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
