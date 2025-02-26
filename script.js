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
            'cd': this.cd,
            'upload': this.upload,
            'draw': this.draw,
            'open': this.open
        };
        this.fs = {
            'home': { type: 'dir', children: {} },
        };
        this.cwd = ['home'];

        this.services = {
            'google': 'https://google.com',
            'youtube': 'https://youtube.com',
            'scholar': 'https://scholar.google.com',
            'spotify': 'https://open.spotify.com',
            'github': 'https://github.com',
            'gmail': 'https://mail.google.com'
        };

        this.drawings = {
            'goku': [
                "   XXXXX   ",
                "  X     X  ",
                " X  XXX  X ",
                "X   X X   X",
                "X   XXX   X",
                " X  XXX  X ",
                "  X     X  ",
                "   XXXXX   "
            ]
        };

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
                this.moveCursorToEnd();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.innerText = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.innerText = '';
            }
            this.moveCursorToEnd();
        }
    }

    moveCursorToEnd() {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(this.input);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    processCommand(command) {
        const [cmd, ...args] = command.split(' ');
        const handler = this.commands[cmd] || this.invalidCommand;
        handler.call(this, args);
        this.scrollToBottom();
    }

    printWelcome() {
        this.printLine('Web Linux v1.1.0 - Type "help" for commands');
    }

    printLine(text) {
        const div = document.createElement('div');
        div.textContent = text;
        this.output.appendChild(div);
    }

    scrollToBottom() {
        this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
    }

    help() {
        this.printLine('Available commands:');
        Object.keys(this.commands).forEach(cmd => this.printLine(`- ${cmd}`));
        this.printLine('UPLOAD: Upload files to current directory');
        this.printLine('DRAW: Predefined art (goku) or custom X-block');
        this.printLine('OPEN: google, youtube, scholar, spotify, github, gmail');
    }

    clear() {
        this.output.innerHTML = '';
    }

    ls() {
        let current = this.fs;
        for (const dir of this.cwd) {
            current = current[dir].children;
        }
        const items = Object.keys(current).map(k => 
            current[k].type === 'dir' ? `${k}/` : k
        );
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
        if (current[dirname]) {
            return this.printLine(`mkdir: cannot create directory '${dirname}': File exists`);
        }
        current[dirname] = { type: 'dir', children: {} };
    }

    rmdir(args) {
        if (!args.length) return this.printLine('Usage: rmdir <dirname>');
        const dirname = args[0];
        let current = this.fs;
        for (const dir of this.cwd) {
            current = current[dir].children;
        }
        if (!current[dirname]) {
            return this.printLine(`rmdir: failed to remove '${dirname}': No such directory`);
        }
        if (current[dirname].type !== 'dir') {
            return this.printLine(`rmdir: failed to remove '${dirname}': Not a directory`);
        }
        delete current[dirname];
    }

    touch(args) {
        if (!args.length) return this.printLine('Usage: touch <filename>');
        const filename = args[0];
        let current = this.fs;
        for (const dir of this.cwd) {
            current = current[dir].children;
        }
        if (current[filename]) {
            return this.printLine(`touch: cannot create file '${filename}': File exists`);
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
        if (!current[filename]) {
            return this.printLine(`rm: cannot remove '${filename}': No such file`);
        }
        if (current[filename].type !== 'file') {
            return this.printLine(`rm: cannot remove '${filename}': Is a directory`);
        }
        delete current[filename];
    }

    cd(args) {
        if (!args.length) return this.printLine('Usage: cd <directory>');
        const target = args[0];
        let newCwd = [...this.cwd];
        
        if (target === '..') {
            if (newCwd.length > 1) {
                newCwd.pop();
            }
        } else {
            let current = this.fs;
            for (const dir of newCwd) {
                current = current[dir].children;
            }
            if (!current[target] || current[target].type !== 'dir') {
                return this.printLine(`cd: no such directory: ${target}`);
            }
            newCwd.push(target);
        }
        
        this.cwd = newCwd;
    }

    upload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                let current = this.fs;
                for (const dir of this.cwd) {
                    current = current[dir].children;
                }
                
                if (current[file.name]) {
                    this.printLine(`upload: cannot upload '${file.name}': File exists`);
                } else {
                    current[file.name] = {
                        type: 'file',
                        content: event.target.result
                    };
                    this.printLine(`Uploaded ${file.name} (${file.size} bytes)`);
                }
            };
            reader.readAsText(file);
        });

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    draw(args) {
        if (!args.length) {
            return this.printLine('Usage: draw <character> or <width> <height>\nPredefined: goku');
        }

        const drawingName = args[0].toLowerCase();
        if (this.drawings[drawingName]) {
            this.drawings[drawingName].forEach(line => this.printLine(line));
            return;
        }

        if (args.length < 2) {
            return this.printLine('Invalid command. Usage:\ndraw <character> - Predefined art\ndraw <width> <height> - Custom X-block');
        }

        const width = parseInt(args[0], 10);
        const height = parseInt(args[1], 10);
        
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            return this.printLine('draw: invalid dimensions');
        }
        
        const line = 'X'.repeat(width);
        for (let i = 0; i < height; i++) {
            this.printLine(line);
        }
    }

    open(args) {
        if (!args.length) {
            return this.printLine('Usage: open <service>\nAvailable: ' + 
                Object.keys(this.services).join(', '));
        }

        const service = args[0].toLowerCase();
        if (this.services[service]) {
            window.open(this.services[service], '_blank');
            this.printLine(`Opened ${service}`);
        } else {
            this.printLine(`Unknown service: ${service}. Available: ${Object.keys(this.services).join(', ')}`);
        }
    }

    invalidCommand(cmd) {
        this.printLine(`Command not found: ${cmd}. Type "help" for available commands`);
    }
}

window.onload = () => new WebLinux();