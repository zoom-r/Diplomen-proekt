/**
 * Модел на един учебен час от разписанието.
 */
class ClassEntry {
    constructor(
      public day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
      public time: number,
      public shift: 'first' | 'second',
      public group: string,
      public room: string
    ) {}
  }
  