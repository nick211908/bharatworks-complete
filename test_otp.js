async function test() {
    const res = await fetch("http://localhost:3000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+919999900001" })
    });
    const data = await res.json();
    console.log("Response:", data);
}
test();
