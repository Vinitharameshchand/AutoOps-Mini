import { executeAction } from '../agents/executionAgent.js';

console.log("🤖 Starting Autonomous Fix Demonstration...");

const decision = {
    decision: 'fix_code',
    reason: 'Manual override for demonstration purposes.'
};

console.log(`📝 Decision: ${JSON.stringify(decision, null, 2)}`);

executeAction(decision).then(result => {
    console.log("✅ Execution Result:", result);
    console.log("🚀 Autonomy Demonstration Complete.");
}).catch(err => {
    console.error("❌ Error:", err);
});
