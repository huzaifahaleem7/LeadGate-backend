import runNumberCheck from "../src/services/idServices.service.js";

const phone = "4545454545"; 

async function testNumberCheck() {
  try {
    console.log("Fetching details for phone:", phone);
    const result = await runNumberCheck(phone);
    console.log("Mars API result:", result);
  } catch (err) {
    console.error("API error:", err);
  }}

testNumberCheck();
