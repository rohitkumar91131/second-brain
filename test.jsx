import React from 'react';

export default function Test() {
    return (
        <div>
            {/* Tabs Bar */}
            <div className="flex">
                <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
                    {openTabs.map(tab => {
                        const isActive = activeTabId === tab.id
                        return (
                            <div
                                key={tab.id}
                            >
                            </div>
                        )
                    })}
                </div>
            </div>

            {!activeTabId ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center animate-in fade-in duration-700">
                    </div>
                </div>
            ) : null}

        </div>
    )
}
