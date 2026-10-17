import { FC, useState } from 'react';
import { Download, X, Smartphone, Monitor, CheckCircle2, Share, PlusSquare, Compass, Chrome } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmInstall?: () => void;
  isInstallable: boolean;
}

export const InstallGuideModal: FC<Props> = ({ isOpen, onClose, onConfirmInstall, isInstallable }) => {
  const [activeTab, setActiveTab] = useState<'MOBILE' | 'DESKTOP' | 'IOS'>('MOBILE');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Install BoostPay App</h3>
              <p className="text-xs text-zinc-400">Add to your Home Screen for instant 24/7 access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Direct Install Button if supported */}
          {isInstallable && onConfirmInstall && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-center space-y-3">
              <p className="text-xs text-amber-200 font-medium">
                Your browser supports one-click instant installation!
              </p>
              <button
                onClick={() => {
                  onConfirmInstall();
                  onClose();
                }}
                className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-zinc-950 hover:bg-amber-400 active:scale-[0.99] transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Install BoostPay Now
              </button>
            </div>
          )}

          {/* Platform Switcher Tabs */}
          <div className="flex rounded-2xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              onClick={() => setActiveTab('MOBILE')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'MOBILE' ? 'bg-amber-500 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android / Chrome</span>
            </button>
            <button
              onClick={() => setActiveTab('IOS')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'IOS' ? 'bg-amber-500 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>iPhone / Safari</span>
            </button>
            <button
              onClick={() => setActiveTab('DESKTOP')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'DESKTOP' ? 'bg-amber-500 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC / Mac</span>
            </button>
          </div>

          {/* Instructions Cards */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3.5 text-xs">
            {activeTab === 'MOBILE' && (
              <>
                <div className="font-bold text-white flex items-center gap-2">
                  <Chrome className="w-4 h-4 text-amber-400" />
                  <span>Installing on Android (Chrome / Brave / Edge)</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                  <li>Tap the browser menu icon (three vertical dots <span className="text-amber-400 font-bold">⋮</span>) in the top right.</li>
                  <li>Select <span className="text-white font-semibold">"Install app"</span> or <span className="text-white font-semibold">"Add to Home screen"</span>.</li>
                  <li>Confirm by tapping <span className="text-white font-semibold">"Install"</span>. The BoostPay app icon will appear on your device home screen!</li>
                </ol>
              </>
            )}

            {activeTab === 'IOS' && (
              <>
                <div className="font-bold text-white flex items-center gap-2">
                  <Share className="w-4 h-4 text-sky-400" />
                  <span>Installing on iPhone / iPad (Safari)</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                  <li>Open this app in Safari (if opened inside another app, tap the external browser icon).</li>
                  <li>Tap the <span className="text-sky-400 font-semibold flex-inline items-center gap-1">Share button <Share className="w-3 h-3 inline" /></span> at the bottom of the screen.</li>
                  <li>Scroll down and tap <span className="text-white font-semibold flex-inline items-center gap-1">"Add to Home Screen" <PlusSquare className="w-3 h-3 inline text-amber-400" /></span>.</li>
                  <li>Tap <span className="text-white font-semibold">"Add"</span> in the top right corner.</li>
                </ol>
              </>
            )}

            {activeTab === 'DESKTOP' && (
              <>
                <div className="font-bold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  <span>Installing on Desktop (Chrome / Edge / Brave)</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                  <li>Look for the install icon (<Download className="w-3 h-3 inline text-amber-400" />) on the right side of your browser address bar.</li>
                  <li>Alternatively, click the browser menu (<span className="text-amber-400 font-bold">⋮</span>) and select <span className="text-white font-semibold">"Install BoostPay..."</span>.</li>
                  <li>Click <span className="text-white font-semibold">"Install"</span> to launch BoostPay as a standalone desktop app.</li>
                </ol>
              </>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="rounded-xl bg-zinc-800 px-5 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
