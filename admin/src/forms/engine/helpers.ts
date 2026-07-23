import { FormDefinition, FormResponseMap } from './types';

export class FormNavigator {
  private currentSectionIndex = 0;
  private definition: FormDefinition;

  constructor(definition: FormDefinition) {
    this.definition = definition;
  }

  public getCurrentSection() {
    return this.definition.sections[this.currentSectionIndex];
  }

  public getSectionIndex() {
    return this.currentSectionIndex;
  }

  public getTotalSections() {
    return this.definition.sections.length;
  }

  public canGoNext(): boolean {
    return this.currentSectionIndex < this.definition.sections.length - 1;
  }

  public canGoPrev(): boolean {
    return this.currentSectionIndex > 0;
  }

  public next(): boolean {
    if (this.canGoNext()) {
      this.currentSectionIndex++;
      return true;
    }
    return false;
  }

  public prev(): boolean {
    if (this.canGoPrev()) {
      this.currentSectionIndex--;
      return true;
    }
    return false;
  }
}

export class FormResponseMapper {
  static toPayload(definition: FormDefinition, responses: FormResponseMap) {
    return {
      formId: definition.id,
      version: definition.version,
      responses,
      submittedAt: new Date().toISOString(),
    };
  }
}

export class AttachmentProvider {
  static async uploadFile(file: File | Blob, filename: string): Promise<string> {
    return `https://storage.nabs.com/uploads/${Date.now()}_${filename}`;
  }
}

export class DraftStorage {
  static saveDraft(key: string, data: any) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`nabs_draft_${key}`, JSON.stringify(data));
    }
  }

  static getDraft(key: string): any | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = window.localStorage.getItem(`nabs_draft_${key}`);
      return item ? JSON.parse(item) : null;
    }
    return null;
  }

  static clearDraft(key: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(`nabs_draft_${key}`);
    }
  }
}
