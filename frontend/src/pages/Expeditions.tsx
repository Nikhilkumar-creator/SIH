import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../lib/apiService';
import { useAuth } from '../lib/AuthProvider';
import type { Expedition, PolarRegion, PolarStation } from '../types/domain';
import {
  Compass,
  MapPin,
  Calendar,
  Plus,
  X,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const Expeditions: React.FC = () => {
  const { session, profile } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [stations, setStations] = useState<PolarStation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<PolarRegion | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for new expedition
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRegion, setNewRegion] = useState<PolarRegion>('Antarctic');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newStation, setNewStation] = useState('Maitri');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expList] = await Promise.all([apiService.getExpeditions()]);
      setExpeditions(expList);
      setStations(apiService.getStations());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpedition = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.createExpedition({
        title: newTitle,
        region: newRegion,
        start_date: newStartDate,
        end_date: newEndDate || null,
        station: newStation,
        description: newDescription,
        created_by: profile?.id,
      });
      setModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewStartDate('');
      setNewEndDate('');
      loadData();
    } catch (err) {
      alert('Failed to register expedition.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExpeditions = expeditions.filter((exp) => {
    const matchesRegion = selectedRegion === 'All' || exp.region === selectedRegion;
    const matchesQuery =
      !searchQuery.trim() ||
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesQuery;
  });

  const canCreate = session && (profile?.role === 'researcher' || profile?.role === 'editor' || profile?.role === 'admin');

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Field Operations & Polar Stations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Indian Polar Expeditions Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Records of Indian scientific campaigns deployed to Antarctica, the Arctic Circle, the high
            Himalayas, and the Southern Ocean under the Ministry of Earth Sciences.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register New Expedition
          </button>
        )}
      </div>

      {/* Permanent Stations Showcase */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600" />
          Permanent Research Bases & Outposts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stations.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {st.region}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {st.operational_status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{st.name}</h3>
                <p className="text-[11px] font-mono text-cyan-700 mb-2">{st.coordinates}</p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{st.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Established: {st.established}</span>
                <span className="truncate max-w-[120px]">{st.location_name.split(',')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Expeditions List & Filter */}
      <section className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search expeditions by title or objectives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Region Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="All">All Polar Regions</option>
                <option value="Antarctic">Antarctica</option>
                <option value="Arctic">Arctic</option>
                <option value="Himalayas">Himalayas</option>
                <option value="Southern Ocean">Southern Ocean</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expeditions Cards */}
        {loading ? (
          <p className="text-xs text-slate-500 py-12 text-center">Loading expedition logs…</p>
        ) : filteredExpeditions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No expeditions found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredExpeditions.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-cyan-400 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {exp.region}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        exp.status === 'Ongoing'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {exp.status === 'Ongoing' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {exp.status || 'Completed'}
                    </span>
                  </div>

                  <Link to={`/expeditions/${exp.id}`}>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-600 transition-colors leading-snug mb-2">
                      {exp.title}
                    </h3>
                  </Link>

                  <div className="text-xs text-slate-400 flex items-center gap-2 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {exp.start_date} {exp.end_date ? `to ${exp.end_date}` : '(Ongoing Mission)'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {exp.description || 'No detailed mission description available.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {exp.asset_count ?? 0} research assets recorded
                  </span>
                  <Link
                    to={`/expeditions/${exp.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 group-hover:text-cyan-800"
                  >
                    View Mission Dossier <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New Expedition Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-600" /> Register New Expedition
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpedition} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expedition Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45th Indian Scientific Expedition to Antarctica"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Polar Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="Antarctic">Antarctica</option>
                    <option value="Arctic">Arctic</option>
                    <option value="Himalayas">Himalayas</option>
                    <option value="Southern Ocean">Southern Ocean</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Base / Vessel</label>
                  <input
                    type="text"
                    placeholder="Maitri, Bharati, Himadri..."
                    value={newStation}
                    onChange={(e) => setNewStation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    End Date (Leave blank if ongoing)
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mission Objectives</label>
                <textarea
                  rows={3}
                  placeholder="Summary of scientific goals, field transects, and teams deployed..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                >
                  {submitting ? 'Registering…' : 'Register Expedition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
