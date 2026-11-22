import { useState, useEffect } from "react";
import { ToggleSwitch } from "./ToggleSwitch";
import type {
    AdminStockItem,
    CreateStockInput,
    UpdateStockInput,
    InstrumentType,
} from "@/types/adminStock";

interface AdminStockModalProps {
    isOpen: boolean;
    mode: "create" | "edit";
    stock?: AdminStockItem | null;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmitCreate: (payload: CreateStockInput) => Promise<void>;
    onSubmitUpdate: (
        stockId: string,
        metadataPayload: UpdateStockInput,
        statusPayload: { isActive: boolean; isTradable: boolean }
    ) => Promise<void>;
}

export function AdminStockModal({
    isOpen,
    mode,
    stock,
    isSubmitting = false,
    onClose,
    onSubmitCreate,
    onSubmitUpdate,
}: AdminStockModalProps) {
    const isEdit = mode === "edit";

    // Form state
    const [symbol, setSymbol] = useState("");
    const [name, setName] = useState("");
    const [exchange, setExchange] = useState("NSE");
    const [sector, setSector] = useState("");
    const [type, setType] = useState<InstrumentType>("EQUITY");
    const [feedSymbol, setFeedSymbol] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isTradable, setIsTradable] = useState(true);

    // Validation errors
    const [errors, setErrors] = useState<{
        symbol?: string;
        name?: string;
        exchange?: string;
    }>({});

    // Populate or reset form when modal opens or stock changes
    useEffect(() => {
        if (!isOpen) return;

        if (isEdit && stock) {
            setSymbol(stock.symbol);
            setName(stock.name);
            setExchange(stock.exchange || "NSE");
            setSector(stock.sector || "");
            setType(stock.type);
            setFeedSymbol(stock.feedSymbol || "");
            setIsActive(stock.isActive);
            setIsTradable(stock.type === "INDEX" ? false : stock.isTradable);
        } else {
            setSymbol("");
            setName("");
            setExchange("NSE");
            setSector("");
            setType("EQUITY");
            setFeedSymbol("");
            setIsActive(true);
            setIsTradable(true);
        }
        setErrors({});
    }, [isOpen, isEdit, stock]);

    if (!isOpen) return null;

    // Handle Type Change: If INDEX is selected, enforce isTradable = false
    const handleTypeChange = (newType: InstrumentType) => {
        setType(newType);
        if (newType === "INDEX") {
            setIsTradable(false);
        } else if (type === "INDEX" && newType === "EQUITY") {
            setIsTradable(true);
        }
    };

    const validate = () => {
        const newErrors: { symbol?: string; name?: string; exchange?: string } = {};

        if (!isEdit && !symbol.trim()) {
            newErrors.symbol = "Symbol is required (e.g. RELIANCE, TCS)";
        }
        if (!name.trim()) {
            newErrors.name = "Company or instrument name is required";
        }
        if (!exchange.trim()) {
            newErrors.exchange = "Exchange identifier is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || isSubmitting) return;

        const cleanSymbol = symbol.trim().toUpperCase();
        const cleanName = name.trim();
        const cleanExchange = exchange.trim().toUpperCase();
        const cleanSector = sector.trim() || undefined;
        const cleanFeedSymbol = feedSymbol.trim() || undefined;
        const finalIsTradable = type === "INDEX" ? false : isTradable;

        if (isEdit && stock) {
            await onSubmitUpdate(
                stock.id,
                {
                    name: cleanName,
                    exchange: cleanExchange,
                    sector: cleanSector,
                    type,
                    feedSymbol: cleanFeedSymbol,
                },
                {
                    isActive,
                    isTradable: finalIsTradable,
                }
            );
        } else {
            await onSubmitCreate({
                symbol: cleanSymbol,
                name: cleanName,
                exchange: cleanExchange,
                sector: cleanSector,
                type,
                feedSymbol: cleanFeedSymbol,
                isActive,
                isTradable: finalIsTradable,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-xl rounded-2xl bg-panel border border-border-muted shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="px-6 py-4.5 border-b border-border-muted flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-text-primary">
                            {isEdit ? "Edit Instrument Metadata" : "Register New Instrument"}
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5">
                            {isEdit
                                ? `Update trading parameters and feed mapping for ${stock?.symbol}`
                                : "Add an equity or index instrument to the master catalog"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-panel-2 transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-6 space-y-4.5 flex-1">
                    {/* Symbol & Exchange Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Symbol */}
                        <div>
                            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                                Symbol <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                disabled={isEdit}
                                placeholder="e.g. RELIANCE, NIFTY 50"
                                className={`w-full bg-panel-2 border rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-green transition-colors uppercase font-mono ${
                                    isEdit ? "opacity-60 cursor-not-allowed bg-muted/40" : ""
                                } ${errors.symbol ? "border-red" : "border-border-muted"}`}
                            />
                            {errors.symbol && <p className="mt-1 text-[11px] text-red">{errors.symbol}</p>}
                            {isEdit && (
                                <p className="mt-1 text-[10px] text-text-secondary/70">
                                    Symbol is immutable after registration.
                                </p>
                            )}
                        </div>

                        {/* Exchange */}
                        <div>
                            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                                Exchange <span className="text-red">*</span>
                            </label>
                            <select
                                value={exchange}
                                onChange={(e) => setExchange(e.target.value)}
                                className={`w-full bg-panel-2 border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary-green transition-colors cursor-pointer ${
                                    errors.exchange ? "border-red" : "border-border-muted"
                                }`}
                            >
                                <option value="NSE">NSE (National Stock Exchange)</option>
                                <option value="BSE">BSE (Bombay Stock Exchange)</option>
                                <option value="MCX">MCX (Commodity)</option>
                            </select>
                            {errors.exchange && <p className="mt-1 text-[11px] text-red">{errors.exchange}</p>}
                        </div>
                    </div>

                    {/* Company / Instrument Name */}
                    <div>
                        <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                            Company / Instrument Name <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Reliance Industries Ltd or Nifty 50 Index"
                            className={`w-full bg-panel-2 border rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-green transition-colors ${
                                errors.name ? "border-red" : "border-border-muted"
                            }`}
                        />
                        {errors.name && <p className="mt-1 text-[11px] text-red">{errors.name}</p>}
                    </div>

                    {/* Type Selection (Radio Pills) */}
                    <div>
                        <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                            Instrument Type <span className="text-red">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleTypeChange("EQUITY")}
                                className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                    type === "EQUITY"
                                        ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                                        : "bg-panel-2 border-border-muted text-text-secondary hover:text-text-primary"
                                }`}
                            >
                                <div>
                                    <div className="font-semibold text-xs">EQUITY</div>
                                    <div className="text-[10px] text-text-secondary mt-0.5">Tradable stock / shares</div>
                                </div>
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    type === "EQUITY" ? "border-cyan-400 bg-cyan-400" : "border-border-muted"
                                }`}>
                                    {type === "EQUITY" && <div className="w-1.5 h-1.5 rounded-full bg-panel" />}
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeChange("INDEX")}
                                className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                    type === "INDEX"
                                        ? "bg-purple-500/10 border-purple-500/50 text-purple-400"
                                        : "bg-panel-2 border-border-muted text-text-secondary hover:text-text-primary"
                                }`}
                            >
                                <div>
                                    <div className="font-semibold text-xs">INDEX</div>
                                    <div className="text-[10px] text-text-secondary mt-0.5">Benchmark (view-only)</div>
                                </div>
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    type === "INDEX" ? "border-purple-400 bg-purple-400" : "border-border-muted"
                                }`}>
                                    {type === "INDEX" && <div className="w-1.5 h-1.5 rounded-full bg-panel" />}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Sector */}
                    <div>
                        <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                            Sector (Industry Category)
                        </label>
                        <input
                            type="text"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            placeholder="e.g. Energy & Petrochemicals, Banking, Automobile, IT"
                            className="w-full bg-panel-2 border border-border-muted rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-green transition-colors"
                        />
                    </div>

                    {/* Broker Feed Symbol */}
                    <div>
                        <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                            Broker Feed Symbol (Ticker Mapping)
                        </label>
                        <input
                            type="text"
                            value={feedSymbol}
                            onChange={(e) => setFeedSymbol(e.target.value)}
                            placeholder="e.g. NSE:TMCV-EQ or 256265"
                            className="w-full bg-panel-2 border border-border-muted rounded-lg px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-green transition-colors"
                        />
                        <p className="mt-1 text-[11px] text-text-secondary">
                            Specify broker ticker if different from standard symbol, e.g. <span className="font-mono text-text-primary">NSE:TMCV-EQ</span>
                        </p>
                    </div>

                    {/* Risk & Operational Controls */}
                    <div className="pt-2 border-t border-border-muted space-y-3.5">
                        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                            Operational & Risk Controls
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-panel-2 border border-border-muted">
                            <div className="pr-3">
                                <div className="text-xs font-medium text-text-primary">Is Active</div>
                                <div className="text-[11px] text-text-secondary mt-0.5">
                                    When active, instrument appears in searches, watchlists, and market overview.
                                </div>
                            </div>
                            <ToggleSwitch checked={isActive} onChange={setIsActive} size="md" />
                        </div>

                        {/* Tradable Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-panel-2 border border-border-muted">
                            <div className="pr-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-text-primary">Is Tradable</span>
                                    {type === "INDEX" && (
                                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400">
                                            Locked for Index
                                        </span>
                                    )}
                                </div>
                                <div className="text-[11px] text-text-secondary mt-0.5">
                                    {type === "INDEX" ? (
                                        <span className="text-amber-400/90 font-medium">
                                            Indices are view-only and cannot be traded.
                                        </span>
                                    ) : (
                                        "Enables buy & sell order placement in regular and AMO trading sessions."
                                    )}
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={type === "INDEX" ? false : isTradable}
                                onChange={setIsTradable}
                                disabled={type === "INDEX"}
                                disabledTooltip="Indices are view-only and cannot be traded"
                                size="md"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-border-muted flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg border border-border-muted bg-panel-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-primary-green hover:bg-primary-green-hover text-white text-xs font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            )}
                            <span>{isEdit ? "Save Changes" : "Create Instrument"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
