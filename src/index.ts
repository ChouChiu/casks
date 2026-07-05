import { main } from "./features/cask-generation";

main().catch((err) => {
	console.error("Error:", err.message);
	process.exit(1);
});
