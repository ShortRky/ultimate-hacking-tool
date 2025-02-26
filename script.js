class WebLinux {
    constructor() {
        this.input = document.getElementById('input');
        this.output = document.getElementById('output');
        this.history = [];
        this.historyIndex = -1;
        this.commands = {
            'help': this.help,
            'clear': this.clear,
            'ls': this.ls,
            'echo': this.echo,
            'mkdir': this.mkdir,
            'rmdir': this.rmdir,
            'touch': this.touch,
            'rm': this.rm,
        };
        this.fs = {
            'home': { type: 'dir', children: {} },
        };
        this.cwd = ['home'];

        this.init();
    }

    init() {
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        this.printWelcome();
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = this.input.innerText.trim();
            this.processCommand(command);
            this.input.innerText = '';
            this.history.push(command);
            this.historyIndex = this.history.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.innerText = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.innerText = this.history[this.historyIndex];
            }
        }
    }

    processCommand(command) {
        const [cmd, ...args] = command.split(' ');
        const handler = this.commands[cmd] || this.invalidCommand;
        handler.call(this, args);
        this.scrollToBottom();
    }

    printWelcome() {
        this.printLine('Web Linux v1.0.0 - Type "help" for commands');
    }

    printLine(text) {
        this.output.innerHTML += text + '\n';
    }

    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }

    // Command implementations
    help() {
        this.printLine('Available commands:');
        Object.keys(this.commands).forEach(cmd => this.printLine(`- ${cmd}`));
    }

    clear() {
        this.output.innerHTML = '';
    }

    ls() {
        let current = this.fs;
        for (const dir of this.cwd) {
            current = current[dir].children;
        }
        const items = Object.keys(current).filter(k => current[k].type === 'dir');
        this.printLine(items.join(' '));
    }

    echo(args) {
        this.printLine(args.join(' '));
    }

    mkdir(args) {
        if (!args.length) return this.printLine('Usage: mkdir <dirname>');
        const dirname = args[0];
        let current = this.fs;
        for (const dir of this.cwd) {
            current = current[dir].children;
        }
        if (!current[dirname]) {
            current[dirname] = { type: 'dir', children: {} };
        }
    }

    rmdir(args) {
        if (!args.length) return this.printLine('Usage: rmdir <dirname>');
        const dirname = args[0];
        let current = this.fs;
        for (const dir of this.cwd) {
            current = current[dir].children;
        }
        if (current[dirname]?.type === 'dir') {
            delete current[dirname];
        }
    }

    touch(args) {
        if (!args.length) return this.printLine('Usage: touch <filename>');
        const filename = args[0];
        let current = this.fs;
        for (const dir of this.cwd) {
            current = current[dir].children;
        }
        current[filename] = { type: 'file', content: '' };
    }

    rm(args) {
        if (!args.length) return this.printLine('Usage: rm <filename>');
        const filename = args[0];
        let current = this.fs;
        for (const dir of this.cwd) {
            current = current[dir].children;
        }
        if (current[filename]?.type === 'file') {
            delete current[filename];
        }
    }

    invalidCommand(cmd) {
        this.printLine(`Command not found: ${cmd}. Type "help" for available commands`);
    }
}

// Initialize terminal when page loads
window.onload = () => new WebLinux();