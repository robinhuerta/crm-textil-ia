exports.handler = async (event, context) => {
    // 1. Configuración Hardcoded
    const SUPABASE_URL = "https://zplvreuiuosmmeoeaeaz.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbHZyZXVpdW9zbW1lb2VhZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDc1MDcsImV4cCI6MjA4NTIyMzUwN30.NZE9qW4rKuZ_GZ2Xu2W3qo_vnKwO1Tud6OOAypnRg14";

    // 2. Solo permitir POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method not allowed"
        };
    }

    try {
        // 3. Parsear Body (Legacy: event.body es string)
        const body = JSON.parse(event.body);

        // 4. Headers para Supabase
        const headers = {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Prefer": "return=minimal"
        };so 

        // 5. INTENTO 1: radio_greetings
        let response = await fetch(`${SUPABASE_URL}/rest/v1/radio_greetings`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });

        if (response.ok) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ success: true, table: "radio_greetings" })
            };
        }

        // 6. Si falla con 404, INTENTO 2: radio_saludos
        if (response.status === 404) {
            console.log("Retrying with radio_saludos...");
            response = await fetch(`${SUPABASE_URL}/rest/v1/radio_saludos`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body)
            });

            if (response.ok) {
                return {
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ success: true, table: "radio_saludos" })
                };
            }
        }

        // 7. Si falla todo
        const errorText = await response.text();
        return {
            statusCode: response.status,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: false, error: errorText, status: response.status })
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack,
                node_version: process.version
            })
        };
    }
};
