import React from "react";

const Loginoptions = () => {
    return (
        <>
            <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-4 text-gray-500 font-bold">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <button className="bg-blue-600 text-white flex items-center justify-center py-3 rounded-lg hover:bg-blue-700 transition">
                    <img src="/src/assets/facebook-logo.svg" alt="facebook-logo" />
                </button>
                <button className="border border-gray-300 flex items-center justify-center py-3 rounded-lg hover:bg-gray-100 transition">
                    <img src="/src/assets/google-logo.svg" alt="google-logo" />
                </button>
                <button className="bg-black text-white flex items-center justify-center py-3 rounded-lg hover:bg-gray-800 transition">
                    <img src="/src/assets/apple-logo.svg" alt="apple-logo" />
                </button>
            </div>
        </>
    )
}

export default Loginoptions;