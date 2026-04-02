'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { SessionType } from '@/lib/types';
import { sampleSessionTypes } from '@/lib/sample-data';

interface SessionTypeForm {
  name: string;
  duration_min: number;
  default_capacity: number;
  default_price_adult: string;
  default_price_child: string;
  default_price_family: string;
  color_hex: string;
  description: string;
}

const emptyForm: SessionTypeForm = {
  name: '',
  duration_min: 90,
  default_capacity: 20,
  default_price_adult: '',
  default_price_child: '',
  default_price_family: '',
  color_hex: '#00A3E0',
  description: '',
};

export default function SessionTypesPage() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<SessionTypeForm>(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionTypes();
  }, []);

  async function loadSessionTypes() {
    try {
      const res = await fetch('/api/admin/session-types');
      if (res.ok) {
        setSessionTypes(await res.json());
      } else {
        setSessionTypes(sampleSessionTypes);
      }
    } catch {
      setSessionTypes(sampleSessionTypes);
    }
    setLoading(false);
  }

  function startEdit(st: SessionType) {
    setEditing(st.id);
    setCreating(false);
    setForm({
      name: st.name,
      duration_min: st.duration_min,
      default_capacity: st.default_capacity,
      default_price_adult: st.default_price_adult?.toString() ?? '',
      default_price_child: st.default_price_child?.toString() ?? '',
      default_price_family: st.default_price_family?.toString() ?? '',
      color_hex: st.color_hex,
      description: st.description ?? '',
    });
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
  }

  function cancel() {
    setCreating(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function save() {
    const payload = {
      ...form,
      default_price_adult: form.default_price_adult ? parseFloat(form.default_price_adult) : null,
      default_price_child: form.default_price_child ? parseFloat(form.default_price_child) : null,
      default_price_family: form.default_price_family ? parseFloat(form.default_price_family) : null,
    };

    try {
      if (creating) {
        const res = await fetch('/api/admin/session-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await loadSessionTypes();
        }
      } else if (editing) {
        const res = await fetch(`/api/admin/session-types/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await loadSessionTypes();
        }
      }
    } catch {
      // Will work once Supabase is connected
    }

    cancel();
  }

  async function deleteType(id: string) {
    if (!confirm('Are you sure you want to deactivate this session type?')) return;
    try {
      await fetch(`/api/admin/session-types/${id}`, { method: 'DELETE' });
      await loadSessionTypes();
    } catch {
      // Will work once Supabase is connected
    }
  }

  const formFields = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-frost rounded-xl">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
          placeholder="e.g., Open Skate — General"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
        <input
          type="number"
          value={form.duration_min}
          onChange={(e) => setForm({ ...form, duration_min: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Default Capacity</label>
        <input
          type="number"
          value={form.default_capacity}
          onChange={(e) => setForm({ ...form, default_capacity: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Adult Price ($)</label>
        <input
          type="number"
          step="0.01"
          value={form.default_price_adult}
          onChange={(e) => setForm({ ...form, default_price_adult: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
          placeholder="Leave blank if N/A"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Child Price ($)</label>
        <input
          type="number"
          step="0.01"
          value={form.default_price_child}
          onChange={(e) => setForm({ ...form, default_price_child: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
          placeholder="Leave blank if N/A"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Family Price ($)</label>
        <input
          type="number"
          step="0.01"
          value={form.default_price_family}
          onChange={(e) => setForm({ ...form, default_price_family: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
          placeholder="Leave blank if N/A"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={form.color_hex}
            onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
          />
          <input
            type="text"
            value={form.color_hex}
            onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono min-h-[44px]"
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[80px]"
          placeholder="Optional description..."
        />
      </div>
      <div className="sm:col-span-2 flex gap-2 justify-end">
        <button
          onClick={cancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 min-h-[44px]"
        >
          <X className="w-4 h-4 inline mr-1" />
          Cancel
        </button>
        <button
          onClick={save}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-ice-blue text-white hover:bg-ice-blue-dark min-h-[44px]"
        >
          <Check className="w-4 h-4 inline mr-1" />
          {creating ? 'Create' : 'Save'}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Session Types</h1>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-1 bg-ice-blue text-white font-medium text-sm px-4 py-2 rounded-lg min-h-[44px] hover:bg-ice-blue-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Type
        </button>
      </div>

      {creating && formFields}

      <div className="space-y-3 mt-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />
          ))
        ) : (
          sessionTypes.map((st) => (
            <div key={st.id}>
              {editing === st.id ? (
                formFields
              ) : (
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                  <div
                    className="w-4 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: st.color_hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy">{st.name}</div>
                    <div className="text-sm text-gray-500">
                      {st.duration_min} min &middot; Capacity: {st.default_capacity}
                      {st.default_price_adult !== null && ` · $${st.default_price_adult} adult`}
                      {st.default_price_child !== null && ` · $${st.default_price_child} child`}
                      {st.default_price_family !== null && ` · $${st.default_price_family} family`}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(st)}
                      className="p-2 rounded-lg hover:bg-frost min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteType(st.id)}
                      className="p-2 rounded-lg hover:bg-red/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
