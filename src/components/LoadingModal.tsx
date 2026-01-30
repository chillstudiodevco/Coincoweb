import React from 'react';

interface LoadingModalProps {
    isOpen: boolean;
    message?: string;
}

export default function LoadingModal({ isOpen, message = 'Procesando...' }: LoadingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center max-w-sm w-full animate-fadeIn">

                {/* Spinner Container */}
                <div className="relative mb-6">
                    {/* Outer Ring */}
                    <div
                        className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100"
                        style={{ borderTopColor: '#006935' }}
                    ></div>

                    {/* Inner Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-circle-notch text-xl text-green-600 animate-pulse"></i>
                    </div>
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                    Por favor espere
                </h3>

                <p className="text-gray-600 text-center text-sm">
                    {message}
                </p>

                {/* Decorative dots */}
                <div className="flex space-x-1 mt-4">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
}
