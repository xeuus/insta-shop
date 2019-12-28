import {Observable} from "coreact";

interface HashMap<T> {
  [key: string]: T
}

export interface Process {
  status: 'none' | 'pending' | 'succeed' | 'failed'
  message: string
  context: any
  validation: HashMap<string>
}

export class ParallelJob {
  @Observable processes: HashMap<Process> = {};

  killProcess(name: string) {
    this.processes[name] = null;
  }

  getProcess(name: string) {
    return this.processes[name] || {
      status: 'none',
      validation: {},
      message: '',
      context: null,
    };
  }

  protected async newProcess(name: string) {
    const obj = this.getProcess(name);
    obj.status = 'pending';
    obj.message = '';
    obj.validation = {};
    obj.context = null;
    this.processes = {
      ...this.processes,
      [name]: obj,
    };
    await new Promise(a => setTimeout(a, 120));
    return {
      succeed: (message: string = '', context?: any) => {
        obj.status = 'succeed';
        obj.validation = {};
        obj.message = message;
        obj.context = context;

        this.processes = {
          ...this.processes,
          [name]: obj,
        };
      },
      failed: (message: string, validation: HashMap<string> = {}, context?: any) => {
        obj.status = 'failed';
        obj.validation = validation;
        obj.message = message;
        obj.context = context;
        this.processes = {
          ...this.processes,
          [name]: obj,
        };
      }
    };
  }
}