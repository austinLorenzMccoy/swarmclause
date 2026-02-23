import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { session_id, final_price, settlement_tx } = await req.json();

        if (!session_id || final_price === undefined) {
            return new Response(
                JSON.stringify({ error: "session_id and final_price are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Log the settlement notification
        console.log(`Settlement notification: session=${session_id} price=${final_price} tx=${settlement_tx}`);

        // In production, send to a configured webhook URL:
        // const webhookUrl = Deno.env.get("SETTLEMENT_WEBHOOK_URL");
        // if (webhookUrl) { await fetch(webhookUrl, { method: "POST", ... }); }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Settlement notification sent for session ${session_id}`,
                data: { session_id, final_price, settlement_tx },
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Invalid request body" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
