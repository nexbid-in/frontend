import {
    HORIZONTAL_LINE,
    HORIZONTAL_RAY,
    registerDrawingTool,
    type DrawContext,
    type DrawingTool,
} from "openalgo-charts/draw";

let isRegistered = false;

function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
): void {
    if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, r);
    } else {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.arcTo(x + w, y, x + w, y + radius, radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
        ctx.lineTo(x + radius, y + h);
        ctx.arcTo(x, y + h, x, y + radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }
}

function drawTradingViewPriceBadge(t: DrawContext, y: number): void {
    if (t.style.showLabels === false) {
        return;
    }

    const price = t.drawing.points[0]?.price;
    if (price === undefined || !Number.isFinite(price)) {
        return;
    }

    const priceText =
        typeof t.formatPrice === "function" ? t.formatPrice(price) : String(price);
    const dpr = t.rc.dpr || 1;
    const rightEdge = t.rc.plotWidth * dpr;

    t.ctx.save();
    try {
        const fontSize = Math.max(10, Math.round(11 * dpr));
        t.ctx.font = `600 ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

        const textMetrics = t.ctx.measureText(priceText);
        const textWidth = textMetrics.width;
        const paddingX = Math.round(6 * dpr);
        const badgeWidth = Math.round(textWidth + paddingX * 2);
        const badgeHeight = Math.round(18 * dpr);

        const badgeX = Math.max(0, Math.round(rightEdge - badgeWidth - 2 * dpr));
        const badgeY = Math.round(y - badgeHeight / 2);
        const cornerRadius = Math.round(3 * dpr);

        const badgeColor = t.style.color || t.rc.theme.lineColor || "#2962ff";
        t.ctx.fillStyle = badgeColor;
        drawRoundedRect(t.ctx, badgeX, badgeY, badgeWidth, badgeHeight, cornerRadius);
        t.ctx.fill();

        t.ctx.fillStyle = "#ffffff";
        t.ctx.textAlign = "center";
        t.ctx.textBaseline = "middle";
        t.ctx.fillText(priceText, badgeX + badgeWidth / 2, y);
    } finally {
        t.ctx.restore();
    }
}

/**
 * Creates an enhanced horizontal drawing tool that moves the price label from
 * the left toolbar edge to the right price axis edge (TradingView style).
 */
function createRightAlignedTool(baseTool: DrawingTool): DrawingTool {
    const originalDraw = baseTool.draw;

    return {
        ...baseTool,
        draw: (t: DrawContext) => {
            if (typeof originalDraw === "function") {
                originalDraw({
                    ...t,
                    style: {
                        ...t.style,
                        showLabels: false,
                    },
                });
            }

            const y = Math.round(t.pts[0].y) + 0.5;
            drawTradingViewPriceBadge(t, y);
        },
    };
}

/**
 * Registers production-grade TradingView-style horizontal line and ray tools.
 * Safe to call multiple times (idempotent).
 */
export function registerCustomDrawingTools(): void {
    if (isRegistered) {
        return;
    }

    try {
        if (HORIZONTAL_LINE && typeof registerDrawingTool === "function") {
            registerDrawingTool(createRightAlignedTool(HORIZONTAL_LINE));
        }

        if (HORIZONTAL_RAY && typeof registerDrawingTool === "function") {
            registerDrawingTool(createRightAlignedTool(HORIZONTAL_RAY));
        }

        isRegistered = true;
    } catch (err) {
        console.warn("[StockChart] Failed to register custom drawing tools:", err);
    }
}
