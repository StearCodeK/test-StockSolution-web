// lib/validationSchemas.js


import { z } from 'zod';

export const registroSchema = z.object({
    inventoryDate: z.string().min(1, "La fecha de inventario es requerida"),
    nextDispatch: z.string().min(1, "La fecha de próximo despacho es requerida"),
    previousInventory: z.number().min(0, "El inventario anterior no puede ser negativo"),
    dispatched: z.number().min(0, "El despacho no puede ser negativo"),
    exchange: z.number().min(0, "El cambio por cambio no puede ser negativo"),
    initialTotal: z.number().min(0, "El total inicial no puede ser negativo"),
    finalInventory: z.number().min(0, "El inventario final no puede ser negativo"),
    expirationReturns: z.number().min(0, "Las devoluciones por vencimiento no pueden ser negativas"),
    qualityReturns: z.number().min(0, "Las devoluciones por calidad no pueden ser negativas"),
    sales: z.number().min(0, "Las ventas no pueden ser negativas"),
    suggested: z.number().min(0, "El sugerido no puede ser negativo"),
    price: z.number().min(0, "El precio no puede ser negativo"),
    quantity: z.number().min(0, "La cantidad no puede ser negativa"),
    orderTotal: z.number().min(0, "El total no puede ser negativo"),
    expirationReturns: z.number().min(0, "El valor no puede ser negativo")
}).refine(
    (data) => {
        if (!data.inventoryDate || !data.nextDispatch) return true; // Ya lo valida arriba
        const inv = new Date(data.inventoryDate);
        const next = new Date(data.nextDispatch);
        // Sumar 1 día a inventoryDate y comparar con nextDispatch
        inv.setDate(inv.getDate() + 1);
        return (
            inv.getFullYear() === next.getFullYear() &&
            inv.getMonth() === next.getMonth() &&
            inv.getDate() === next.getDate()
        );
    },
    {
        message: "La fecha de inventario debe ser un día antes de la fecha de próximo despacho",
        path: ["inventoryDate"]
    }
);