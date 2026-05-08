export class BaseAgent {
  constructor(name, emoji, color) {
    this.name = name;
    this.emoji = emoji;
    this.color = color;
  }

  async execute(input, emitStatus) {
    const emit = emitStatus || (() => {});
    emit({ agent: this.name, emoji: this.emoji, color: this.color, status: 'working', message: `${this.name} is processing...` });
    
    try {
      const result = await this.run(input);
      emit({ agent: this.name, emoji: this.emoji, color: this.color, status: 'done', message: `${this.name} completed`, result });
      return result;
    } catch (error) {
      emit({ agent: this.name, emoji: this.emoji, color: this.color, status: 'error', message: `${this.name} encountered an error: ${error.message}` });
      throw error;
    }
  }

  async run(input) {
    throw new Error('Subclass must implement run()');
  }
}
