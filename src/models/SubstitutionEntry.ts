/**
 * Модел на запис за заместващ час.
 */
class SubstitutionEntry {
    constructor(
      public date: string,
      public time: number,
      public group: string,
      public shift: 'first' | 'second',
      public room: string | null,
      public absentTeacher: { id: string, name: string, position: string }, // може да няма отсъстващ учител
      public substitute?: { id: string, name: string, position: string } // може да няма заместник
    ) {}
  }
  