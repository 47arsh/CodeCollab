const vm = require("vm");

async function executeCode(code) {

    const output = [];

    const sandbox = {
        console: {
            log: (...args) => {
                output.push(args.join(" "));
            }
        }
    };

    const context = vm.createContext(sandbox);

    try {

        vm.runInContext(
            code,
            context,
            {
                timeout: 3000
            }
        );

        return {
            stdout: output.join("\n"),
            stderr: "",
            exitCode: 0
        };

    } catch (error) {

        return {
            stdout: "",
            stderr: error.toString(),
            exitCode: 1
        };

    }

}

module.exports = executeCode;