import React from 'react';
import { Heart, Shield } from 'lucide-react';

export const Credits = () => {
    const ref = React.useRef(null);
    const [tampered, setTampered] = React.useState(false);

    React.useEffect(() => {
        const checkCredits = () => {
            if (!ref.current) {
                setTampered(true);
                return;
            }
            const text = ref.current.textContent.trim().toLowerCase();
            const style = window.getComputedStyle(ref.current);
            const isVisible = style.display !== 'none' && 
                              style.visibility !== 'hidden' && 
                              style.opacity !== '0' &&
                              ref.current.offsetHeight > 0 &&
                              ref.current.offsetWidth > 0;
            
            if (!text.includes('drago') || !isVisible) {
                setTampered(true);
            }
        };

        // Run immediately and then on a regular interval
        checkCredits();
        const interval = setInterval(checkCredits, 2000);
        return () => clearInterval(interval);
    }, []);

    if (tampered) {
        return (
            <div className="fixed inset-0 bg-[#030014] z-[999999] flex flex-col items-center justify-center text-center p-8 font-inter">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                    <Shield size={32} />
                </div>
                <h1 className="text-3xl font-black text-white mb-4">License Integrity Violation</h1>
                <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-6">
                    This open-source dashboard is licensed under terms requiring unmodified developer attribution. The developer credits ("Made by Drago") have been modified or hidden. Please restore the original credits in the layout to resume operations.
                </p>
                <div className="flex gap-4">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white text-black font-black rounded-xl hover:scale-105 transition-all text-xs uppercase tracking-widest">
                        Project Repository
                    </a>
                </div>
            </div>
        );
    }

    return (
        <span ref={ref} className="text-slate-500 hover:text-white transition-colors duration-300 font-bold inline-flex items-center gap-1.5 cursor-pointer select-none">
            Made with <Heart size={12} className="text-pink-600 fill-pink-600 animate-pulse" /> by Drago
        </span>
    );
};

export default Credits;
