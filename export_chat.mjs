import fs from 'fs';
import readline from 'readline';

const logPath = '~/.gemini/antigravity-ide/brain/c1xxx-xxx-xxx-xxx-1ad8xxx/.system_generated/logs/transcript_full.jsonl';
const outPath = './Full_Chat_History.md';

async function convertLogToMarkdown() {
    console.log(`Reading from: ${logPath}`);
    console.log(`Writing to: ${outPath}`);

    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const writeStream = fs.createWriteStream(outPath);
    writeStream.write('# 完整对话历史记录 (Full Chat History)\n\n');
    writeStream.write('> 这是由 Antigravity 自动导出的完整对话历史记录。\n\n');

    let stepCount = 0;

    for await (const line of rl) {
        if (!line.trim()) continue;

        try {
            const step = JSON.parse(line);
            
            // Only output User messages and Assistant responses to keep the markdown readable
            if (step.type === 'USER_INPUT') {
                writeStream.write(`---\n## 🧑‍💻 You (Step ${step.step_index})\n\n`);
                writeStream.write(`${step.content || '(Empty)'}\n\n`);
            } 
            else if (step.type === 'PLANNER_RESPONSE') {
                writeStream.write(`---\n## 🤖 Antigravity (Step ${step.step_index})\n\n`);
                
                // If there's text content, output it
                if (step.content) {
                    writeStream.write(`${step.content}\n\n`);
                }

                // If there are tool calls, we can optionally list them 
                if (step.tool_calls && step.tool_calls.length > 0) {
                    writeStream.write(`**[🛠️ Tools Executed]**:\n`);
                    for (const tool of step.tool_calls) {
                        writeStream.write(`* \`${tool.name}\`\n`);
                    }
                    writeStream.write('\n');
                }
            }
            stepCount++;
        } catch (err) {
            console.error(`Error parsing JSON on a line: ${err.message}`);
        }
    }

    writeStream.end();
    console.log(`Successfully converted ${stepCount} steps. Saved to ${outPath}`);
}

convertLogToMarkdown().catch(console.error);
