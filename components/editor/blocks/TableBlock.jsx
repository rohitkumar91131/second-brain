import { useState, useEffect } from 'react'
import { GripVertical, Maximize2, X } from 'lucide-react'

export default function TableBlock({ block, onUpdate, onDelete, onDragHandleDown, onDragHandleUp }) { // Naye props add kiye
    const [isExpanded, setIsExpanded] = useState(false);
    let rows = [['', ''], ['', '']];

    try {
        if (block.content) {
            const parsed = JSON.parse(block.content);
            if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
                rows = parsed;
            }
        }
    } catch (e) {
        if (block.content && block.content !== '/') {
            rows[0][0] = block.content.replace(/^\//, '');
        }
    }

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsExpanded(false)
        }
        if (isExpanded) {
            window.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            window.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = 'unset'
        }
    }, [isExpanded])

    const updateCell = (r, c, val) => {
        const newRows = rows.map((row, rowIndex) => {
            if (rowIndex === r) {
                const newRow = [...row];
                newRow[c] = val;
                return newRow;
            }
            return row;
        });
        onUpdate({ content: JSON.stringify(newRows) });
    };

    const addRow = () => {
        const colsCount = rows[0] ? rows[0].length : 2;
        const newRows = [...rows, new Array(colsCount).fill('')];
        onUpdate({ content: JSON.stringify(newRows) });
    };

    const addCol = () => {
        const newRows = rows.map(row => [...row, '']);
        onUpdate({ content: JSON.stringify(newRows) });
    };

    const deleteRow = (rIdx) => {
        if (rows.length <= 1) return; // Ek row hamesha bachi rahegi
        const newRows = rows.filter((_, idx) => idx !== rIdx);
        onUpdate({ content: JSON.stringify(newRows) });
    };

    const deleteCol = (cIdx) => {
        if (rows[0].length <= 1) return; // Ek column hamesha bacha rahega
        const newRows = rows.map(row => row.filter((_, idx) => idx !== cIdx));
        onUpdate({ content: JSON.stringify(newRows) });
    };

    const TableContent = ({ isFull = false }) => (
        <div className={`flex flex-col ${isFull ? 'h-full' : 'w-full'}`}>
            <div className={`overflow-x-auto ${isFull ? 'flex-1 p-4' : 'rounded-lg border border-notion-border shadow-sm'}`}>
                <table className={`w-full border-collapse text-sm text-notion-text ${isFull ? 'min-w-[500px]' : 'min-w-[300px]'}`}>
                    <thead className="bg-notion-sidebar border-b border-notion-border sticky top-0 z-20">
                        <tr>
                            {rows[0]?.map((cell, cIdx) => {
                                return (
                                    <th key={`head-${cIdx}`} className="group/cell p-2 text-left font-semibold border-r border-notion-border last:border-r-0 relative min-w-[120px]">
                                        <input
                                            value={cell}
                                            onChange={e => updateCell(0, cIdx, e.target.value)}
                                            className="w-full bg-transparent focus:outline-none font-semibold placeholder:font-normal placeholder:text-notion-muted pr-12"
                                            placeholder="Header..."
                                        />
                                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover/cell:opacity-100 z-10 transition-opacity">
                                            {rows[0].length > 1 && (
                                                <button
                                                    onClick={() => deleteCol(cIdx)}
                                                    className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded border border-red-100 hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Delete Column"
                                                >
                                                    Col ×
                                                </button>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.slice(1).map((row, rIdx) => {
                            const actualRowIndex = rIdx + 1;
                            return (
                                <tr key={`row-${actualRowIndex}`} className="border-b border-notion-border last:border-b-0 hover:bg-[#f9f9f8]/50 transition-colors">
                                    {row.map((cell, cIdx) => {
                                        const isLastCol = cIdx === row.length - 1;
                                        return (
                                            <td key={`cell-${actualRowIndex}-${cIdx}`} className="group/cell p-2 border-r border-notion-border last:border-r-0 relative min-w-[120px]">
                                                <input
                                                    value={cell}
                                                    onChange={e => updateCell(actualRowIndex, cIdx, e.target.value)}
                                                    className="w-full bg-transparent focus:outline-none placeholder:text-[#e9e9e7] pr-12"
                                                    placeholder="..."
                                                />
                                                {isLastCol && rows.length > 1 && (
                                                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover/cell:opacity-100 z-10 transition-opacity">
                                                        <button
                                                            onClick={() => deleteRow(actualRowIndex)}
                                                            className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-500 rounded border border-orange-100 hover:bg-orange-500 hover:text-white transition-colors"
                                                            title="Delete Row"
                                                        >
                                                            Row ×
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className={`flex flex-wrap gap-2 p-3 bg-notion-bg border-t border-notion-border ${isFull ? 'mt-auto' : ''}`}>
                <button onClick={addRow} className="text-[10px] font-medium text-notion-muted hover:bg-notion-hover hover:text-notion-text px-2 py-1 rounded border border-notion-border transition-colors">
                    + Add Row
                </button>
                <button onClick={addCol} className="text-[10px] font-medium text-notion-muted hover:bg-notion-hover hover:text-notion-text px-2 py-1 rounded border border-notion-border transition-colors">
                    + Add Column
                </button>
                {!isFull && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="text-[10px] font-medium text-notion-muted hover:bg-notion-hover hover:text-notion-text px-2 py-1 rounded border border-notion-border transition-colors flex items-center gap-1.5"
                    >
                        <Maximize2 size={10} /> Expand
                    </button>
                )}
                <button onClick={onDelete} className="text-[10px] font-medium text-red-400 hover:bg-red-50 hover:text-red-500 px-2 py-1 rounded border border-red-100 ml-auto transition-colors">
                    Delete Table
                </button>
            </div>
        </div>
    );

    return (
        <div className="group flex items-start gap-2 my-6 relative w-full">

            {/* --- DRAG HANDLE ADD KIYA --- */}
            <div
                className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 cursor-grab text-notion-muted hover:bg-notion-border rounded w-5 h-6 flex items-center justify-center transition-all z-10"
                onMouseDown={onDragHandleDown}
                onMouseUp={onDragHandleUp}
                onMouseLeave={onDragHandleUp}
                onTouchStart={onDragHandleDown}
                onTouchEnd={onDragHandleUp}
            >
                <GripVertical size={14} />
            </div>

            {/* Table Container - overflow iske andar rakha hai taaki drag handle na kate */}
            <TableContent />

            {isExpanded && (
                <div className="fixed inset-0 z-[10000] bg-white dark:bg-[#191919] flex flex-col animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-notion-border bg-notion-sidebar/30">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-notion-text">Table Editor</span>
                            <span className="text-[10px] uppercase tracking-widest text-notion-muted bg-notion-border px-1.5 py-0.5 rounded font-bold">Full View</span>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 hover:bg-notion-hover rounded-full transition-colors text-notion-muted hover:text-notion-text"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <TableContent isFull={true} />
                    </div>

                    <div className="p-4 border-t border-notion-border bg-notion-sidebar/30 flex justify-end">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}