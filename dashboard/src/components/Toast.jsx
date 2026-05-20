import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

const icons = {
    success: <CheckCircle2 className="text-emerald-400" size={20} />,
    error: <XCircle className="text-rose-400" size={20} />,
    warning: <AlertTriangle className="text-amber-400" size={20} />,
    info: <Info className="text-sky-400" size={20} />
};

const styles = {
    success: 'border-emerald-500/20 bg-emerald-500/5',
    error: 'border-rose-500/20 bg-rose-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    info: 'border-sky-500/20 bg-sky-500/5'
};

const Toast = ({ type, title, message, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={clsx(
                "w-80 p-4 rounded-2xl border backdrop-blur-xl pointer-events-auto shadow-2xl relative group overflow-hidden",
                styles[type]
            )}
        >
            {/* Ambient Background Glow */}
            <div className={clsx(
                "absolute -top-10 -right-10 w-24 h-24 blur-[40px] opacity-20 transition-all duration-500 group-hover:scale-150",
                type === 'success' && 'bg-emerald-500',
                type === 'error' && 'bg-rose-500',
                type === 'warning' && 'bg-amber-500',
                type === 'info' && 'bg-sky-500'
            )} />

            <div className="flex gap-3 relative z-10">
                <div className="shrink-0 pt-0.5">
                    {icons[type]}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm tracking-tight">{title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 text-slate-600 hover:text-white transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Progress Bar (Timer) */}
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className={clsx(
                    "absolute bottom-0 left-0 h-0.5 opacity-40",
                    type === 'success' && 'bg-emerald-500',
                    type === 'error' && 'bg-rose-500',
                    type === 'warning' && 'bg-amber-500',
                    type === 'info' && 'bg-sky-500'
                )}
            />
        </motion.div>
    );
};

export default Toast;
