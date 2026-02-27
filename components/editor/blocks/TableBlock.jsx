import { GripVertical } from 'lucide-react'

export default function TableBlock({ block, onUpdate, onDelete, onDragHandleDown, onDragHandleUp }) { // Naye props add kiye
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

    return (
        <div className="group flex items-start gap-2 my-6 relative w-full">

            {/* --- DRAG HANDLE ADD KIYA --- */}
            <div
                className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 cursor-grab text-[#9b9a97] hover:bg-[#e9e9e7] rounded w-5 h-6 flex items-center justify-center transition-all z-10"
                onMouseDown={onDragHandleDown}
                onMouseUp={onDragHandleUp}
                onMouseLeave={onDragHandleUp}
                onTouchStart={onDragHandleDown}
                onTouchEnd={onDragHandleUp}
            >
                <GripVertical size={14} />
            </div>

            {/* Table Container - overflow iske andar rakha hai taaki drag handle na kate */}
            <div className="flex-1 w-full overflow-x-auto rounded-lg border border-[#e9e9e7] shadow-sm">
                <table className="w-full border-collapse text-sm text-[#37352f] min-w-[300px]">
                    <thead className="bg-[#f7f7f5] border-b border-[#e9e9e7]">
                        <tr>
                            {rows[0]?.map((cell, cIdx) => {
                                const isLastCol = cIdx === rows[0].length - 1;
                                return (
                                    <th key={`head-${cIdx}`} className="group/cell p-2 text-left font-semibold border-r border-[#e9e9e7] last:border-r-0 relative min-w-[120px]">
                                        <input
                                            value={cell}
                                            onChange={e => updateCell(0, cIdx, e.target.value)}
                                            className="w-full bg-transparent focus:outline-none font-semibold placeholder:font-normal placeholder:text-[#9b9a97] pr-12"
                                            placeholder="Header..."
                                        />
                                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover/cell:opacity-100 z-10">
                                            {rows[0].length > 1 && (
                                                <button
                                                    onClick={() => deleteCol(cIdx)}
                                                    className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded border border-red-100 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                                                    title="Delete Column"
                                                >
                                                    Col ×
                                                </button>
                                            )}
                                            {isLastCol && rows.length > 1 && (
                                                <button
                                                    onClick={() => deleteRow(0)}
                                                    className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-500 rounded border border-orange-100 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                                                    title="Delete Row"
                                                >
                                                    Row ×
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
                                <tr key={`row-${actualRowIndex}`} className="border-b border-[#e9e9e7] last:border-b-0 hover:bg-[#f9f9f8]/50 transition-colors">
                                    {row.map((cell, cIdx) => {
                                        const isLastCol = cIdx === row.length - 1;
                                        return (
                                            <td key={`cell-${actualRowIndex}-${cIdx}`} className="group/cell p-2 border-r border-[#e9e9e7] last:border-r-0 relative min-w-[120px]">
                                                <input
                                                    value={cell}
                                                    onChange={e => updateCell(actualRowIndex, cIdx, e.target.value)}
                                                    className="w-full bg-transparent focus:outline-none placeholder:text-[#e9e9e7] pr-12"
                                                    placeholder="..."
                                                />
                                                {isLastCol && rows.length > 1 && (
                                                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover/cell:opacity-100 z-10">
                                                        <button
                                                            onClick={() => deleteRow(actualRowIndex)}
                                                            className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-500 rounded border border-orange-100 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
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

                {/* Bottom Controls */}
                <div className="flex gap-2 p-2 bg-white border-t border-[#e9e9e7]">
                    <button onClick={addRow} className="text-[10px] font-medium text-[#9b9a97] hover:bg-[#efefef] hover:text-[#37352f] px-2 py-1 rounded border border-[#e9e9e7] transition-colors">
                        + Add Row
                    </button>
                    <button onClick={addCol} className="text-[10px] font-medium text-[#9b9a97] hover:bg-[#efefef] hover:text-[#37352f] px-2 py-1 rounded border border-[#e9e9e7] transition-colors">
                        + Add Column
                    </button>
                    <button onClick={onDelete} className="text-[10px] font-medium text-red-400 hover:bg-red-50 hover:text-red-500 px-2 py-1 rounded border border-red-100 ml-auto transition-colors">
                        Delete Table
                    </button>
                </div>
            </div>
        </div>
    );
}