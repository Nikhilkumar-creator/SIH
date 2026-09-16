import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../lib/apiService';
import { Shield, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  const [health, setHealth] = useState<{
    backendOnline: boolean;
    supabaseOnline: boolean;
    activeModel: string;
  }>({
    backendOnline: false,
    supabaseOnline: false,
    activeModel: 'llama3 (local)',
  });

  useEffect(() => {
    apiService.getSystemHealth().then(setHealth).catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-12 pb-8 mt-20 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Institutional Info */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-3">
              <span className="text-cyan-400 text-xl">❄</span>
              <span>NCPOR Polar Science</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 mb-4">
              Autonomous Institute under the Ministry of Earth Sciences (MoES), Government of India.
              Nodal agency for Indian Antarctic, Arctic, Cryosphere, and Southern Ocean programmes.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Headland Sada, Vasco-da-Gama, Goa 403804</span>
            </div>
          </div>

          {/* Polar Stations Directory */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Permanent Stations
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className="text-slate-300">Maitri (Antarctica)</span>
                <span className="text-slate-400 font-mono">Est. 1989</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-300">Bharati (Antarctica)</span>
                <span className="text-slate-400 font-mono">Est. 2012</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-300">Himadri (Arctic, Svalbard)</span>
                <span className="text-slate-400 font-mono">Est. 2008</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-300">Himansh (Western Himalayas)</span>
                <span className="text-slate-400 font-mono">Est. 2016</span>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Portal Directory
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/repository" className="hover:text-cyan-400 transition-colors">
                  Scientific Data & Asset Repository
                </Link>
              </li>
              <li>
                <Link to="/articles" className="hover:text-cyan-400 transition-colors">
                  Public Science Outreach Articles
                </Link>
              </li>
              <li>
                <Link to="/expeditions" className="hover:text-cyan-400 transition-colors">
                  Polar Expedition Archives
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-cyan-400 transition-colors">
                  AI Document Ingestion Studio
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-cyan-400 transition-colors">
                  Editorial Review Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Engine & Live Status */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Infrastructure & AI Status
            </h4>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Data Layer</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">AI Ingestion</span>
                <span
                  className={`flex items-center gap-1.5 font-medium ${
                    health.backendOnline ? 'text-emerald-400' : 'text-cyan-400'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  {health.backendOnline ? 'FastAPI (Online)' : 'Resilient Local'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                LLM Inference: <span className="text-slate-300">{health.activeModel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400 text-center sm:text-left">
            © {new Date().getFullYear()} National Centre for Polar and Ocean Research (NCPOR), MoES, Govt. of India.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-cyan-400 cursor-pointer">Open Access Policy</span>
            <span>•</span>
            <span className="hover:text-cyan-400 cursor-pointer">Data Citation Standards</span>
            <span>•</span>
            <span className="hover:text-cyan-400 cursor-pointer">SCAR / IASC Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
