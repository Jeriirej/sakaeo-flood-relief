import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Dashboard Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
          <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl w-full max-w-md shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                เกิดข้อผิดพลาดในการแสดงผลหน้าผู้ดูแลระบบ
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ระบบหลักของประชาชนยังทำงานได้ปกติ ข้อมูลปลอดภัย ไม่สูญหาย
              </p>
              {this.state.error && (
                <p className="text-[11px] font-mono text-rose-300 bg-rose-950/40 p-2 rounded-xl mt-2 truncate">
                  {this.state.error.message || String(this.state.error)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีเฟรชหน้าเว็บ</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>ปิดหน้าต่างนี้</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
